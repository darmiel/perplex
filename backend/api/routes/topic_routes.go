package routes

import (
	"github.com/darmiel/perplex/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func TopicRoutes(router fiber.Router, handler *handlers.TopicHandler, middlewares *handlers.MiddlewareHandler) {
	router.Get("/", handler.ListTopicForMeeting)
	router.Post("/", handler.AddTopic)

	// make sure the requested topic belongs to the current meeting / project
	specific := router.Group("/:topic_id")
	specific.Use("/", handler.TopicAuthorizationMiddleware)
	specific.Get("/", handler.GetTopic)
	specific.Delete("/", handler.DeleteTopic)
	specific.Put("/", handler.EditTopic)
	specific.Post("/status", handler.SetStatusChecked)
	specific.Delete("/status", handler.SetStatusUnchecked)
	specific.Post("/order", handler.UpdateOrder)

	specific.Get("/subscribe", handler.IsSubscribed)
	specific.Post("/subscribe", handler.SubscribeUser)
	specific.Delete("/subscribe", handler.UnsubscribeUser)

	// user linking
	userGroup := specific.Group("/user/:user_id")
	userGroup.Use("/", middlewares.UserLocalsMiddleware)
	userGroup.Post("/", handler.LinkUser)
	userGroup.Delete("/", handler.UnlinkUser)

	// tag linking
	tagGroup := specific.Group("/tag/:tag_id")
	tagGroup.Use("/", middlewares.TagLocalsMiddleware)
	tagGroup.Post("/", handler.LinkTag)
	tagGroup.Delete("/", handler.UnlinkTag)
}
