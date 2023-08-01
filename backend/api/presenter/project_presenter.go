package presenter

import (
	"github.com/gofiber/fiber/v2"
)

func ErrorResponse(err error) *fiber.Map {
	return &fiber.Map{
		"success": false,
		"error":   err.Error(),
	}
}

func SuccessResponse(message string, data any) *fiber.Map {
	return &fiber.Map{
		"success": true,
		"message": message,
		"data":    data,
	}
}
