package routes

import (
	"github.com/darmiel/dmp/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func MeetingRoutes(router fiber.Router, handler *handlers.MeetingHandler) {
	router.Get("/", handler.GetMeetings)
	router.Post("/", handler.AddMeeting)
	router.Delete("/:meeting_id", handler.DeleteMeeting)
	router.Put("/:meeting_id", handler.EditMeeting)
}
