package routes

import (
	"github.com/darmiel/perplex/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func ActionRoutes(router fiber.Router, handler *handlers.ActionHandler, middlewares *handlers.MiddlewareHandler) {
	router.Get("/", handler.ListActionsForProject)
	router.Post("/", handler.CreateAction)
	router.Get("/me", handler.ListActionsForProjectAndUser)

	router.Use("/topic/:topic_id", handler.TopicLocalsMiddleware)
	router.Get("/topic/:topic_id", handler.ListActionsForTopic)

	// by meeting
	specificMeeting := router.Group("/meeting/:meeting_id")
	specificMeeting.Use(middlewares.MeetingLocalsMiddleware)
	specificMeeting.Get("/", handler.ListActionsForMeeting)

	// specific actions
	specific := router.Group("/:action_id")
	specific.Use(handler.ActionLocalsMiddleware)
	specific.Get("/", handler.FindAction)
	specific.Put("/", handler.EditAction)
	specific.Delete("/", handler.DeleteAction)

	// specific topic
	specificTopic := specific.Group("/topic/:topic_id")
	specificTopic.Post("/", handler.LinkTopic)
	specificTopic.Delete("/", handler.UnlinkTopic)

	specificTopic.Use(handler.TopicLocalsMiddleware)
	specificTopic.Post("/", handler.LinkTopic)
	specificTopic.Delete("/", handler.UnlinkTopic)

	// specific user
	specificUser := specific.Group("/user/:user_id")
	specificUser.Use("/", middlewares.UserLocalsMiddleware)
	specificUser.Post("/", handler.LinkUser)
	specificUser.Delete("/", handler.UnlinkUser)

	// specific tag
	specificTag := specific.Group("/tag/:tag_id")
	specificTag.Use("/", middlewares.TagLocalsMiddleware)
	specificTag.Post("/", handler.LinkTag)
	specificTag.Delete("/", handler.UnlinkTag)

	specific.Post("/close", handler.CloseAction)
	specific.Post("/open", handler.OpenAction)
}
