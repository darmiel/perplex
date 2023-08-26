package handlers

import (
	"errors"
	"github.com/darmiel/dmp/api/services"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

var ErrNotImplemented = errors.New("not implemented yet")

type ActionHandler struct {
	srv       services.ActionService
	logger    *zap.SugaredLogger
	validator *validator.Validate
}

func NewActionHandler(
	srv services.ActionService,
	logger *zap.SugaredLogger,
	validator *validator.Validate,
) *ActionHandler {
	return &ActionHandler{srv, logger, validator}
}

func (a ActionHandler) ListActionsForProject(ctx *fiber.Ctx) error {
	return ErrNotImplemented
}

func (a ActionHandler) CreateAction(ctx *fiber.Ctx) error {
	return ErrNotImplemented
}

func (a ActionHandler) ListActionsForUser(ctx *fiber.Ctx) error {
	return ErrNotImplemented
}

// :action_id

func (a ActionHandler) FindAction(ctx *fiber.Ctx) error {
	return ErrNotImplemented
}

func (a ActionHandler) EditAction(ctx *fiber.Ctx) error {
	return ErrNotImplemented
}

func (a ActionHandler) DeleteAction(ctx *fiber.Ctx) error {
	return ErrNotImplemented
}

// :action_id/topic/:topic_id

func (a ActionHandler) ListActionsForTopic(ctx *fiber.Ctx) error {
	return ErrNotImplemented
}

func (a ActionHandler) LinkTopic(ctx *fiber.Ctx) error {
	return ErrNotImplemented
}

func (a ActionHandler) UnlinkTopic(ctx *fiber.Ctx) error {
	return ErrNotImplemented
}

// :action_id/user/:user_id

func (a ActionHandler) LinkUser(ctx *fiber.Ctx) error {
	return ErrNotImplemented
}

func (a ActionHandler) UnlinkUser(ctx *fiber.Ctx) error {
	return ErrNotImplemented
}

// :action_id/tag/:tag_id

func (a ActionHandler) LinkTag(ctx *fiber.Ctx) error {
	return ErrNotImplemented
}

func (a ActionHandler) UnlinkTag(ctx *fiber.Ctx) error {
	return ErrNotImplemented
}

// :action_id/close

func (a ActionHandler) CloseAction(ctx *fiber.Ctx) error {
	return ErrNotImplemented
}

func (a ActionHandler) OpenAction(ctx *fiber.Ctx) error {
	return ErrNotImplemented
}
