package handlers

import (
	"github.com/darmiel/dmp/api/presenter"
	"github.com/darmiel/dmp/api/services"
	"github.com/darmiel/dmp/pkg/model"
	"github.com/darmiel/dmp/pkg/util"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	gofiberfirebaseauth "github.com/ralf-life/gofiber-firebaseauth"
	"go.uber.org/zap"
	"sort"
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
	Name        string `validate:"required,min=1,max=128,startsnotwith= ,endsnotwith= " json:"name"`
	Description string `json:"description"`
	StartDate   string `validate:"required,datetime=2006-01-02T15:04:05Z07:00" json:"start_date"`
}

// PreloadMeetingsMiddleware preloads meetings for the current project and updates the project in the locals
func (h *MeetingHandler) PreloadMeetingsMiddleware(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	if err := h.projSrv.Extend(&p, "Meetings"); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	ctx.Locals("project", p)
	return ctx.Next()
}

// MeetingAccessMiddleware checks if the requested meeting is in the current project
// and puts the fetched meeting into the locals
func (h *MeetingHandler) MeetingAccessMiddleware(ctx *fiber.Ctx) error {
	meetingID, err := ctx.ParamsInt("meeting_id")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}

	// check if meeting belongs to project
	p := ctx.Locals("project").(model.Project)
	if m, ok := util.Any(p.Meetings, func(t model.Meeting) bool {
		return t.ID == uint(meetingID)
	}); ok {
		ctx.Locals("meeting", m)
		return ctx.Next()
	}

	return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrNotFound))
}

// AddMeeting creates a new meeting for the current project
func (h *MeetingHandler) AddMeeting(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	p := ctx.Locals("project").(model.Project)
	// parse payload and time
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
	// create meeting
	created, err := h.srv.AddMeeting(p.ID, u.UserID, payload.Name, payload.Description, startTime)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusCreated).JSON(presenter.SuccessResponse("meeting created", created))
}

// GetMeetings returns a list of meetings from the current project
func (h *MeetingHandler) GetMeetings(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	// sort meetings by start date
	sort.Slice(p.Meetings, func(i, j int) bool {
		return p.Meetings[i].StartDate.After(p.Meetings[j].StartDate)
	})
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("", p.Meetings))
}

func (h *MeetingHandler) GetMeeting(ctx *fiber.Ctx) error {
	m := ctx.Locals("meeting").(model.Meeting)
	if err := h.srv.Extend(&m, "Creator"); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("meeting found", m))
}

// DeleteMeeting deletes a meeting
func (h *MeetingHandler) DeleteMeeting(ctx *fiber.Ctx) error {
	m := ctx.Locals("meeting").(model.Meeting)
	if err := h.srv.DeleteMeeting(m.ID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("meeting deleted", nil))
}

// EditMeeting edits the name and start date of a meeting
func (h *MeetingHandler) EditMeeting(ctx *fiber.Ctx) error {
	m := ctx.Locals("meeting").(model.Meeting)
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
	if err = h.srv.EditMeeting(m.ID, payload.Name, payload.Description, startTime); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("meeting edited", nil))
}
