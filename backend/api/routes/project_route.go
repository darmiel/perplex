package routes

import (
	"github.com/darmiel/perplex/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func ProjectRoutes(router fiber.Router, handler *handlers.ProjectHandler) {
	router.Post("/", handler.AddProject)
	router.Get("/", handler.GetProjects)

	router.Use("/:project_id", handler.ProjectAccessMiddleware)
	router.Get("/:project_id", handler.GetProject)
	router.Get("/:project_id/users", handler.ListUsersForProject)
	router.Delete("/:project_id/delete", handler.DeleteProject)
	router.Delete("/:project_id/leave", handler.LeaveProject)
	router.Put("/:project_id", handler.EditProject)

	router.Post("/:project_id/user/:user_id", handler.AddUser)
	router.Delete("/:project_id/user/:user_id", handler.RemoveUser)
}
