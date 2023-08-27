package handlers

import (
	"github.com/darmiel/dmp/api/presenter"
	"github.com/darmiel/dmp/api/services"
	"github.com/darmiel/dmp/pkg/model"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	gofiberfirebaseauth "github.com/ralf-life/gofiber-firebaseauth"
	"go.uber.org/zap"
	"sort"
)

type PriorityHandler struct {
	srv       services.ActionService
	logger    *zap.SugaredLogger
	validator *validator.Validate
}

func NewPriorityHandler(
	srv services.ActionService,
	logger *zap.SugaredLogger,
	validator *validator.Validate,
) *PriorityHandler {
	return &PriorityHandler{srv, logger, validator}
}

type priorityDto struct {
	Title  string `json:"title" validate:"required,min=1,max=64"`
	Color  string `json:"color"`
	Weight int    `json:"weight" validate:"min=0,max=9999"`
}

func (a PriorityHandler) PriorityLocalsMiddleware(ctx *fiber.Ctx) error {
	priorityID, err := ctx.ParamsInt("priority_id")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	a.logger.Infof("PriorityLocalsMiddleware: %v", priorityID)
	priority, err := a.srv.FindPriority(uint(priorityID))
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(presenter.ErrorResponse(err))
	}
	ctx.Locals("priority", *priority)
	return ctx.Next()
}

func (a PriorityHandler) ListPrioritiesForProject(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	priorities, err := a.srv.FindPrioritiesByProject(p.ID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	// sort by weight
	sort.Slice(priorities, func(i, j int) bool {
		return priorities[i].Weight > priorities[j].Weight
	})
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("priorities by project", priorities))
}

func (a PriorityHandler) CreatePriority(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	if p.OwnerID != u.UserID {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrOnlyOwner))
	}
	var dto priorityDto
	if err := ctx.BodyParser(&dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := a.validator.Struct(dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	priority, err := a.srv.CreatePriority(dto.Title, dto.Color, dto.Weight, p.ID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("created priority", priority))
}

func (a PriorityHandler) FindPriority(ctx *fiber.Ctx) error {
	py := ctx.Locals("priority").(model.Priority)
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("found priority", py))
}

func (a PriorityHandler) EditPriority(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	py := ctx.Locals("priority").(model.Priority)
	if p.OwnerID != u.UserID {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrOnlyOwner))
	}
	var dto priorityDto
	if err := ctx.BodyParser(&dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := a.validator.Struct(dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ErrorResponse(err))
	}
	if err := a.srv.EditPriority(py.ID, dto.Title, dto.Color, dto.Weight); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("updated priority", nil))
}

func (a PriorityHandler) DeletePriority(ctx *fiber.Ctx) error {
	p := ctx.Locals("project").(model.Project)
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	py := ctx.Locals("priority").(model.Priority)
	if p.OwnerID != u.UserID {
		return ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ErrorResponse(ErrOnlyOwner))
	}
	if err := a.srv.DeletePriority(py.ID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.SuccessResponse("deleted priority", nil))
}
