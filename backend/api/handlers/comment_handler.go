package handlers

import (
	"errors"
	"github.com/darmiel/dmp/api/presenter"
	"github.com/darmiel/dmp/api/services"
	"github.com/darmiel/dmp/pkg/model"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/utils"
	gofiberfirebaseauth "github.com/ralf-life/gofiber-firebaseauth"
	"go.uber.org/zap"
)

type CommentHandler struct {
	srv       services.CommentService
	meetSrv   services.MeetingService
	logger    *zap.SugaredLogger
	validator *validator.Validate
}

func NewCommentHandler(
	srv services.CommentService,
	meetSrv services.MeetingService,
	logger *zap.SugaredLogger,
	validator *validator.Validate,
) *CommentHandler {
	return &CommentHandler{srv, meetSrv, logger, validator}
}

const (
	// MaxCommentLength - 8 MiB
	MaxCommentLength = 8 * 1024 * 1024
)

var ErrCommentTooLong = errors.New("comment too long (max. 8 MiB)")

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

// AddComment is an endpoint function to create a new comment for a specific topic.
func (h *CommentHandler) AddComment(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	t := ctx.Locals("topic").(model.Topic)

	content := utils.CopyString(string(ctx.Body()))
	if len(content) > MaxCommentLength {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(ErrCommentTooLong))
	}
	comment, err := h.srv.AddComment(u.UserID, t.ID, content)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusCreated).JSON(presenter.SuccessResponse("comment created", comment))
}

// ListCommentsForTopic is an endpoint function to retrieve a list of all comments related to a specific topic.
func (h *CommentHandler) ListCommentsForTopic(ctx *fiber.Ctx) error {
	t := ctx.Locals("topic").(model.Topic)
	comments, err := h.srv.ListCommentsForTopic(t.ID)
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
