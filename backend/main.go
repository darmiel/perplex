package main

import (
	"context"
	firebase "firebase.google.com/go"
	"github.com/darmiel/perplex/api/handlers"
	"github.com/darmiel/perplex/api/routes"
	"github.com/darmiel/perplex/api/services"
	"github.com/darmiel/perplex/pkg/model"
	"github.com/darmiel/perplex/pkg/util"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	gofiberfirebaseauth "github.com/ralf-life/gofiber-firebaseauth"
	"go.uber.org/zap"
	"google.golang.org/api/option"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"os"
	"os/signal"
	"strings"
	"syscall"
)

func main() {
	logger, _ := zap.NewDevelopment()
	defer logger.Sync()
	sugar := logger.Sugar()

	// firebase auth
	fbApp, err := firebase.NewApp(context.TODO(), nil, option.WithCredentialsFile("config/firebase.json"))
	if err != nil {
		sugar.With(err).Fatalln("cannot create firebase app")
		return
	}

	// database setup
	var db *gorm.DB
	if sqlitePath, ok := os.LookupEnv("SQLITE_PATH"); ok {
		db, err = gorm.Open(sqlite.Open(sqlitePath))
	} else if postgresDSN, ok := os.LookupEnv("POSTGRES_DSN"); ok {
		db, err = gorm.Open(postgres.Open(postgresDSN))
	} else {
		sugar.Fatalln("no database specified")
		return
	}
	if err != nil {
		sugar.With(err).Fatalln("cannot open database")
		return
	}
	if err = db.AutoMigrate(
		new(model.User),
		new(model.Comment),
		new(model.Topic),
		new(model.Meeting),
		new(model.Project),
		new(model.Priority),
		new(model.Action),
		new(model.Tag),
		new(model.Notification),
	); err != nil {
		sugar.With(err).Fatalln("cannot migrate user")
		return
	}

	// api
	app := fiber.New(fiber.Config{
		AppName:           "perplex-api",
		StreamRequestBody: true,
	})
	app.Use(cors.New())
	app.Get("/", func(ctx *fiber.Ctx) error {
		return ctx.SendString("Welcome to the perplex api! https://github.com/darmiel/perplex")
	})

	app.Use(gofiberfirebaseauth.New(fbApp, gofiberfirebaseauth.Config{
		TokenExtractor: gofiberfirebaseauth.NewHeaderExtractor("Bearer "),
	}))

	s3Service, err := services.NewS3Service()
	if err != nil {
		sugar.With(err).Fatalln("cannot create s3 service")
		return
	}

	projectService := services.NewProjectService(db)
	meetingService := services.NewMeetingService(db)
	topicService := services.NewTopicService(db, projectService)
	commentService := services.NewCommentService(db, topicService)
	userService := services.NewUserService(db, projectService, meetingService)
	actionService := services.NewActionService(db, projectService)

	// user middleware
	// check if user is already registered in database
	// if not, create user with username from email address
	// and set username/email in ctx.Locals("user_id") for logging
	app.Use(func(ctx *fiber.Ctx) error {
		u := ctx.Locals("user").(gofiberfirebaseauth.User)
		// check if user is already registered
		if name, err := userService.GetName(u.UserID); err != nil {
			// extract username from email
			username := u.Email[:strings.Index(u.Email, "@")]
			sugar.Infof("user %s is not registered yet, creating user with name %s", u.UserID, username)
			// create user
			if err = userService.ChangeName(u.UserID, username); err != nil {
				ctx.Locals("friendly_user", u.Email)
				sugar.Warnf("cannot create user %s: %v", u.UserID, err)
			}
			ctx.Locals("friendly_user", username)
		} else {
			ctx.Locals("friendly_user", name)
		}
		return ctx.Next()
	})

	// fiber logging middleware
	app.Use(func(ctx *fiber.Ctx) error {
		friendlyUser, ok := ctx.Locals("friendly_user").(string)
		if !ok {
			friendlyUser = "unknown"
		}
		err := ctx.Next()

		sugar.Info(" ")
		sugar.Debugf("[%s] %s %s -> (pending)", friendlyUser, ctx.Method(), ctx.Path())
		if err != nil {
			sugar.Infof("error: %v", err)
			sugar.Infof("method: %s", ctx.Method())
			sugar.Infof("path: %s", ctx.Path())
			sugar.Infof("status: %d", ctx.Response().StatusCode())
		} else {
			sugar.Infof("[%s] %s %s -> %d", friendlyUser, ctx.Method(), ctx.Path(), ctx.Response().StatusCode())
		}
		sugar.Info(" ")
		return err
	})

	validate, err := util.NewValidate()
	if err != nil {
		sugar.With(err).Fatalln("cannot create validator")
	}

	// middlewares
	middlewareHandler := handlers.NewMiddlewareHandler(userService, projectService, meetingService)

	// /project
	projectHandler := handlers.NewProjectHandler(projectService, userService, s3Service, sugar, validate)
	projectGroup := app.Group("/project")
	routes.ProjectRoutes(projectGroup, projectHandler, middlewareHandler)

	// /meetings
	meetingHandler := handlers.NewMeetingHandler(meetingService, projectService, userService, sugar, validate)
	meetingGroup := projectGroup.Group("/:project_id/meeting")
	routes.MeetingRoutes(meetingGroup, meetingHandler, middlewareHandler)

	// /topics
	topicHandler := handlers.NewTopicHandler(topicService, meetingService, projectService, userService, sugar, validate)
	topicGroup := meetingGroup.Group("/:meeting_id/topic")
	routes.TopicRoutes(topicGroup, topicHandler, middlewareHandler)

	// /comment
	commentHandler := handlers.NewCommentHandler(
		commentService,
		meetingService,
		topicService,
		actionService,
		projectService,
		userService,
		sugar,
		validate,
	)
	commentGroup := projectGroup.Group("/:project_id/comment")
	routes.CommentRoutes(commentGroup, commentHandler)

	// /user
	userHandler := handlers.NewUserHandler(userService, projectService, meetingService, topicService, actionService, sugar, validate)
	userGroup := app.Group("/user")
	routes.UserRoutes(userGroup, userHandler)

	// /action
	actionHandler := handlers.NewActionHandler(actionService, topicService, meetingService, userService, sugar, validate)
	actionGroup := projectGroup.Group("/:project_id/action")
	routes.ActionRoutes(actionGroup, actionHandler, middlewareHandler)

	// /tag
	tagHandler := handlers.NewTagHandler(projectService, sugar, validate)
	tagGroup := projectGroup.Group("/:project_id/tag")
	routes.TagRoutes(tagGroup, tagHandler)

	// /priority
	priorityHandler := handlers.NewPriorityHandler(projectService, sugar, validate)
	priorityGroup := projectGroup.Group("/:project_id/priority")
	routes.PriorityRoutes(priorityGroup, priorityHandler)

	// start web server
	go func() {
		if err := app.Listen(":8080"); err != nil {
			sugar.With(err).Fatalln("cannot listen on :8080")
		}
	}()
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	_ = <-c
	sugar.Infoln("shutting down web-server")
	_ = app.Shutdown()
}
