package routes

import (
	"github.com/darmiel/perplex/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func CommentRoutes(router fiber.Router, handler *handlers.CommentHandler) {
	router.Get("/", handler.ListCommentsForTopic)
	router.Post("/", handler.AddComment)

	router.Use("/:comment_id", handler.CommentLocalsMiddleware)
	router.Post("/:comment_id/solution", handler.MarkSolutionComment(true))
	router.Delete("/:comment_id/solution", handler.MarkSolutionComment(false))

	router.Use("/:comment_id", handler.CommentOwnershipMiddleware)
	router.Put("/:comment_id", handler.EditComment)
	router.Delete("/:comment_id", handler.DeleteComment)
}
