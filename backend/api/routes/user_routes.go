package routes

import (
	"github.com/darmiel/perplex/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func UserRoutes(router fiber.Router, handler *handlers.UserHandler) {
	// list users
	router.Get("/", handler.List)
	// change username
	router.Put("/me", handler.UpdateName)
	// get username
	router.Get("/resolve/:user_id", handler.Resolve)
}
