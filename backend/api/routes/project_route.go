package routes

import (
	"github.com/darmiel/dmp/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func ProjectRoutes(router fiber.Router, handler *handlers.ProjectHandler) {
	router.Get("/", handler.GetProjects)
	router.Post("/", handler.AddProject)
	router.Delete("/:project_id", handler.DeleteProject)
	router.Put("/:project_id", handler.EditProject)
}
