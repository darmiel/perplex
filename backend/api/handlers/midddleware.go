package handlers

import (
	"github.com/darmiel/perplex/api/presenter"
	"github.com/darmiel/perplex/api/services"
	"github.com/darmiel/perplex/pkg/model"
	"github.com/darmiel/perplex/pkg/util"
	"github.com/gofiber/fiber/v2"
)

type MiddlewareHandler struct {
	userSrv    services.UserService
	projectSrv services.ProjectService
	meetingSrv services.MeetingService
}

func NewMiddlewareHandler(
	userSrv services.UserService,
	projectService services.ProjectService,
	meetingSrv services.MeetingService,
) *MiddlewareHandler {
	return &MiddlewareHandler{
		userSrv,
		projectService,
		meetingSrv,
	}
}

func (a MiddlewareHandler) UserLocalsMiddleware(ctx *fiber.Ctx) error {
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

func (a MiddlewareHandler) TagLocalsMiddleware(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	tagID, err := ctx.ParamsInt("tag_id")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	tag, err := a.projectSrv.FindTag(uint(tagID))
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

// MeetingLocalsMiddleware checks if the meeting exists and belongs to the project.
// It also adds the meeting to the context.
func (a MiddlewareHandler) MeetingLocalsMiddleware(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	meetingID, err := ctx.ParamsInt("meeting_id")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	meeting, err := a.meetingSrv.GetMeeting(uint(meetingID))
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(err))
	}
	if meeting.ProjectID != p.ID {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrNotFound))
	}
	ctx.Locals("meeting", *meeting)
	return ctx.Next()
}
