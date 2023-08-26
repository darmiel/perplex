package services

import (
	"errors"
	"github.com/darmiel/dmp/pkg/model"
	"gorm.io/gorm"
)

var (
	ErrNotMatches = errors.New("no matches found")
)

type ProjectService interface {
	FindProject(id uint, preload ...string) (*model.Project, error)
	FindProjectOwnedBy(projectID int, ownerID string) (*model.Project, error)
	FindProjectsByOwner(userID string) ([]model.Project, error)
	FindProjectsByUserAccess(userID string) ([]model.Project, error)
	CreateProject(name, description, ownerID string) (*model.Project, error)
	DeleteProject(id uint) error
	AddUser(projectID uint, userID string) error
	RemoveUser(projectID uint, userID string) error
	EditProject(id uint, name, description string) error
	Extend(project *model.Project, preload ...string) error
}

type projectService struct {
	DB *gorm.DB
}

func NewProjectService(db *gorm.DB) ProjectService {
	return &projectService{
		DB: db,
	}
}

func (p *projectService) FindProject(id uint, preload ...string) (res *model.Project, err error) {
	q := p.DB
	for _, p := range preload {
		q = q.Preload(p)
	}
	err = q.First(&res, id).Error
	return
}

func (p *projectService) FindProjectOwnedBy(projectID int, ownerID string) (res *model.Project, err error) {
	var projects []*model.Project
	err = p.DB.Find(&projects, &model.Project{
		Model: gorm.Model{
			ID: uint(projectID),
		},
		OwnerID: ownerID,
	}).Error
	if len(projects) <= 0 {
		return nil, ErrNotMatches
	}
	return projects[0], nil
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
	var user []model.User
	if err := p.DB.Preload("UserProjects").Where("id = ?", userID).Find(&user).Error; err != nil {
		return nil, err
	}
	if len(user) <= 0 {
		return nil, nil
	}
	return user[0].UserProjects, nil
}

func (p *projectService) DeleteProject(id uint) error {
	res := p.DB.Delete(&model.Project{
		Model: gorm.Model{
			ID: id,
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

func (p *projectService) EditProject(id uint, name, description string) error {
	return p.DB.Where("id = ?", id).Updates(&model.Project{
		Name:        name,
		Description: description,
	}).Error
}

func (p *projectService) Extend(project *model.Project, preload ...string) error {
	q := p.DB
	for _, p := range preload {
		q = q.Preload(p)
	}
	return q.First(project).Error
}

func (p *projectService) AddUser(projectID uint, userID string) error {
	var project model.Project
	if err := p.DB.Preload("Users").First(&project, projectID).Error; err != nil {
		return err
	}
	var user model.User
	if err := p.DB.First(&user, &model.User{
		ID: userID,
	}).Error; err != nil {
		return err
	}
	return p.DB.Model(&project).Association("Users").Append(&user)
}

func (p *projectService) RemoveUser(projectID uint, userID string) error {
	var project model.Project
	if err := p.DB.Preload("Users").First(&project, projectID).Error; err != nil {
		return err
	}
	var user model.User
	if err := p.DB.First(&user, &model.User{
		ID: userID,
	}).Error; err != nil {
		return err
	}
	return p.DB.Model(&project).Association("Users").Delete(&user)
}
