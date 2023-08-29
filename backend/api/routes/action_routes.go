package routes

import (
	"github.com/darmiel/perplex/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func ActionRoutes(router fiber.Router, handler *handlers.ActionHandler) {
	router.Get("/", handler.ListActionsForProject)
	router.Post("/", handler.CreateAction)
	router.Get("/my", handler.ListActionsForUser)

	router.Use("/topic/:topic_id", handler.TopicLocalsMiddleware)
	router.Get("/topic/:topic_id", handler.ListActionsForTopic)

	router.Use("/:action_id", handler.ActionLocalsMiddleware)
	router.Get("/:action_id", handler.FindAction)
	router.Put("/:action_id", handler.EditAction)
	router.Delete("/:action_id", handler.DeleteAction)

	router.Use("/:action_id/topic/:topic_id", handler.TopicLocalsMiddleware)
	router.Post("/:action_id/topic/:topic_id", handler.LinkTopic)
	router.Delete("/:action_id/topic/:topic_id", handler.UnlinkTopic)

	router.Use("/:action_id/user/:user_id", handler.UserLocalsMiddleware)
	router.Post("/:action_id/user/:user_id", handler.LinkUser)
	router.Delete("/:action_id/user/:user_id", handler.UnlinkUser)

	router.Use("/:action_id/tag/:tag_id", handler.TagLocalsMiddleware)
	router.Post("/:action_id/tag/:tag_id", handler.LinkTag)
	router.Delete("/:action_id/tag/:tag_id", handler.UnlinkTag)

	router.Post("/:action_id/close", handler.CloseAction)
	router.Post("/:action_id/open", handler.OpenAction)
}
