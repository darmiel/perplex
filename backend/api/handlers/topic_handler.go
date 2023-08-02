package handlers

import (
	"errors"
	"github.com/darmiel/dmp/api/presenter"
	"github.com/darmiel/dmp/api/services"
	"github.com/darmiel/dmp/pkg/model"
	"github.com/darmiel/dmp/pkg/util"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	gofiberfirebaseauth "github.com/ralf-life/gofiber-firebaseauth"
	"go.uber.org/zap"
)

type TopicHandler struct {
	srv       services.TopicService
	meetSrv   services.MeetingService
	projSrv   services.ProjectService
	logger    *zap.SugaredLogger
	validator *validator.Validate
}

func NewTopicHandler(
	srv services.TopicService,
	meetSrv services.MeetingService,
	projSrv services.ProjectService,
	logger *zap.SugaredLogger,
	validator *validator.Validate,
) *TopicHandler {
	return &TopicHandler{srv, meetSrv, projSrv, logger, validator}
}

var ErrNoSolution = errors.New("topic requires a solution before close")

type addTopicDto struct {
	Title         string `validate:"required,proj-extended,max=36" json:"title,omitempty"`
	Description   string `validate:"required,proj-extended,max=1024" json:"description,omitempty"`
	ForceSolution bool   `json:"force_solution,omitempty"`
}

// AuthorizationMiddleware makes sure the user can access the meeting in the project
func (h *TopicHandler) AuthorizationMiddleware(ctx *fiber.Ctx) error {
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
	m, ok := util.GetMeeting(project, uint(meetingID))
	if !ok {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(ErrNotFound))
	}

	ctx.Locals("project", *project)
	ctx.Locals("meeting", m)
	return ctx.Next()
}

func (h *TopicHandler) AddTopic(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	m := ctx.Locals("meeting").(model.Meeting)

	var payload addTopicDto
	if err := ctx.BodyParser(&payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := h.validator.Struct(payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}

	topic, err := h.srv.AddTopic(u.UserID, m.ID, payload.Title, payload.Description, payload.ForceSolution)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusCreated).JSON(presenter.SuccessResponse("topic created", topic))
}

func (h *TopicHandler) ListTopicForMeeting(ctx *fiber.Ctx) error {
	m := ctx.Locals("meeting").(model.Meeting)
	topics, err := h.srv.ListTopicsForMeeting(m.ID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("", topics))
}

func (h *TopicHandler) TopicAuthorizationMiddleware(ctx *fiber.Ctx) error {
	topicID, err := ctx.ParamsInt("topic_id")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	m := ctx.Locals("meeting").(model.Meeting)
	topics, err := h.srv.ListTopicsForMeeting(m.ID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	topic := util.Any(topics, func(t *model.Topic) bool {
		return t.ID == uint(topicID)
	})
	if topic == nil {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(ErrNotFound))
	}
	ctx.Locals("topic", *topic)
	return ctx.Next()
}

func (h *TopicHandler) DeleteTopic(ctx *fiber.Ctx) error {
	t := ctx.Locals("topic").(model.Topic)
	if err := h.srv.DeleteTopic(t.ID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("topic deleted", nil))
}

func (h *TopicHandler) EditTopic(ctx *fiber.Ctx) error {
	t := ctx.Locals("topic").(model.Topic)

	var payload addTopicDto
	if err := ctx.BodyParser(&payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := h.validator.Struct(payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}

	if err := h.srv.EditTopic(t.ID, payload.Title, payload.Description, payload.ForceSolution); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("topic edited", nil))
}

func (h *TopicHandler) SetStatusChecked(ctx *fiber.Ctx) error {
	t := ctx.Locals("topic").(model.Topic)
	if t.ForceSolution && t.SolutionID <= 0 {
		return ctx.Status(fiber.StatusForbidden).JSON(presenter.ErrorResponse(ErrNoSolution))
	}
	if err := h.srv.CheckTopic(t.ID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("topic closed", nil))
}

func (h *TopicHandler) SetStatusUnchecked(ctx *fiber.Ctx) error {
	t := ctx.Locals("topic").(model.Topic)
	if err := h.srv.UncheckTopic(t.ID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("topic opened", nil))
}
