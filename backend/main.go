package main

import (
	"github.com/darmiel/dmp/pkg/model"
	"go.uber.org/zap"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	logger, _ := zap.NewDevelopment()
	defer logger.Sync()
	sugar := logger.Sugar()

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
	}
}

// Project

// TODO: Create new project

// TODO: List all projects the user has access to (created / access)

// TODO: Delete project

// TODO: Edit project (name, members)

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
