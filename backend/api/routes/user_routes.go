package routes

import (
	"github.com/darmiel/dmp/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func UserRoutes(router fiber.Router, handler *handlers.UserHandler) {
	// change username
	router.Put("/me", handler.UpdateName)
	// get username
	router.Get("/resolve/:user_id", handler.Resolve)
}
