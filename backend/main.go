package main

import (
	"context"
	firebase "firebase.google.com/go"
	"github.com/darmiel/dmp/api/handlers"
	"github.com/darmiel/dmp/api/routes"
	"github.com/darmiel/dmp/api/services"
	"github.com/darmiel/dmp/pkg/model"
	"github.com/darmiel/dmp/pkg/util"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	gofiberfirebaseauth "github.com/ralf-life/gofiber-firebaseauth"
	"go.uber.org/zap"
	"google.golang.org/api/option"
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
	fbApp, err := firebase.NewApp(context.TODO(), nil, option.WithCredentialsFile("firebase.json"))
	if err != nil {
		sugar.With(err).Fatalln("cannot create firebase app")
		return
	}

	// database
	db, err := gorm.Open(sqlite.Open("dmp_develop.db"))
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
	); err != nil {
		sugar.With(err).Fatalln("cannot migrate user")
		return
	}

	// api
	app := fiber.New(fiber.Config{
		AppName: "dmp-api",
	})
	app.Use(cors.New())
	app.Get("/", func(ctx *fiber.Ctx) error {
		return ctx.SendString("Welcome to the dmp api!")
	})

	app.Use(gofiberfirebaseauth.New(fbApp, gofiberfirebaseauth.Config{
		TokenExtractor: gofiberfirebaseauth.NewHeaderExtractor("Bearer "),
	}))

	projectService := services.NewProjectService(db)
	meetingService := services.NewMeetingService(db)
	topicService := services.NewTopicService(db)
	commentService := services.NewCommentService(db, topicService)
	userService := services.NewUserService(db)
	actionService := services.NewActionService(db)

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
		friendlyUser := ctx.Locals("friendly_user").(string)
		sugar.Debugf("[%s] %s %s -> (pending)", friendlyUser, ctx.Method(), ctx.Path())
		err := ctx.Next()
		if err != nil {
			sugar.Warnf("[%s] %s %s -> %v", friendlyUser, ctx.Method(), ctx.Path(), err)
		} else {
			sugar.Infof("[%s] %s %s -> %d", friendlyUser, ctx.Method(), ctx.Path(), ctx.Response().StatusCode())
		}
		return err
	})

	validate, err := util.NewValidate()
	if err != nil {
		sugar.With(err).Fatalln("cannot create validator")
	}

	// /project
	projectHandler := handlers.NewProjectHandler(projectService, sugar, validate)
	projectGroup := app.Group("/project")
	routes.ProjectRoutes(projectGroup, projectHandler)

	// /meetings
	meetingHandler := handlers.NewMeetingHandler(meetingService, projectService, sugar, validate)
	meetingGroup := projectGroup.Group("/:project_id/meeting")
	routes.MeetingRoutes(meetingGroup, meetingHandler)

	// /topics
	topicHandler := handlers.NewTopicHandler(topicService, meetingService, projectService, sugar, validate)
	topicGroup := meetingGroup.Group("/:meeting_id/topic")
	routes.TopicRoutes(topicGroup, topicHandler)

	// /comment
	commentHandler := handlers.NewCommentHandler(commentService, meetingService, sugar, validate)
	commentGroup := topicGroup.Group("/:topic_id/comment")
	routes.CommentRoutes(commentGroup, commentHandler)

	// /user
	userHandler := handlers.NewUserHandler(userService, sugar, validate)
	userGroup := app.Group("/user")
	routes.UserRoutes(userGroup, userHandler)

	// /action
	actionHandler := handlers.NewActionHandler(actionService, topicService, meetingService, userService, sugar, validate)
	actionGroup := projectGroup.Group("/action")
	routes.ActionRoutes(actionGroup, actionHandler)

	// /tag
	tagHandler := handlers.NewTagHandler(actionService, sugar, validate)
	tagGroup := projectGroup.Group("/tag")
	routes.TagRoutes(tagGroup, tagHandler)

	// /priority
	priorityHandler := handlers.NewPriorityHandler(actionService, sugar, validate)
	priorityGroup := projectGroup.Group("/priority")
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
