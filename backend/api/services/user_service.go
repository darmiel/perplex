package services

import (
	"fmt"
	"github.com/darmiel/perplex/pkg/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"regexp"
	"sort"
	"time"
)

type UserService interface {
	FindUser(userID string) (*model.User, error)
	ChangeName(userID, newName string) error
	GetName(userID string) (string, error)
	ListUsers(query string, page int) (res []*model.User, err error)
	ListUpcomingMeetings(userID string) []*model.Meeting

	FindNotifications(userID string, unreadOnly bool) ([]*model.Notification, error)
	MarkNotificationRead(userID string, notificationID uint) error
	MarkAllNotificationsRead(userID string) error
	CreateNotification(userID, title, suffix, message, link, linkTitle string) error
}

type userService struct {
	DB      *gorm.DB
	projSrv ProjectService
	meetSrv MeetingService
}

func NewUserService(db *gorm.DB, projSrv ProjectService, meetSrv MeetingService) UserService {
	return &userService{
		DB:      db,
		projSrv: projSrv,
		meetSrv: meetSrv,
	}
}

func (u userService) FindUser(userID string) (res *model.User, err error) {
	err = u.DB.First(&res, &model.User{ID: userID}).Error
	return
}

func (u userService) ChangeName(userID, newName string) error {
	return u.DB.Clauses(clause.OnConflict{
		UpdateAll: true,
	}).Create(&model.User{
		ID:       userID,
		UserName: newName,
	}).Error
}

func (u userService) GetName(userID string) (res string, err error) {
	var user model.User
	if err = u.DB.First(&user, &model.User{ID: userID}).Error; err == nil {
		res = user.UserName
	}
	return
}

var UserNameDisallowed = regexp.MustCompile(`[^a-zA-Z0-9_]`)

func (u userService) ListUsers(query string, page int) (res []*model.User, err error) {
	pageSize := 5
	err = u.DB.Where("user_name LIKE ?", "%"+UserNameDisallowed.ReplaceAllString(query, "")+"%").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&res).Error
	return
}

func (u userService) ListUpcomingMeetings(userID string) (res []*model.Meeting) {
	// get all projects the user has access to
	projects := make(map[uint]bool)
	if p, err := u.projSrv.FindProjectsByOwner(userID); err == nil {
		for _, p := range p {
			projects[p.ID] = true
		}
	}
	if p, err := u.projSrv.FindProjectsByUserAccess(userID); err == nil {
		for _, p := range p {
			projects[p.ID] = true
		}
	}
	// get all meetings from these projects
	meetings := make(map[uint]*model.Meeting)
	for p := range projects {
		if m, err := u.meetSrv.FindMeetingsForProject(p); err == nil {
			for _, meeting := range m {
				fmt.Println("meeting", meeting.Name, meeting.StartDate)
				meetings[meeting.ID] = meeting
			}
		}
	}
	// remove all meetings from the past
	now := time.Now().Add(-2 * time.Hour)
	for _, m := range meetings {
		if m.StartDate.After(now) {
			res = append(res, m)
		}
	}
	// sort by start date
	sort.Slice(res, func(i, j int) bool {
		return res[i].StartDate.Before(res[j].StartDate)
	})
	return
}

func (u userService) FindNotifications(userID string, unreadOnly bool) (res []*model.Notification, err error) {
	q := u.DB.Where(&model.Notification{
		UserID: userID,
	})
	if unreadOnly {
		q = q.Where("read_at IS NULL")
	}
	err = q.Find(&res).Error
	return
}

func (u userService) MarkNotificationRead(userID string, notificationID uint) error {
	return u.DB.Model(&model.Notification{}).
		Where(&model.Notification{
			Model: gorm.Model{
				ID: notificationID,
			},
			UserID: userID,
		}).
		Update("read_at", time.Now()).
		Error
}

func (u userService) MarkAllNotificationsRead(userID string) error {
	return u.DB.Model(&model.Notification{}).
		Where(&model.Notification{
			UserID: userID,
		}).
		Where("read_at IS NULL").
		Update("read_at", time.Now()).
		Error
}

func (u userService) CreateNotification(userID, title, suffix, message, link, linkTitle string) error {
	return u.DB.Create(&model.Notification{
		Title:       title,
		Suffix:      suffix,
		Description: message,
		UserID:      userID,
		Link:        link,
		LinkTitle:   linkTitle,
	}).Error
}
