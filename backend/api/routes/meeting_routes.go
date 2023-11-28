package routes

import (
	"github.com/darmiel/perplex/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func MeetingRoutes(router fiber.Router, handler *handlers.MeetingHandler, middlewares *handlers.MiddlewareHandler) {
	router.Post("/", handler.AddMeeting)

	// extend the project object for "Meetings"
	router.Use("/", handler.PreloadMeetingsMiddleware)
	router.Get("/", handler.GetMeetings)

	// check if the requested meeting belongs to the current project
	specific := router.Group("/:meeting_id")
	specific.Use("/", handler.MeetingAccessMiddleware)
	specific.Get("/", handler.GetMeeting)
	specific.Delete("/", handler.DeleteMeeting)
	specific.Put("/", handler.EditMeeting)
	specific.Put("/ready", handler.EditReady)

	// linkUser routes
	linkUser := specific.Group("/link/user/:user_id")
	linkUser.Use("/", middlewares.UserLocalsMiddleware)
	linkUser.Post("/", handler.LinkUser)
	linkUser.Delete("/", handler.UnlinkUser)

	// tag linking
	tagGroup := specific.Group("/link/tag/:tag_id")
	tagGroup.Use("/", middlewares.TagLocalsMiddleware)
	tagGroup.Post("/", handler.LinkTag)
	tagGroup.Delete("/", handler.UnlinkTag)
}
