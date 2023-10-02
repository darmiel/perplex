package handlers

import (
	"errors"
	"fmt"
	"github.com/darmiel/perplex/api/presenter"
	"github.com/darmiel/perplex/api/services"
	"github.com/darmiel/perplex/pkg/model"
	"github.com/darmiel/perplex/pkg/util"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/utils"
	gofiberfirebaseauth "github.com/ralf-life/gofiber-firebaseauth"
	"go.uber.org/zap"
	"strconv"
)

const (
	// MaxCommentLength - 8 MiB
	MaxCommentLength = 8 * 1024 * 1024
	// MinCommentLength - 1
	MinCommentLength = 1
)

var (
	ErrCommentTooLong       = errors.New("comment too long (max. 8 MiB)")
	ErrCommentTooShort      = errors.New("comment too short (min 1)")
	ErrInvalidCommentTarget = errors.New("invalid comment target")
)

type CommentHandler struct {
	srv                       services.CommentService
	meetSrv                   services.MeetingService
	topicSrv                  services.TopicService
	actionSrv                 services.ActionService
	projectSrv                services.ProjectService
	userSrv                   services.UserService
	logger                    *zap.SugaredLogger
	validator                 *validator.Validate
	commentTypes              map[string]genericCommentAddHandler
	commentTypesListTransform map[string]func(targetID uint, comment *model.Comment)
	commentTypesListPost      map[string][]func(targetID uint, comment *model.Comment) error
}

func NewCommentHandler(
	srv services.CommentService,
	meetSrv services.MeetingService,
	topicSrv services.TopicService,
	actionSrv services.ActionService,
	projectSrv services.ProjectService,
	userSrv services.UserService,
	logger *zap.SugaredLogger,
	validator *validator.Validate,
) *CommentHandler {
	h := &CommentHandler{
		srv:        srv,
		meetSrv:    meetSrv,
		topicSrv:   topicSrv,
		actionSrv:  actionSrv,
		projectSrv: projectSrv,
		userSrv:    userSrv,
		logger:     logger,
		validator:  validator,
	}
	h.commentTypes = map[string]genericCommentAddHandler{
		"topic":   h.addTopicComment,
		"action":  h.addActionComment,
		"meeting": h.addMeetingComment,
		"project": h.addProjectComment,
	}
	h.commentTypesListTransform = map[string]func(targetID uint, comment *model.Comment){
		"topic": func(targetID uint, comment *model.Comment) {
			comment.TopicID = &targetID
		},
		"action": func(targetID uint, comment *model.Comment) {
			comment.ActionID = &targetID
		},
		"meeting": func(targetID uint, comment *model.Comment) {
			comment.MeetingID = &targetID
		},
		"project": func(targetID uint, comment *model.Comment) {
			comment.ProjectID = &targetID
		},
	}
	h.commentTypesListPost = map[string][]func(targetID uint, comment *model.Comment) error{
		"topic": {
			func(topicID uint, comment *model.Comment) error {
				// get topic
				topic, err := h.topicSrv.GetTopic(topicID, "SubscribedUsers")
				if err != nil {
					return err
				}
				// get meeting
				meeting, err := h.meetSrv.GetMeeting(topic.MeetingID)
				if err != nil {
					return err
				}
				// get project
				project, err := h.projectSrv.FindProject(meeting.ProjectID, "Users")
				if err != nil {
					return err
				}
				// get author name
				var authorName string
				if author, err := h.userSrv.FindUser(comment.AuthorID); err == nil {
					authorName = author.UserName
				} else {
					authorName = "Unknown"
				}
				// send message to all subscribed users
				for _, u := range topic.SubscribedUsers {
					// the author doesn't need to be notified
					// because... well, they wrote the comment, they should know
					if u.ID == comment.AuthorID {
						continue
					}
					// check if user belongs to project
					if _, ok := util.Any(project.Users, func(t model.User) bool {
						return t.ID == u.ID
					}); !ok && u.ID != project.OwnerID {
						continue
					}
					// send subscription notification
					if err = userSrv.CreateNotification(
						u.ID,
						fmt.Sprintf("%s commented %s", authorName, topic.Title),
						"comment",
						util.Truncate(comment.Content, 32),
						fmt.Sprintf("/project/%d/meeting/%d/topic/%d#comment-%d",
							project.ID, meeting.ID, topic.ID, comment.ID),
						"Go to Comment",
					); err != nil {
						return err
					}
				}
				return nil
			},
			func(topicID uint, comment *model.Comment) error {
				// check if the comment was the first comment from the user
				comments, err := h.srv.FindComments(func(c *model.Comment) {
					c.AuthorID = comment.AuthorID
					c.TopicID = comment.TopicID
				})
				if err != nil {
					return err
				}
				// we only want to subscribe to the _first_ comment
				if len(comments) > 1 {
					return nil
				}
				// we don't really care if it worked or not
				// since the user can always subscribe manually
				_ = h.topicSrv.SubscribeUser(topicID, comment.AuthorID)
				return nil
			},
		},
	}
	return h
}

// CommentLocalsMiddleware is a middleware function that retrieves the comment by ID from the request parameters
func (h *CommentHandler) CommentLocalsMiddleware(ctx *fiber.Ctx) error {
	commentID, err := ctx.ParamsInt("comment_id")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	comment, err := h.srv.GetComment(uint(commentID))
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(err))
	}
	ctx.Locals("comment", *comment)
	return ctx.Next()
}

// CommentOwnershipMiddleware is a middleware function that checks for the ownership of the comment.
// It retrieves the comment by ID from the request parameters and verifies whether
// the authenticated user is the author of this comment. If it's not the same, it returns a status of unauthorized.
// If the comment is found and the user is the author, it stores the comment in local context and continues to the next handler.
func (h *CommentHandler) CommentOwnershipMiddleware(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	c := ctx.Locals("comment").(model.Comment)
	if u.UserID != c.AuthorID {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrNoAccess))
	}
	return ctx.Next()
}

type genericCommentAddHandler func(ctx *fiber.Ctx, targetID, content string) error

func addEntityComment[T model.Ownership](
	srv services.CommentService,
	ctx *fiber.Ctx,
	targetTypeDisplay, targetID, content string,
	getEntity func(entityID uint, projectID uint) (T, error),
	populateComment func(comment *model.Comment, entity T),
	post []func(targetID uint, comment *model.Comment) error,
) error {
	entityID, err := strconv.Atoi(targetID)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	p := ctx.Locals("project").(model.Project)
	entity, err := getEntity(uint(entityID), p.ID)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(err))
	}
	if !entity.CheckProjectOwnership(p.ID) {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrNoAccess))
	}
	// create comment
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	comment, err := srv.AddComment(u.UserID, content, func(comment *model.Comment) {
		populateComment(comment, entity)
	})
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	for _, po := range post {
		if err = po(uint(entityID), comment); err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
		}
	}
	return ctx.Status(fiber.StatusCreated).
		JSON(presenter.SuccessResponse("comment created for "+targetTypeDisplay, comment))
}

func (h *CommentHandler) addTopicComment(ctx *fiber.Ctx, targetID, content string) error {
	return addEntityComment(h.srv, ctx, "topic", targetID, content,
		func(entityID uint, projectID uint) (*model.Topic, error) {
			return h.topicSrv.GetTopic(entityID, "Meeting")
		}, func(comment *model.Comment, entity *model.Topic) {
			comment.TopicID = &entity.ID
		}, h.commentTypesListPost["topic"])
}

func (h *CommentHandler) addMeetingComment(ctx *fiber.Ctx, targetID, content string) error {
	return addEntityComment(h.srv, ctx, "meeting", targetID, content,
		func(entityID uint, projectID uint) (*model.Meeting, error) {
			return h.meetSrv.GetMeeting(entityID)
		},
		func(comment *model.Comment, entity *model.Meeting) {
			comment.MeetingID = &entity.ID
		}, h.commentTypesListPost["meeting"])
}

func (h *CommentHandler) addActionComment(ctx *fiber.Ctx, targetID, content string) error {
	return addEntityComment(h.srv, ctx, "action", targetID, content,
		func(entityID uint, projectID uint) (*model.Action, error) {
			return h.actionSrv.FindAction(entityID)
		},
		func(comment *model.Comment, entity *model.Action) {
			comment.ActionID = &entity.ID
		}, h.commentTypesListPost["action"])
}

func (h *CommentHandler) addProjectComment(ctx *fiber.Ctx, targetID, content string) error {
	return addEntityComment(h.srv, ctx, "project", targetID, content,
		func(entityID uint, projectID uint) (*model.Project, error) {
			return h.projectSrv.FindProject(entityID)
		},
		func(comment *model.Comment, entity *model.Project) {
			comment.ProjectID = &entity.ID
		}, h.commentTypesListPost["project"])
}

func (h *CommentHandler) AddGenericComment(ctx *fiber.Ctx) error {
	// check comment length
	content := utils.CopyString(string(ctx.Body()))
	if len(content) > MaxCommentLength {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(ErrCommentTooLong))
	}
	if len(content) < MinCommentLength {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(ErrCommentTooShort))
	}

	// check target type and call handler
	commentTargetType := ctx.Params("comment_target_type")
	commentTargetID := ctx.Params("comment_target_id")

	if handler, ok := h.commentTypes[commentTargetType]; ok {
		return handler(ctx, commentTargetID, content)
	}
	return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(ErrInvalidCommentTarget))
}

func (h *CommentHandler) ListGenericComment(ctx *fiber.Ctx) error {
	// check target type and call handler
	commentTargetType := ctx.Params("comment_target_type")
	commentTargetID := ctx.Params("comment_target_id")

	handler, ok := h.commentTypesListTransform[commentTargetType]
	if !ok {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(ErrInvalidCommentTarget))
	}

	entityID, err := strconv.Atoi(commentTargetID)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}

	comments, err := h.srv.FindComments(func(comment *model.Comment) {
		handler(uint(entityID), comment)
	})
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusCreated).JSON(presenter.SuccessResponse("comments for topic", comments))
}

// EditComment is an endpoint function to modify the content of an existing comment.
func (h *CommentHandler) EditComment(ctx *fiber.Ctx) error {
	c := ctx.Locals("comment").(model.Comment)

	content := utils.CopyString(string(ctx.Body()))
	if err := h.srv.EditComment(c.ID, content); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("comment updated", nil))
}

// DeleteComment is an endpoint function to delete an existing comment.
func (h *CommentHandler) DeleteComment(ctx *fiber.Ctx) error {
	c := ctx.Locals("comment").(model.Comment)
	if err := h.srv.DeleteComment(c.ID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("comment deleted", nil))
}

// MarkSolutionComment creates a handler function that marks or unmarks a comment as the solution for a topic.
func (h *CommentHandler) MarkSolutionComment(mark bool) fiber.Handler {
	return func(ctx *fiber.Ctx) error {
		c := ctx.Locals("comment").(model.Comment)
		var action func(uint) error
		if mark {
			action = h.srv.MarkCommentSolution
		} else {
			action = h.srv.UnmarkCommentSolution
		}
		if err := action(c.ID); err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
		}
		return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("solution updated", nil))
	}
}
