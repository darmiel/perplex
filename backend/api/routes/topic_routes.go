package routes

import (
	"github.com/darmiel/dmp/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func TopicRoutes(router fiber.Router, handler *handlers.TopicHandler) {
	// make sure the user has access to the meeting
	router.Use(handler.AuthorizationMiddleware)
	router.Get("/", handler.ListTopicForMeeting)
	router.Post("/", handler.AddTopic)

	router.Use(handler.TopicAuthorizationMiddleware)
	router.Delete("/:topic_id", handler.DeleteTopic)
	router.Put("/:topic_id", handler.EditTopic)
	router.Post("/:topic_id/status", handler.SetStatusChecked)
	router.Delete("/:topic_id/status", handler.SetStatusUnchecked)
}
