package routes

import (
	"github.com/darmiel/dmp/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func MeetingRoutes(router fiber.Router, handler *handlers.MeetingHandler) {
	router.Post("/", handler.AddMeeting)

	// extend the project object for "Meetings"
	router.Use("/", handler.PreloadMeetingsMiddleware)
	router.Get("/", handler.GetMeetings)

	// check if the requested meeting belongs to the current project
	router.Use("/:meeting_id", handler.MeetingAccessMiddleware)
	router.Delete("/:meeting_id", handler.DeleteMeeting)
	router.Put("/:meeting_id", handler.EditMeeting)
}
