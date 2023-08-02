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

type topicDto struct {
	Title         string `validate:"required,proj-extended,max=36" json:"title,omitempty"`
	Description   string `validate:"required,proj-extended,max=1024" json:"description,omitempty"`
	ForceSolution bool   `json:"force_solution,omitempty"`
}

// TopicAuthorizationMiddleware is a middleware function for authorizing topic related actions.
// It fetches the relevant topic using its ID from the request params and sets it in Ctx for future use.
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
	if topic, ok := util.Any(topics, func(t *model.Topic) bool {
		return t.ID == uint(topicID)
	}); ok {
		ctx.Locals("topic", *topic)
		return ctx.Next()
	}
	return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrNotFound))
}

// AddTopic adds a new topic to a meeting.
// It retrieves topic details from the request body and validates it.
func (h *TopicHandler) AddTopic(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	m := ctx.Locals("meeting").(model.Meeting)

	var payload topicDto
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

// ListTopicForMeeting lists all topics for a particular meeting.
func (h *TopicHandler) ListTopicForMeeting(ctx *fiber.Ctx) error {
	m := ctx.Locals("meeting").(model.Meeting)
	topics, err := h.srv.ListTopicsForMeeting(m.ID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("", topics))
}

// DeleteTopic deletes the topic from a meeting.
func (h *TopicHandler) DeleteTopic(ctx *fiber.Ctx) error {
	t := ctx.Locals("topic").(model.Topic)
	if err := h.srv.DeleteTopic(t.ID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("topic deleted", nil))
}

// EditTopic edits the details of an existing topic.
func (h *TopicHandler) EditTopic(ctx *fiber.Ctx) error {
	t := ctx.Locals("topic").(model.Topic)

	var payload topicDto
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

// SetStatusChecked sets the status of a topic as checked (or closed).
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

// SetStatusUnchecked sets the status of a topic as unchecked (or opened).
func (h *TopicHandler) SetStatusUnchecked(ctx *fiber.Ctx) error {
	t := ctx.Locals("topic").(model.Topic)
	if err := h.srv.UncheckTopic(t.ID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("topic opened", nil))
}
