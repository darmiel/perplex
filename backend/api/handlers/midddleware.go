package handlers

import (
	"github.com/darmiel/perplex/api/presenter"
	"github.com/darmiel/perplex/api/services"
	"github.com/darmiel/perplex/pkg/model"
	"github.com/darmiel/perplex/pkg/util"
	"github.com/gofiber/fiber/v2"
)

type MiddlewareHandler struct {
	userSrv services.UserService
}

func NewMiddlewareHandler(userSrv services.UserService) *MiddlewareHandler {
	return &MiddlewareHandler{userSrv}
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
