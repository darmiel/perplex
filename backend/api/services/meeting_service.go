package services

import (
	"github.com/darmiel/perplex/pkg/model"
	"gorm.io/gorm"
	"time"
)

type MeetingService interface {
	AddMeeting(projectID uint, creatorUserID, name, description string, startDate time.Time) (*model.Meeting, error)
	GetMeeting(meetingID uint) (*model.Meeting, error)
	FindMeetingsForProject(projectID uint) ([]*model.Meeting, error)
	DeleteMeeting(meetingID uint) error
	EditMeeting(meetingID uint, newName, newDescription string, newStartDate time.Time) error
	Extend(meeting *model.Meeting, preload ...string) error
}

type meetingService struct {
	DB *gorm.DB
}

func NewMeetingService(db *gorm.DB) MeetingService {
	return &meetingService{
		DB: db,
	}
}

func (m *meetingService) AddMeeting(projectID uint, creatorUserID, name, description string, startDate time.Time) (resp *model.Meeting, err error) {
	resp = &model.Meeting{
		Name:        name,
		Description: description,
		StartDate:   startDate,
		ProjectID:   projectID,
		CreatorID:   creatorUserID,
	}
	err = m.DB.Create(resp).Error
	return
}

func (m *meetingService) GetMeeting(meetingID uint) (resp *model.Meeting, err error) {
	err = m.DB.
		First(&resp, &model.Meeting{
			Model: gorm.Model{
				ID: meetingID,
			},
		}).Error
	return
}

func (m *meetingService) FindMeetingsForProject(projectID uint) (resp []*model.Meeting, err error) {
	err = m.DB.Where("project_id = ?", projectID).Find(&resp).Error
	return
}

func (m *meetingService) DeleteMeeting(meetingID uint) error {
	res := m.DB.Delete(&model.Meeting{
		Model: gorm.Model{
			ID: meetingID,
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

func (m *meetingService) EditMeeting(meetingID uint, newName, newDescription string, newStartDate time.Time) error {
	return m.DB.Where("id = ?", meetingID).Updates(&model.Meeting{
		Name:        newName,
		Description: newDescription,
		StartDate:   newStartDate,
	}).Error
}

func (m *meetingService) Extend(meeting *model.Meeting, preload ...string) error {
	q := m.DB
	for _, p := range preload {
		q = q.Preload(p)
	}
	return q.First(meeting).Error
}
