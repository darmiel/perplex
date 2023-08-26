package handlers

import (
	"github.com/darmiel/dmp/api/presenter"
	"github.com/darmiel/dmp/api/services"
	"github.com/darmiel/dmp/pkg/model"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	gofiberfirebaseauth "github.com/ralf-life/gofiber-firebaseauth"
	"go.uber.org/zap"
)

type TagHandler struct {
	srv       services.ActionService
	logger    *zap.SugaredLogger
	validator *validator.Validate
}

func NewTagHandler(
	srv services.ActionService,
	logger *zap.SugaredLogger,
	validator *validator.Validate,
) *TagHandler {
	return &TagHandler{srv, logger, validator}
}

func (a TagHandler) ListTagsForProject(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	tags, err := a.srv.FindTagsByProject(p.ID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("tags by project", tags))
}

type tagDto struct {
	Name  string `json:"name" validate:"required,min=1,max=64"`
	Color string `json:"color" validate:"required,min=1max=64"`
}

func (a TagHandler) CreateTag(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	if p.OwnerID != u.UserID {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrOnlyOwner))
	}
	var dto tagDto
	if err := ctx.BodyParser(&dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := a.validator.Struct(dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	tag, err := a.srv.CreateTag(dto.Name, dto.Color, p.ID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("created tag", tag))
}

func (a TagHandler) TagLocalsMiddleware(ctx *fiber.Ctx) error {
	tagID, err := ctx.ParamsInt("tag_id")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	tag, err := a.srv.FindTag(uint(tagID))
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(err))
	}
	ctx.Locals("tag", *tag)
	return ctx.Next()
}

// :tag_id

func (a TagHandler) FindTag(ctx *fiber.Ctx) error {
	t := ctx.Locals("tag").(model.Tag)
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("found tag", t))
}

func (a TagHandler) EditTag(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	t := ctx.Locals("tag").(model.Tag)
	if p.OwnerID != u.UserID {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrOnlyOwner))
	}
	var dto tagDto
	if err := ctx.BodyParser(&dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := a.validator.Struct(dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := a.srv.EditTag(t.ID, dto.Name, dto.Color); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("updated tag", nil))
}

func (a TagHandler) DeleteTag(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	t := ctx.Locals("tag").(model.Tag)
	if p.OwnerID != u.UserID {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrOnlyOwner))
	}
	if err := a.srv.DeleteTag(t.ID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("deleted tag", nil))
}
