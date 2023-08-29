package handlers

import (
	"database/sql"
	"errors"
	"github.com/darmiel/perplex/api/presenter"
	"github.com/darmiel/perplex/api/services"
	"github.com/darmiel/perplex/pkg/model"
	"github.com/darmiel/perplex/pkg/util"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	gofiberfirebaseauth "github.com/ralf-life/gofiber-firebaseauth"
	"go.uber.org/zap"
	"time"
)

var ErrNotImplemented = errors.New("not implemented yet")

type ActionHandler struct {
	srv        services.ActionService
	topicSrv   services.TopicService
	meetingSrv services.MeetingService
	userSrv    services.UserService
	logger     *zap.SugaredLogger
	validator  *validator.Validate
}

func NewActionHandler(
	srv services.ActionService,
	topicSrv services.TopicService,
	meetingSrv services.MeetingService,
	userSrv services.UserService,
	logger *zap.SugaredLogger,
	validator *validator.Validate,
) *ActionHandler {
	return &ActionHandler{srv, topicSrv, meetingSrv, userSrv, logger, validator}
}

func (a ActionHandler) ListActionsForProject(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	actions, err := a.srv.FindActionsByProject(p.ID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("actions by project", actions))
}

type actionDto struct {
	Title       string `json:"title" validate:"required,min=1,max=64"`
	Description string `json:"description"`
	DueDate     string `json:"due_date" validate:"omitempty,datetime=2006-01-02T15:04:05Z07:00"`
	PriorityID  uint   `json:"priority_id"`
}

func (a ActionHandler) ValidateActionDto(dto *actionDto) (dueDate sql.NullTime, err error) {
	if err = a.validator.Struct(dto); err != nil {
		return
	}
	if len(dto.Description) > MaxDescriptionLength {
		err = ErrDescriptionTooLong
		return
	}
	if dto.DueDate != "" {
		var dueTime time.Time
		if dueTime, err = time.Parse(time.RFC3339, dto.DueDate); err != nil {
			return
		}
		dueDate = sql.NullTime{Time: dueTime, Valid: true}
	}
	return
}

func fiberResponseNoVal(ctx *fiber.Ctx, message string, err error) error {
	return fiberResponse[*bool](ctx, message, nil, err)
}

func fiberResponse[T any](ctx *fiber.Ctx, message string, value T, err error) error {
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse(message, value))
}

func (a ActionHandler) CreateAction(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	var dto actionDto
	if err := ctx.BodyParser(&dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	dueDate, err := a.ValidateActionDto(&dto)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	// create action
	action, err := a.srv.CreateAction(dto.Title, dto.Description, dueDate, dto.PriorityID, p.ID, u.UserID)
	return fiberResponse(ctx, "created action", action, err)
}

func (a ActionHandler) ListActionsForUser(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	actions, err := a.srv.FindActionsByUser(u.UserID)
	return fiberResponse(ctx, "actions by user", actions, err)
}

// :action_id

func (a ActionHandler) ActionLocalsMiddleware(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	actionID, err := ctx.ParamsInt("action_id")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	action, err := a.srv.FindAction(uint(actionID))
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(err))
	}
	if action.ProjectID != p.ID {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrNotFound))
	}
	ctx.Locals("action", *action)
	return ctx.Next()
}

func (a ActionHandler) FindAction(ctx *fiber.Ctx) error {
	action := ctx.Locals("action").(model.Action)
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("found action", action))
}

func (a ActionHandler) EditAction(ctx *fiber.Ctx) error {
	action := ctx.Locals("action").(model.Action)
	var dto actionDto
	if err := ctx.BodyParser(&dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	dueDate, err := a.ValidateActionDto(&dto)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	// edit action
	return fiberResponseNoVal(ctx, "created action",
		a.srv.EditAction(action.ID, dto.Title, dto.Description, dueDate, dto.PriorityID))
}

func (a ActionHandler) DeleteAction(ctx *fiber.Ctx) error {
	action := ctx.Locals("action").(model.Action)
	return fiberResponseNoVal(ctx, "deleted action", a.srv.DeleteAction(action.ID))
}

// :action_id/topic/:topic_id

// TopicLocalsMiddleware checks if the topic exists and belongs to the project.
// It also adds the topic and meeting to the context.
func (a ActionHandler) TopicLocalsMiddleware(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	topicID, err := ctx.ParamsInt("topic_id")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	topic, err := a.topicSrv.GetTopic(uint(topicID))
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(err))
	}
	ctx.Locals("topic", *topic)
	meeting, err := a.meetingSrv.GetMeeting(topic.MeetingID)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(err))
	}
	ctx.Locals("meeting", *meeting)
	if meeting.ProjectID != p.ID {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrNotFound))
	}
	return ctx.Next()
}

func (a ActionHandler) ListActionsForTopic(ctx *fiber.Ctx) error {
	topic := ctx.Locals("topic").(model.Topic)
	actions, err := a.srv.FindActionsByTopic(topic.ID)
	return fiberResponse(ctx, "actions by topic", actions, err)
}

func (a ActionHandler) LinkTopic(ctx *fiber.Ctx) error {
	action := ctx.Locals("action").(model.Action)
	topic := ctx.Locals("topic").(model.Topic)
	return fiberResponseNoVal(ctx, "linked topic", a.srv.LinkTopic(action.ID, topic.ID))
}

func (a ActionHandler) UnlinkTopic(ctx *fiber.Ctx) error {
	action := ctx.Locals("action").(model.Action)
	topic := ctx.Locals("topic").(model.Topic)
	return fiberResponseNoVal(ctx, "unlinked topic", a.srv.UnlinkTopic(action.ID, topic.ID))
}

// :action_id/user/:user_id

func (a ActionHandler) UserLocalsMiddleware(ctx *fiber.Ctx) error {
	userID := ctx.Params("user_id")
	user, err := a.userSrv.FindUser(userID)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(err))
	}
	ctx.Locals("project_user", *user)

	// check if user is in project
	p := ctx.Locals("project").(model.Project)
	if !util.HasAccess(&p, userID) {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrNotFound))
	}

	return ctx.Next()
}

func (a ActionHandler) LinkUser(ctx *fiber.Ctx) error {
	action := ctx.Locals("action").(model.Action)
	projectUser := ctx.Locals("project_user").(model.User)
	return fiberResponseNoVal(ctx, "linked user", a.srv.LinkUser(action.ID, projectUser.ID))
}

func (a ActionHandler) UnlinkUser(ctx *fiber.Ctx) error {
	action := ctx.Locals("action").(model.Action)
	projectUser := ctx.Locals("project_user").(model.User)
	return fiberResponseNoVal(ctx, "unlinked user", a.srv.UnlinkUser(action.ID, projectUser.ID))
}

// :action_id/tag/:tag_id

func (a ActionHandler) TagLocalsMiddleware(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	tagID, err := ctx.ParamsInt("tag_id")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	tag, err := a.srv.FindTag(uint(tagID))
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(err))
	}
	ctx.Locals("tag", *tag)
	// check if tag belongs to project
	if tag.ProjectID != p.ID {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrNotFound))
	}
	return ctx.Next()
}

func (a ActionHandler) LinkTag(ctx *fiber.Ctx) error {
	action := ctx.Locals("action").(model.Action)
	tag := ctx.Locals("tag").(model.Tag)
	return fiberResponseNoVal(ctx, "linked tag", a.srv.LinkTag(action.ID, tag.ID))
}

func (a ActionHandler) UnlinkTag(ctx *fiber.Ctx) error {
	action := ctx.Locals("action").(model.Action)
	tag := ctx.Locals("tag").(model.Tag)
	return fiberResponseNoVal(ctx, "unlinked tag", a.srv.UnlinkTag(action.ID, tag.ID))
}

// :action_id/close

func (a ActionHandler) CloseAction(ctx *fiber.Ctx) error {
	action := ctx.Locals("action").(model.Action)
	return fiberResponseNoVal(ctx, "closed action", a.srv.CloseAction(action.ID))
}

func (a ActionHandler) OpenAction(ctx *fiber.Ctx) error {
	action := ctx.Locals("action").(model.Action)
	return fiberResponseNoVal(ctx, "opened action", a.srv.OpenAction(action.ID))
}
