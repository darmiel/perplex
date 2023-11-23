package routes

import (
	"github.com/darmiel/perplex/api/handlers"
	"github.com/gofiber/fiber/v2"
)

func ProjectRoutes(router fiber.Router, handler *handlers.ProjectHandler, middlewares *handlers.MiddlewareHandler) {
	router.Post("/", handler.AddProject)
	router.Get("/", handler.GetProjects)

	specific := router.Group("/:project_id")
	specific.Use("/", handler.ProjectAccessMiddleware)
	specific.Get("/", handler.GetProject)
	specific.Get("/users", handler.ListUsersForProject)
	specific.Delete("/delete", handler.DeleteProject)
	specific.Delete("/leave", handler.LeaveProject)
	specific.Put("/", handler.EditProject)

	specific.Post("/user/:user_id", handler.AddUser)
	specific.Delete("/user/:user_id", handler.RemoveUser)

	files := specific.Group("/files")
	files.Post("/", handler.UploadFile)
	files.Get("/", handler.ListFiles)
	files.Get("/quota", handler.FileQuotaInfo)

	specificFile := files.Group("/:file_id")
	specificFile.Use("/", middlewares.FileLocalsMiddleware)
	specificFile.Get("/", handler.GetFile)
	specificFile.Delete("/", handler.DeleteFile)
	specificFile.Get("/download", handler.DownloadFile)
}
