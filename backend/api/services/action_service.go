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
	//
	FindTag(tagID uint) (*model.Tag, error)
	FindTagsByProject(projectID uint) ([]model.Tag, error)
	CreateTag(title, color string, projectID uint) (*model.Tag, error)
	DeleteTag(tagID uint) error
	EditTag(tagID uint, title, color string) error
	//
	FindPriority(priorityID uint) (*model.Priority, error)
	FindPrioritiesByProject(projectID uint) ([]model.Priority, error)
	CreatePriority(title, color string, weight int, projectID uint) (*model.Priority, error)
	DeletePriority(priorityID uint) error
	EditPriority(priorityID uint, title, color string, weight int) error
}

type actionService struct {
	DB *gorm.DB
}

func NewActionService(db *gorm.DB) ActionService {
	return &actionService{
		DB: db,
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
		Where(model.Action{
			PriorityID: priorityID,
		}).
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
	action := model.Action{
		Title:       title,
		Description: description,
		DueDate:     dueDate,
		PriorityID:  priorityID,
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
		if _, err := a.FindPriority(priorityID); err != nil {
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

// Tags

func (a *actionService) FindTag(tagID uint) (*model.Tag, error) {
	var tag model.Tag
	if err := a.DB.First(&tag, tagID).Error; err != nil {
		return nil, err
	}
	return &tag, nil
}

func (a *actionService) FindTagsByProject(projectID uint) ([]model.Tag, error) {
	var tags []model.Tag
	if err := a.DB.Where(model.Tag{
		ProjectID: projectID,
	}).Find(&tags).Error; err != nil {
		return nil, err
	}
	return tags, nil
}

func (a *actionService) CreateTag(title, color string, projectID uint) (*model.Tag, error) {
	tag := model.Tag{
		Title:     title,
		Color:     color,
		ProjectID: projectID,
	}
	if err := a.DB.Create(&tag).Error; err != nil {
		return nil, err
	}
	return &tag, nil
}

func (a *actionService) DeleteTag(tagID uint) error {
	// find all actions with this tag and remove it
	if actions, err := a.FindActionsByTag(tagID); err != nil {
		return err
	} else {
		for _, action := range actions {
			if err = a.UnlinkTag(action.ID, tagID); err != nil {
				return err
			}
		}
	}
	// delete tag
	return a.DB.Delete(&model.Tag{
		Model: gorm.Model{
			ID: tagID,
		},
	}).Error
}

func (a *actionService) EditTag(tagID uint, title, color string) error {
	return a.DB.Updates(&model.Tag{
		Model: gorm.Model{
			ID: tagID,
		},
		Title: title,
		Color: color,
	}).Error
}

// Priorities

func (a *actionService) FindPriority(priorityID uint) (*model.Priority, error) {
	var priority model.Priority
	if err := a.DB.First(&priority, priorityID).Error; err != nil {
		return nil, err
	}
	return &priority, nil
}

func (a *actionService) FindPrioritiesByProject(projectID uint) ([]model.Priority, error) {
	var priorities []model.Priority
	if err := a.DB.Where(&model.Priority{
		ProjectID: projectID,
	}).Find(&priorities).Error; err != nil {
		return nil, err
	}
	return priorities, nil
}

func (a *actionService) CreatePriority(title, color string, weight int, projectID uint) (*model.Priority, error) {
	priority := model.Priority{
		Title:     title,
		Color:     color,
		Weight:    weight,
		ProjectID: projectID,
	}
	if err := a.DB.Create(&priority).Error; err != nil {
		return nil, err
	}
	return &priority, nil
}

func (a *actionService) DeletePriority(priorityID uint) error {
	// find all actions with this tag and remove it
	if actions, err := a.FindActionsByPriority(priorityID); err != nil {
		return err
	} else {
		for _, action := range actions {
			if err = a.EditAction(action.ID, action.Title, action.Description, action.DueDate, 0); err != nil {
				return err
			}
		}
	}
	return a.DB.Delete(&model.Priority{
		Model: gorm.Model{
			ID: priorityID,
		},
	}).Error
}

func (a *actionService) EditPriority(priorityID uint, title, color string, weight int) error {
	return a.DB.Updates(&model.Priority{
		Model: gorm.Model{
			ID: priorityID,
		},
		Title:  title,
		Weight: weight,
		Color:  color,
	}).Error
}
