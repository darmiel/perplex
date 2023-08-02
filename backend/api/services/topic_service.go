package services

import (
	"database/sql"
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
	err = m.DB.First(&res, &model.Topic{
		Model: gorm.Model{
			ID: topicID,
		},
	}).Error
	return
}

func (m *topicService) ListTopicsForMeeting(meetingID uint) (res []*model.Topic, err error) {
	err = m.DB.Find(&res, &model.Topic{
		MeetingID: meetingID,
	}).Error
	return
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
	return m.DB.Updates(&model.Topic{
		Model: gorm.Model{
			ID: topicID,
		},
		Title:       title,
		Description: description,
	}).Update("force_solution", forceSolution).Error
}

func (m *topicService) SetSolution(topicID uint, commentID uint) error {
	return m.DB.Updates(&model.Topic{
		Model: gorm.Model{
			ID: topicID,
		},
		SolutionID: commentID,
	}).Error
}

func (m *topicService) toggleTopic(topicID uint, close bool) error {
	var t sql.NullTime
	if close {
		t.Time = time.Now()
		t.Valid = true
	}
	return m.DB.Where(&model.Topic{Model: gorm.Model{ID: topicID}}).Update("closed_at", t).Error
}

func (m *topicService) CheckTopic(topicID uint) error {
	return m.toggleTopic(topicID, true)
}

func (m *topicService) UncheckTopic(topicID uint) error {
	return m.toggleTopic(topicID, false)
}
