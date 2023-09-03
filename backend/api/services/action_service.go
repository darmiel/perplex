package services

import (
	"database/sql"
	"github.com/darmiel/perplex/pkg/model"
	"gorm.io/gorm"
	"time"
)

type ActionService interface {
	FindAction(actionID uint) (*model.Action, error)
	FindActionsByProject(projectID uint) ([]model.Action, error)
	FindActionsByTopic(topicID uint) ([]model.Action, error)
	FindActionsByTag(tagID uint) ([]model.Action, error)
	FindActionsByPriority(priorityID uint) ([]model.Action, error)
	FindActionsByProjectAndUser(projectID uint, userID string, openOnly bool) ([]model.Action, error)
	CreateAction(title, description string, dueDate sql.NullTime, priorityID, projectID uint, creatorID string) (*model.Action, error)
	DeleteAction(actionID uint) error
	EditAction(actionID uint, title, description string, dueDate sql.NullTime, priorityID uint) error
	LinkTopic(actionID, topicID uint) error
	UnlinkTopic(actionID, topicID uint) error
	LinkUser(actionID uint, userID string) error
	UnlinkUser(actionID uint, userID string) error
	LinkTag(actionID, tagID uint) error
	UnlinkTag(actionID, tagID uint) error
	CloseAction(actionID uint) error
	OpenAction(actionID uint) error
}

type actionService struct {
	DB      *gorm.DB
	projSrv ProjectService
}

func NewActionService(db *gorm.DB, projSrv ProjectService) ActionService {
	return &actionService{
		DB:      db,
		projSrv: projSrv,
	}
}

func (a *actionService) preload() *gorm.DB {
	return a.DB.Preload("Topics").
		Preload("AssignedUsers").
		Preload("Priority").
		Preload("Tags")
}

func (a *actionService) FindAction(id uint) (*model.Action, error) {
	var action model.Action
	if err := a.preload().First(&action, id).Error; err != nil {
		return nil, err
	}
	return &action, nil
}

func (a *actionService) FindActionsByProject(projectID uint) ([]model.Action, error) {
	var actions []model.Action
	if err := a.preload().
		Joins("Project").
		Where("actions.project_id = ?", projectID).
		Find(&actions).Error; err != nil {
		return nil, err
	}
	return actions, nil
}

func (a *actionService) FindActionsByTag(tagID uint) ([]model.Action, error) {
	var actions []model.Action
	if err := a.preload().
		Joins("JOIN action_tag_assignments ON action_tag_assignments.action_id = actions.id").
		Where("action_tag_assignments.tag_id = ?", tagID).
		Find(&actions).Error; err != nil {
		return nil, err
	}
	return actions, nil
}

func (a *actionService) FindActionsByPriority(priorityID uint) ([]model.Action, error) {
	var actions []model.Action
	if err := a.preload().
		Where("priority_id = ?", priorityID).
		Find(&actions).Error; err != nil {
		return nil, err
	}
	return actions, nil
}

func (a *actionService) FindActionsByTopic(topicID uint) ([]model.Action, error) {
	var actions []model.Action
	if err := a.preload().
		Joins("JOIN action_topic_assignments ON action_topic_assignments.action_id = actions.id").
		Where("action_topic_assignments.topic_id = ?", topicID).
		Find(&actions).Error; err != nil {
		return nil, err
	}
	return actions, nil
}

func (a *actionService) FindActionsByProjectAndUser(projectID uint, userID string, openOnly bool) ([]model.Action, error) {
	var actions []model.Action
	q := a.preload().
		Joins("JOIN action_user_assignments ON action_user_assignments.action_id = actions.id").
		Where("action_user_assignments.user_id = ?", userID).
		Where("project_id = ?", projectID)
	if openOnly {
		q = q.Where("closed_at IS NULL")
	}
	if err := q.
		Find(&actions).Error; err != nil {
		return nil, err
	}
	return actions, nil
}

func (a *actionService) CreateAction(title, description string, dueDate sql.NullTime, priorityID, projectID uint, creatorID string) (*model.Action, error) {
	var priorityIDCreate *uint
	if priorityID > 0 {
		if _, err := a.projSrv.FindPriority(priorityID); err != nil {
			return nil, err
		}
		priorityIDCreate = &priorityID
	}
	action := model.Action{
		Title:       title,
		Description: description,
		DueDate:     dueDate,
		PriorityID:  priorityIDCreate,
		ProjectID:   projectID,
		CreatorID:   creatorID,
	}
	if err := a.DB.Create(&action).Error; err != nil {
		return nil, err
	}
	return &action, nil
}

func (a *actionService) DeleteAction(id uint) error {
	return a.DB.Delete(&model.Action{
		Model: gorm.Model{
			ID: id,
		},
	}).Error
}

func (a *actionService) EditAction(id uint, title, description string, dueDate sql.NullTime, priorityID uint) error {
	// check if priority exists
	var priorityIDUpdate interface{} = nil
	if priorityID != 0 {
		if _, err := a.projSrv.FindPriority(priorityID); err != nil {
			return err
		}
		priorityIDUpdate = priorityID
	}
	var dueDateUpdate interface{} = nil
	if dueDate.Valid {
		dueDateUpdate = dueDate
	}
	return a.DB.Updates(&model.Action{
		Model: gorm.Model{
			ID: id,
		},
		Title:       title,
		Description: description,
	}).
		Update("PriorityID", priorityIDUpdate).
		Update("DueDate", dueDateUpdate).
		Error
}

func (a *actionService) LinkTopic(actionID, topicID uint) error {
	return a.DB.Model(&model.Action{
		Model: gorm.Model{
			ID: actionID,
		},
	}).Association("Topics").Append(&model.Topic{
		Model: gorm.Model{
			ID: topicID,
		},
	})
}

func (a *actionService) UnlinkTopic(actionID, topicID uint) error {
	return a.DB.Model(&model.Action{
		Model: gorm.Model{
			ID: actionID,
		},
	}).
		Association("Topics").
		Delete(&model.Topic{
			Model: gorm.Model{
				ID: topicID,
			},
		})
}

func (a *actionService) LinkUser(actionID uint, userID string) error {
	return a.DB.Model(&model.Action{
		Model: gorm.Model{
			ID: actionID,
		},
	}).
		Association("AssignedUsers").
		Append(&model.User{
			ID: userID,
		})
}

func (a *actionService) UnlinkUser(actionID uint, userID string) error {
	return a.DB.Model(&model.Action{
		Model: gorm.Model{
			ID: actionID,
		},
	}).
		Association("AssignedUsers").
		Delete(&model.User{
			ID: userID,
		})
}

func (a *actionService) LinkTag(actionID, tagID uint) error {
	return a.DB.Model(&model.Action{
		Model: gorm.Model{
			ID: actionID,
		},
	}).
		Association("Tags").
		Append(&model.Tag{
			Model: gorm.Model{
				ID: tagID,
			},
		})
}

func (a *actionService) UnlinkTag(actionID, tagID uint) error {
	return a.DB.Model(&model.Action{
		Model: gorm.Model{
			ID: actionID,
		},
	}).
		Association("Tags").
		Delete(&model.Tag{
			Model: gorm.Model{
				ID: tagID,
			},
		})
}

func (a *actionService) CloseAction(id uint) error {
	return a.DB.Model(&model.Action{
		Model: gorm.Model{
			ID: id,
		},
	}).
		Update("ClosedAt", time.Now()).
		Error
}

func (a *actionService) OpenAction(id uint) error {
	return a.DB.Model(&model.Action{
		Model: gorm.Model{
			ID: id,
		},
	}).
		Update("ClosedAt", nil).
		Error
}
