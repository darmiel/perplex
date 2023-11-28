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
	gofiberfirebaseauth "github.com/ralf-life/gofiber-firebaseauth"
	"go.uber.org/zap"
	"sort"
	"time"
)

const MaxDescriptionLength = 1024 * 1024 // 1 MiB
var ErrDescriptionTooLong = errors.New("description too long")
var ErrEndBeforeStart = errors.New("end date before start date")

type MeetingHandler struct {
	srv       services.MeetingService
	projSrv   services.ProjectService
	userSrv   services.UserService
	logger    *zap.SugaredLogger
	validator *validator.Validate
}

func NewMeetingHandler(
	srv services.MeetingService,
	projSrv services.ProjectService,
	userSrv services.UserService,
	logger *zap.SugaredLogger,
	validator *validator.Validate,
) *MeetingHandler {
	return &MeetingHandler{srv, projSrv, userSrv, logger, validator}
}

type meetingDto struct {
	Name        string `validate:"required,min=1,max=128,startsnotwith= ,endsnotwith= " json:"name"`
	Description string `json:"description"`
	StartDate   string `validate:"required,datetime=2006-01-02T15:04:05Z07:00" json:"start_date"`
	EndDate     string `validate:"required,datetime=2006-01-02T15:04:05Z07:00" json:"end_date"`
}

func (h *MeetingHandler) ValidateMeetingDto(dto *meetingDto) (*time.Time, *time.Time, error) {
	if err := h.validator.Struct(dto); err != nil {
		return nil, nil, err
	}
	if len(dto.Description) > MaxDescriptionLength {
		return nil, nil, ErrDescriptionTooLong
	}
	startTime, err := time.Parse(time.RFC3339, dto.StartDate)
	if err != nil {
		return nil, nil, err
	}
	endTime, err := time.Parse(time.RFC3339, dto.EndDate)
	if err != nil {
		return nil, nil, err
	}
	if endTime.Before(startTime) {
		return nil, nil, ErrEndBeforeStart
	}
	return &startTime, &endTime, nil
}

// PreloadMeetingsMiddleware preloads meetings for the current project and updates the project in the locals
func (h *MeetingHandler) PreloadMeetingsMiddleware(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	if err := h.projSrv.Extend(&p, "Meetings", "Meetings.Tags", "Meetings.AssignedUsers"); err != nil {
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
	m, ok := util.Any(p.Meetings, func(t model.Meeting) bool {
		return t.ID == uint(meetingID)
	})
	if !ok {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrNotFound))
	}

	// append assigned users
	if err = h.srv.Extend(&m, "AssignedUsers", "Tags"); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	ctx.Locals("meeting", m)
	return ctx.Next()
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
	startTime, endTime, err := h.ValidateMeetingDto(&payload)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	// create meeting
	created, err := h.srv.AddMeeting(p.ID, u.UserID, payload.Name, payload.Description, *startTime, *endTime)
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
	startTime, endTime, err := h.ValidateMeetingDto(&payload)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err = h.srv.EditMeeting(m.ID, payload.Name, payload.Description, *startTime, *endTime); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("meeting edited", nil))
}

func (h *MeetingHandler) LinkUser(ctx *fiber.Ctx) error {
	meeting := ctx.Locals("meeting").(model.Meeting)
	projectUser := ctx.Locals("project_user").(model.User)

	// create notification for linked user if not self link
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	if u.UserID != projectUser.ID {
		if err := h.userSrv.CreateNotification(
			projectUser.ID,
			meeting.Name,
			"meeting",
			"you have been assigned to a meeting",
			fmt.Sprintf("/project/%d/meeting/%d", meeting.ProjectID, meeting.ID),
			"Go to Meeting"); err != nil {
			h.logger.Warnf("cannot create notification for user %s: %v", projectUser.ID, err)
		}
	}

	return fiberResponseNoVal(ctx, "linked user", h.srv.LinkUser(meeting.ID, projectUser.ID))
}

func (h *MeetingHandler) UnlinkUser(ctx *fiber.Ctx) error {
	meeting := ctx.Locals("meeting").(model.Meeting)
	projectUser := ctx.Locals("project_user").(model.User)
	return fiberResponseNoVal(ctx, "unlinked user", h.srv.UnlinkUser(meeting.ID, projectUser.ID))
}

// LinkTag and UnlinkTag

func (h *MeetingHandler) LinkTag(ctx *fiber.Ctx) error {
	meeting := ctx.Locals("meeting").(model.Meeting)
	tag := ctx.Locals("tag").(model.Tag)
	return fiberResponseNoVal(ctx, "linked tag", h.srv.LinkTag(meeting.ID, tag.ID))
}

func (h *MeetingHandler) UnlinkTag(ctx *fiber.Ctx) error {
	meeting := ctx.Locals("meeting").(model.Meeting)
	tag := ctx.Locals("tag").(model.Tag)
	return fiberResponseNoVal(ctx, "unlinked tag", h.srv.UnlinkTag(meeting.ID, tag.ID))
}

type editReadyPayload struct {
	Ready bool `json:"ready"`
}

func (h *MeetingHandler) EditReady(ctx *fiber.Ctx) error {
	m := ctx.Locals("meeting").(model.Meeting)
	var payload editReadyPayload
	if err := ctx.BodyParser(&payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := h.srv.SetReady(m.ID, payload.Ready); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("meeting edited", nil))
}
