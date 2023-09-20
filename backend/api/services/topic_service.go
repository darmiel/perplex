package services

import (
	"database/sql"
	"github.com/darmiel/perplex/pkg/lexorank"
	"github.com/darmiel/perplex/pkg/model"
	"gorm.io/gorm"
	"time"
)

type TopicService interface {
	AddTopic(creatorID string, meetingID uint, title, description string, forceSolution bool, priorityID uint) (*model.Topic, error)
	GetTopic(topicID uint, preload ...string) (*model.Topic, error)
	ListTopicsForMeeting(meetingID uint) ([]*model.Topic, error)
	DeleteTopic(topicID uint) error
	EditTopic(topicID uint, title, description string, forceSolution bool, priorityID uint) error
	SetSolution(topicID uint, commentID uint) error
	CheckTopic(topicID uint) error
	UncheckTopic(topicID uint) error
	Extend(topic *model.Topic, preload ...string) error
	LinkTag(topicID, tagID uint) error
	UnlinkTag(topicID, tagID uint) error
	LinkUser(topicID uint, userID string) error
	UnlinkUser(topicID uint, userID string) error
}

type topicService struct {
	DB      *gorm.DB
	projSrv ProjectService
}

func NewTopicService(db *gorm.DB, projSrv ProjectService) TopicService {
	return &topicService{
		DB:      db,
		projSrv: projSrv,
	}
}

func (m *topicService) preload() *gorm.DB {
	return m.DB.Preload("Tags").
		Preload("AssignedUsers").
		Preload("Priority")
}

func (m *topicService) AddTopic(
	creatorID string,
	meetingID uint,
	title, description string,
	forceSolution bool,
	priorityID uint,
) (res *model.Topic, err error) {
	var priorityIDCreate *uint
	if priorityID > 0 {
		if _, err := m.projSrv.FindPriority(priorityID); err != nil {
			return nil, err
		}
		priorityIDCreate = &priorityID
	}
	// find how many topics have been created for the meeting
	var count int64
	if err = m.DB.Model(&model.Topic{}).
		Where("meeting_id = ?", meetingID).
		Count(&count).Error; err != nil {
		return nil, err
	}
	res = &model.Topic{
		Title:         title,
		Description:   description,
		CreatorID:     creatorID,
		ForceSolution: forceSolution,
		MeetingID:     meetingID,
		PriorityID:    priorityIDCreate,
		LexoRank:      lexorank.GetAlphabetForIndex(count),
	}
	err = m.DB.Create(res).Error
	return
}

func (m *topicService) GetTopic(topicID uint, preload ...string) (res *model.Topic, err error) {
	q := m.preload()
	for _, p := range preload {
		q = q.Preload(p)
	}
	err = q.First(&res, &model.Topic{
		Model: gorm.Model{
			ID: topicID,
		},
	}).Error
	return
}

func (m *topicService) ListTopicsForMeeting(meetingID uint) (res []*model.Topic, err error) {
	err = m.preload().
		Preload("Creator").
		Order("lexo_rank").
		Find(&res, &model.Topic{
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

func (m *topicService) EditTopic(topicID uint, title, description string, forceSolution bool, priorityID uint) error {
	var priorityIDEdit interface{} = nil
	if priorityID != 0 {
		if _, err := m.projSrv.FindPriority(priorityID); err != nil {
			return err
		}
		priorityIDEdit = priorityID
	}
	return m.DB.Updates(&model.Topic{
		Model: gorm.Model{
			ID: topicID,
		},
		Title:       title,
		Description: description,
	}).Update("force_solution", forceSolution).
		Update("PriorityID", priorityIDEdit).
		Error
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

func (m *topicService) LinkTag(topicID, tagID uint) error {
	return m.DB.Model(&model.Topic{
		Model: gorm.Model{
			ID: topicID,
		},
	}).
		Association("Tags").
		Append(&model.Tag{
			Model: gorm.Model{
				ID: tagID,
			},
		})
}

func (m *topicService) UnlinkTag(topicID, tagID uint) error {
	return m.DB.Model(&model.Topic{
		Model: gorm.Model{
			ID: topicID,
		},
	}).
		Association("Tags").
		Delete(&model.Tag{
			Model: gorm.Model{
				ID: tagID,
			},
		})
}

func (m *topicService) LinkUser(topicID uint, userID string) error {
	return m.DB.Model(&model.Topic{
		Model: gorm.Model{
			ID: topicID,
		},
	}).
		Association("AssignedUsers").
		Append(&model.User{
			ID: userID,
		})
}

func (m *topicService) UnlinkUser(topicID uint, userID string) error {
	return m.DB.Model(&model.Topic{
		Model: gorm.Model{
			ID: topicID,
		},
	}).
		Association("AssignedUsers").
		Delete(&model.User{
			ID: userID,
		})
}
