package handlers

import (
	"errors"
	"github.com/darmiel/dmp/api/presenter"
	"github.com/darmiel/dmp/api/services"
	"github.com/darmiel/dmp/pkg/model"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	gofiberfirebaseauth "github.com/ralf-life/gofiber-firebaseauth"
	"go.uber.org/zap"
)

var ErrNotOwner = errors.New("not the owner")

type ProjectHandler struct {
	srv       services.ProjectService
	logger    *zap.SugaredLogger
	validator *validator.Validate
}

func NewProjectHandler(
	srv services.ProjectService,
	logger *zap.SugaredLogger,
	validator *validator.Validate,
) *ProjectHandler {
	return &ProjectHandler{srv, logger, validator}
}

type projectDto struct {
	Name        string `validate:"required,proj-extended,min=3,max=36,startsnotwith= ,endsnotwith= "`
	Description string `validate:"proj-extended,max=256"`
}

func (h *ProjectHandler) AddProject(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	h.logger.Infof("user %s is requesting to create a new project", u.UserID)

	var payload projectDto
	if err := ctx.BodyParser(&payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ProjectErrorResponse(err))
	}
	if err := h.validator.Struct(payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ProjectErrorResponse(err))
	}

	project, err := h.srv.CreateProject(payload.Name, payload.Description, u.UserID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ProjectErrorResponse(err))
	}

	h.logger.Infof("created project %d for user %s (%s)", project.ID, u.UserID, project.Name)
	return ctx.Status(fiber.StatusCreated).JSON(presenter.ProjectSuccessResponse("project created", project))
}

func (h *ProjectHandler) GetProjects(ctx *fiber.Ctx) error {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	h.logger.Infof("user %s is requesting a list of projects", u.UserID)

	projects := make(map[uint]*model.Project)

	// find owned projects
	ownerProjects, err := h.srv.FindProjectsByOwner(u.UserID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ProjectErrorResponse(err))
	}
	for _, p := range ownerProjects {
		projects[p.ID] = &p
	}

	// find projects the user has access to
	userProjects, err := h.srv.FindProjectsByUserAccess(u.UserID)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ProjectErrorResponse(err))
	}
	for _, p := range userProjects {
		projects[p.ID] = &p
	}

	result := make([]*model.Project, 0, len(projects))
	for _, v := range projects {
		result = append(result, v)
	}

	return ctx.Status(fiber.StatusOK).JSON(presenter.ProjectSuccessResponse("", result))
}

func (h *ProjectHandler) pathProjectIDOwnerCheck(ctx *fiber.Ctx) (
	project *model.Project,
	err error,
) {
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	projectID, err := ctx.ParamsInt("project_id")
	if err != nil {
		return nil, ctx.Status(fiber.StatusBadRequest).JSON(presenter.ProjectErrorResponse(err))
	}

	// find project to check if the requester is the owner
	if project, err = h.srv.FindProject(uint(projectID)); err != nil {
		return nil, ctx.Status(fiber.StatusBadRequest).JSON(presenter.ProjectErrorResponse(err))
	}
	if project.OwnerID != u.UserID {
		return nil, ctx.Status(fiber.StatusUnauthorized).JSON(presenter.ProjectErrorResponse(ErrNotOwner))
	}
	return
}

func (h *ProjectHandler) DeleteProject(ctx *fiber.Ctx) error {
	project, err := h.pathProjectIDOwnerCheck(ctx)
	if project == nil || err != nil {
		return err
	}
	if err = h.srv.DeleteProject(project.ID); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ProjectErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.ProjectSuccessResponse("project deleted", nil))
}

func (h *ProjectHandler) EditProject(ctx *fiber.Ctx) error {
	var payload projectDto
	if err := ctx.BodyParser(&payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ProjectErrorResponse(err))
	}
	h.logger.Infof("Validating %+v :: %v", payload, h.validator.Struct(payload))
	if err := h.validator.Struct(payload); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(presenter.ProjectErrorResponse(err))
	}
	project, err := h.pathProjectIDOwnerCheck(ctx)
	if project == nil || err != nil {
		return err
	}
	if err = h.srv.EditProject(project.ID, payload.Name, payload.Description); err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(presenter.ProjectErrorResponse(err))
	}
	return ctx.Status(fiber.StatusOK).JSON(presenter.ProjectSuccessResponse("project updated", nil))
}
