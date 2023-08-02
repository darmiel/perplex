package handlers

import (
	"github.com/darmiel/dmp/api/presenter"
	"github.com/darmiel/dmp/api/services"
	"github.com/darmiel/dmp/pkg/util"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	gofiberfirebaseauth "github.com/ralf-life/gofiber-firebaseauth"
	"go.uber.org/zap"
	"time"
)

type MeetingHandler struct {
	srv       services.MeetingService
	projSrv   services.ProjectService
	logger    *zap.SugaredLogger
	validator *validator.Validate
}

func NewMeetingHandler(
	srv services.MeetingService,
	projSrv services.ProjectService,
	logger *zap.SugaredLogger,
	validator *validator.Validate,
) *MeetingHandler {
	return &MeetingHandler{srv, projSrv, logger, validator}
}

type meetingDto struct {
	Name      string `validate:"required,proj-extended,max=36" json:"name,omitempty"`
	StartDate string `validate:"required,datetime=2006-01-02T15:04:05Z07:00" json:"start_date,omitempty"`
}

func (h *MeetingHandler) AddMeeting(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	var payload meetingDto
	if err := ctx.BodyParser(&payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := h.validator.Struct(payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	startTime, err := time.Parse(time.RFC3339, payload.StartDate)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	projectID, err := ctx.ParamsInt("project_id")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	project, err := h.projSrv.FindProjectOwnedBy(projectID, u.UserID)
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(err))
	}
	created, err := h.srv.AddMeeting(project.ID, payload.Name, startTime)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusCreated).JSON(presenter.SuccessResponse("meeting created", created))
}

func (h *MeetingHandler) GetMeetings(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	projectID, err := ctx.ParamsInt("project_id")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	project, err := h.projSrv.FindProject(uint(projectID), "Users", "Meetings")
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(err))
	}
	if !util.HasAccess(project, u.UserID) {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrNoAccess))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("", project.Meetings))
}

func (h *MeetingHandler) DeleteMeeting(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	projectID, err := ctx.ParamsInt("project_id")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	meetingID, err := ctx.ParamsInt("meeting_id")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}

	// check if user has access
	project, err := h.projSrv.FindProject(uint(projectID), "Users", "Meetings")
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(err))
	}
	if !util.HasAccess(project, u.UserID) {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrNoAccess))
	}

	// check if meeting in project
	found := false
	for _, m := range project.Meetings {
		if m.ID == uint(meetingID) {
			found = true
			break
		}
	}
	if !found {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(ErrNotFound))
	}

	if err = h.srv.DeleteMeeting(uint(meetingID)); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("meeting deleted", nil))
}

func (h *MeetingHandler) EditMeeting(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)

	var payload meetingDto
	if err := ctx.BodyParser(&payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := h.validator.Struct(payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	startTime, err := time.Parse(time.RFC3339, payload.StartDate)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}

	projectID, err := ctx.ParamsInt("project_id")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	meetingID, err := ctx.ParamsInt("meeting_id")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}

	// check if user has access
	project, err := h.projSrv.FindProject(uint(projectID), "Users", "Meetings")
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(err))
	}
	if !util.HasAccess(project, u.UserID) {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrNoAccess))
	}

	// check if meeting in project
	found := false
	for _, m := range project.Meetings {
		if m.ID == uint(meetingID) {
			found = true
			break
		}
	}
	if !found {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(ErrNotFound))
	}

	if err = h.srv.EditMeeting(uint(meetingID), payload.Name, startTime); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("meeting edited", nil))
}
