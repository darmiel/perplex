package util

import (
	"github.com/gofiber/fiber/v2"
	gofiberfirebaseauth "github.com/ralf-life/gofiber-firebaseauth"
)

func GetFriendlyName(ctx *fiber.Ctx) string {
	if invitorName, ok := ctx.Locals("friendly_user").(string); ok {
		return invitorName
	}
	u := ctx.Locals("user").(gofiberfirebaseauth.User)
	return u.UserID
}
