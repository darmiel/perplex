package presenter

import (
	"github.com/gofiber/fiber/v2"
)

func ProjectErrorResponse(err error) *fiber.Map {
	return &fiber.Map{
		"success": false,
		"error":   err.Error(),
	}
}

func ProjectSuccessResponse(message string, data any) *fiber.Map {
	return &fiber.Map{
		"success": true,
		"message": message,
		"data":    data,
	}
}
