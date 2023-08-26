package services

import (
	"github.com/darmiel/dmp/pkg/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type UserService interface {
	ChangeName(userID, newName string) error
	GetName(userID string) (string, error)
}

type userService struct {
	DB *gorm.DB
}

func NewUserService(db *gorm.DB) UserService {
	return &userService{
		DB: db,
	}
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
