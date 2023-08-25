package services

import (
	"database/sql"
	"fmt"
	"github.com/darmiel/dmp/pkg/model"
	"gorm.io/gorm"
	"time"
)

type TopicService interface {
	AddTopic(creatorID string, meetingID uint, title, description string, forceSolution bool) (*model.Topic, error)
	GetTopic(topicID uint) (*model.Topic, error)
	ListTopicsForMeeting(meetingID uint) ([]*model.Topic, error)
	DeleteTopic(topicID uint) error
	EditTopic(topicID uint, title, description string, forceSolution bool) error
	SetSolution(topicID uint, commentID uint) error
	CheckTopic(topicID uint) error
	UncheckTopic(topicID uint) error
	AssignUsersToTopic(topicID uint, userIDs []string) error
	Extend(topic *model.Topic, preload ...string) error
}

type topicService struct {
	DB *gorm.DB
}

func NewTopicService(db *gorm.DB) TopicService {
	return &topicService{
		DB: db,
	}
}

func (m *topicService) AddTopic(
	creatorID string,
	meetingID uint,
	title, description string,
	forceSolution bool,
) (res *model.Topic, err error) {
	res = &model.Topic{
		Title:         title,
		Description:   description,
		CreatorID:     creatorID,
		ForceSolution: forceSolution,
		MeetingID:     meetingID,
	}
	err = m.DB.Create(res).Error
	return
}

func (m *topicService) GetTopic(topicID uint) (res *model.Topic, err error) {
	err = m.DB.Preload("AssignedUsers").First(&res, &model.Topic{
		Model: gorm.Model{
			ID: topicID,
		},
	}).Error
	return
}

func (m *topicService) ListTopicsForMeeting(meetingID uint) (res []*model.Topic, err error) {
	err = m.DB.Preload("AssignedUsers").Preload("Creator").Find(&res, &model.Topic{
		MeetingID: meetingID,
	}).Error
	return
}

func (m *topicService) AssignUsersToTopic(topicID uint, userIDs []string) error {
	var topic model.Topic
	if err := m.DB.Preload("AssignedUsers").First(&topic, topicID).Error; err != nil {
		return err
	}
	if err := m.DB.Model(&topic).Association("AssignedUsers").Delete(topic.AssignedUsers); err != nil {
		return err
	}
	if len(userIDs) > 0 {
		var users []model.User
		if err := m.DB.Find(&users, userIDs).Error; err != nil {
			return err
		}
		if err := m.DB.Model(&topic).Association("AssignedUsers").Append(users); err != nil {
			return err
		}
	}
	return nil
}

func (m *topicService) DeleteTopic(topicID uint) error {
	res := m.DB.Delete(&model.Topic{
		Model: gorm.Model{
			ID: topicID,
		},
	})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected <= 0 {
		return ErrNotMatches
	}
	return nil
}

func (m *topicService) EditTopic(topicID uint, title, description string, forceSolution bool) error {
	fmt.Println("updates:", topicID, title, description, forceSolution)
	return m.DB.Updates(&model.Topic{
		Model: gorm.Model{
			ID: topicID,
		},
		Title:       title,
		Description: description,
	}).Update("force_solution", forceSolution).Error
}

func (m *topicService) SetSolution(topicID uint, commentID uint) error {
	return m.DB.Model(&model.Topic{}).
		Where("id = ?", topicID).
		Update("solution_id", commentID).
		Error
}

func (m *topicService) toggleTopic(topicID uint, close bool) error {
	var t sql.NullTime
	if close {
		t.Time = time.Now()
		t.Valid = true
	}
	return m.DB.Model(&model.Topic{}).Where("id = ?", topicID).Update("closed_at", t).Error
}

func (m *topicService) CheckTopic(topicID uint) error {
	return m.toggleTopic(topicID, true)
}

func (m *topicService) UncheckTopic(topicID uint) error {
	return m.toggleTopic(topicID, false)
}

func (m *topicService) Extend(topic *model.Topic, preload ...string) error {
	q := m.DB
	for _, p := range preload {
		q = q.Preload(p)
	}
	return q.First(topic).Error
}
