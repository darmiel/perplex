package routes

import (
	"github.com/darmiel/perplex/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func CommentRoutes(router fiber.Router, handler *handlers.CommentHandler) {
	solutionGroup := router.Group("/solution/:comment_id")
	solutionGroup.Use("/", handler.CommentLocalsMiddleware)
	solutionGroup.Post("/", handler.MarkSolutionComment(true))
	solutionGroup.Delete("/", handler.MarkSolutionComment(false))

	typeGroup := router.Group("/:comment_target_type/:comment_target_id")
	typeGroup.Get("/", handler.ListGenericComment)
	typeGroup.Post("/", handler.AddGenericComment)

	specificCommentGroup := router.Group("/:comment_id")
	specificCommentGroup.Use("/", handler.CommentLocalsMiddleware)
	specificCommentGroup.Use("/", handler.CommentOwnershipMiddleware)
	specificCommentGroup.Put("/", handler.EditComment)
	specificCommentGroup.Delete("/", handler.DeleteComment)
}
