package services

import (
	"github.com/darmiel/dmp/pkg/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"regexp"
)

type UserService interface {
	FindUser(userID string) (*model.User, error)
	ChangeName(userID, newName string) error
	GetName(userID string) (string, error)
	ListUsers(query string, page int) (res []*model.User, err error)
}

type userService struct {
	DB *gorm.DB
}

func NewUserService(db *gorm.DB) UserService {
	return &userService{
		DB: db,
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
