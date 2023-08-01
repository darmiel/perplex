package services

import (
	"errors"
	"github.com/darmiel/dmp/pkg/model"
	"gorm.io/gorm"
)

var (
	ErrNoRowsAffected = errors.New("no matches found")
)

type ProjectService interface {
	FindProject(id uint) (*model.Project, error)
	FindProjectsByOwner(userID string) ([]model.Project, error)
	FindProjectsByUserAccess(userID string) ([]model.Project, error)
	CreateProject(name, description, ownerID string) (*model.Project, error)
	DeleteProject(id uint) error
	EditProject(id uint, name, description string) error
}

type projectService struct {
	DB *gorm.DB
}

func NewProjectService(db *gorm.DB) ProjectService {
	return &projectService{
		DB: db,
	}
}

func (p *projectService) FindProject(id uint) (res *model.Project, err error) {
	err = p.DB.Where("id = ?", id).First(&res).Error
	return
}

func (p *projectService) CreateProject(name, description, ownerID string) (res *model.Project, err error) {
	res = &model.Project{
		Name:        name,
		Description: description,
		OwnerID:     ownerID,
	}
	err = p.DB.Create(res).Error
	return
}

func (p *projectService) FindProjectsByOwner(userID string) (res []model.Project, err error) {
	err = p.DB.Where("owner_id = ?", userID).Find(&res).Error
	return
}

func (p *projectService) FindProjectsByUserAccess(userID string) ([]model.Project, error) {
	var user model.User
	if err := p.DB.Preload("UserProjects").Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, err
	}
	return user.UserProjects, nil
}

func (p *projectService) DeleteProject(id uint) error {
	res := p.DB.Delete(model.Project{
		Model: gorm.Model{
			ID: id,
		},
	})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected <= 0 {
		return ErrNoRowsAffected
	}
	return nil
}

func (p *projectService) EditProject(id uint, name, description string) error {
	return p.DB.Where("id = ?", id).Updates(&model.Project{
		Name:        name,
		Description: description,
	}).Error
}
