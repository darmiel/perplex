package handlers

import (
	"errors"
	"github.com/darmiel/dmp/api/presenter"
	"github.com/darmiel/dmp/api/services"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	gofiberfirebaseauth "github.com/ralf-life/gofiber-firebaseauth"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type UserHandler struct {
	srv       services.UserService
	logger    *zap.SugaredLogger
	validator *validator.Validate
}

func NewUserHandler(
	srv services.UserService,
	logger *zap.SugaredLogger,
	validator *validator.Validate,
) *UserHandler {
	return &UserHandler{srv, logger, validator}
}

type changeNameDto struct {
	NewName string `json:"new_name" validate:"min=3,max=32,required,username"`
}

func (h UserHandler) UpdateName(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	var payload changeNameDto
	if err := ctx.BodyParser(&payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := h.validator.Struct(payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := h.srv.ChangeName(u.UserID, payload.NewName); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("changed username", payload.NewName))
}

func (h UserHandler) Resolve(ctx *fiber.Ctx) error {
	target := ctx.Params("user_id")
	name, err := h.srv.GetName(target)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(err))
		}
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("user found", name))
}

func (h UserHandler) List(ctx *fiber.Ctx) error {
	query := ctx.Query("query", "")
	page := ctx.QueryInt("page", 1)
	users, err := h.srv.ListUsers(query, page)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("users found", users))
}
