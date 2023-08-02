package routes

import (
	"github.com/darmiel/dmp/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func TopicRoutes(router fiber.Router, handler *handlers.TopicHandler) {
	router.Get("/", handler.ListTopicForMeeting)
	router.Post("/", handler.AddTopic)

	// make sure the requested topic belongs to the current meeting / project
	router.Use("/:topic_id", handler.TopicAuthorizationMiddleware)
	router.Delete("/:topic_id", handler.DeleteTopic)
	router.Put("/:topic_id", handler.EditTopic)
	router.Post("/:topic_id/status", handler.SetStatusChecked)
	router.Delete("/:topic_id/status", handler.SetStatusUnchecked)
}
