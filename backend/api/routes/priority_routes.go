package routes

import (
	"github.com/darmiel/dmp/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func PriorityRoutes(router fiber.Router, handler *handlers.PriorityHandler) {
	router.Get("/", handler.ListPrioritiesForProject)
	router.Post("/", handler.CreatePriority)

	router.Use("/:priority_id", handler.PriorityLocalsMiddleware)
	router.Get("/:priority_id", handler.FindPriority)
	router.Put("/:priority_id", handler.EditPriority)
	router.Delete("/:priority_id", handler.DeletePriority)
}
