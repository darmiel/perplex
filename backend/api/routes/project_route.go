package routes

import (
	"github.com/darmiel/dmp/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func ProjectRoutes(router fiber.Router, handler *handlers.ProjectHandler) {
	router.Post("/", handler.AddProject)
	router.Get("/", handler.GetProjects)

	router.Use("/:project_id", handler.ProjectAccessMiddleware)
	router.Delete("/:project_id", handler.DeleteProject)
	router.Put("/:project_id", handler.EditProject)
}
