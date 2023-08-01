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
	"syscall"
)

func main() {
	logger, _ := zap.NewDevelopment()
	defer logger.Sync()
	sugar := logger.Sugar()

	// firebase auth
	fbApp, err := firebase.NewApp(context.TODO(), nil, option.WithCredentialsFile("credentials.json"))
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

	validate, err := util.NewValidate()
	if err != nil {
		sugar.With(err).Fatalln("cannot create validator")
	}

	// /project
	projectService := services.NewProjectService(db)
	projectHandler := handlers.NewProjectHandler(projectService, sugar, validate)
	routes.ProjectRoutes(app.Group("/project"), projectHandler)

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

// Meeting

// TODO: Create new meeting

// TODO: List all meetings in a project

// TODO: Delete meeting

// TODO: Edit meeting (name, start date)

// Topics

// TODO: Create new topic

// TODO: List all topic in meeting

// TODO: Delete topic

// TODO: Edit topic (name, description, type)

// TODO: Submit topic (mark as done/not done); check solution

// Comments

// TODO: Create new comment

// TODO: List all comments for topic

// TODO: Edit comment

// TODO: Delete comment
