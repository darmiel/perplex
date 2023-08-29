package routes

import (
	"github.com/darmiel/perplex/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func TagRoutes(router fiber.Router, handler *handlers.TagHandler) {
	router.Get("/", handler.ListTagsForProject)
	router.Post("/", handler.CreateTag)

	router.Use("/:tag_id", handler.TagLocalsMiddleware)
	router.Get("/:tag_id", handler.FindTag)
	router.Put("/:tag_id", handler.EditTag)
	router.Delete("/:tag_id", handler.DeleteTag)
}
