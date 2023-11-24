package services

import (
	"errors"
	"fmt"
	"github.com/darmiel/perplex/pkg/model"
	"gorm.io/gorm"
	"time"
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
	FindTag(tagID uint) (*model.Tag, error)
	FindTagsByProject(projectID uint) ([]model.Tag, error)
	CreateTag(title, color string, projectID uint) (*model.Tag, error)
	DeleteTag(tagID uint) error
	EditTag(tagID uint, title, color string) error
	FindPriority(priorityID uint) (*model.Priority, error)
	FindPrioritiesByProject(projectID uint) ([]model.Priority, error)
	CreatePriority(title, color string, weight int, projectID uint) (*model.Priority, error)
	DeletePriority(priorityID uint) error
	EditPriority(priorityID uint, title, color string, weight int) error
	CreateFile(projectID uint, file model.ProjectFile) error
	FindFile(projectID uint, fileID uint) (*model.ProjectFile, error)
	FindFiles(projectID uint) ([]model.ProjectFile, error)
	DeleteFile(projectID uint, fileID uint) error
	GetTotalProjectFileSize(projectID uint) (uint64, error)
	UpdateFileAccess(fileID uint) error
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
	if err := p.DB.
		Preload("UserProjects").
		Where("id = ?", userID).
		Find(&user).Error; err != nil {
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

// Tags

func (p *projectService) FindTag(tagID uint) (*model.Tag, error) {
	var tag model.Tag
	if err := p.DB.First(&tag, tagID).Error; err != nil {
		return nil, err
	}
	return &tag, nil
}

func (p *projectService) FindTagsByProject(projectID uint) ([]model.Tag, error) {
	var tags []model.Tag
	if err := p.DB.Where(model.Tag{
		ProjectID: projectID,
	}).Find(&tags).Error; err != nil {
		return nil, err
	}
	return tags, nil
}

func (p *projectService) CreateTag(title, color string, projectID uint) (*model.Tag, error) {
	tag := model.Tag{
		Title:     title,
		Color:     color,
		ProjectID: projectID,
	}
	if err := p.DB.Create(&tag).Error; err != nil {
		return nil, err
	}
	return &tag, nil
}

func (p *projectService) DeleteTag(tagID uint) error {
	// delete tag | TODO: delete all relations with this tag
	return p.DB.Delete(&model.Tag{
		Model: gorm.Model{
			ID: tagID,
		},
	}).Error
}

func (p *projectService) EditTag(tagID uint, title, color string) error {
	return p.DB.Updates(&model.Tag{
		Model: gorm.Model{
			ID: tagID,
		},
		Title: title,
		Color: color,
	}).Error
}

// Priorities

func (p *projectService) FindPriority(priorityID uint) (*model.Priority, error) {
	var priority model.Priority
	if err := p.DB.First(&priority, priorityID).Error; err != nil {
		return nil, err
	}
	return &priority, nil
}

func (p *projectService) FindPrioritiesByProject(projectID uint) ([]model.Priority, error) {
	var priorities []model.Priority
	if err := p.DB.Where(&model.Priority{
		ProjectID: projectID,
	}).Find(&priorities).Error; err != nil {
		return nil, err
	}
	return priorities, nil
}

func (p *projectService) CreatePriority(title, color string, weight int, projectID uint) (*model.Priority, error) {
	priority := model.Priority{
		Title:     title,
		Color:     color,
		Weight:    weight,
		ProjectID: projectID,
	}
	if err := p.DB.Create(&priority).Error; err != nil {
		return nil, err
	}
	return &priority, nil
}

func (p *projectService) DeletePriority(priorityID uint) error {
	// find all actions with this tag and remove it
	return p.DB.Delete(&model.Priority{
		Model: gorm.Model{
			ID: priorityID,
		},
	}).Error
}

func (p *projectService) EditPriority(priorityID uint, title, color string, weight int) error {
	return p.DB.Updates(&model.Priority{
		Model: gorm.Model{
			ID: priorityID,
		},
		Title:  title,
		Weight: weight,
		Color:  color,
	}).Error
}

// Files

func (p *projectService) CreateFile(projectID uint, file model.ProjectFile) error {
	file.ProjectID = projectID
	return p.DB.Create(&file).Error
}

func (p *projectService) FindFile(projectID uint, fileID uint) (*model.ProjectFile, error) {
	var file model.ProjectFile
	if err := p.DB.Where(&model.ProjectFile{
		Model: gorm.Model{
			ID: fileID,
		},
		ProjectID: projectID,
	}).First(&file).Error; err != nil {
		return nil, err
	}
	return &file, nil
}

func (p *projectService) FindFiles(projectID uint) ([]model.ProjectFile, error) {
	var files []model.ProjectFile
	if err := p.DB.Where(&model.ProjectFile{
		ProjectID: projectID,
	}).Find(&files).Error; err != nil {
		return nil, err
	}
	return files, nil
}

func (p *projectService) DeleteFile(projectID uint, fileID uint) error {
	return p.DB.Delete(&model.ProjectFile{
		Model: gorm.Model{
			ID: fileID,
		},
		ProjectID: projectID,
	}).Error
}

func (p *projectService) GetTotalProjectFileSize(projectID uint) (uint64, error) {
	var size uint64
	if err := p.DB.Model(&model.ProjectFile{}).
		Where("project_id = ?", projectID).
		Select("sum(size)").
		Scan(&size).Error; err != nil {
		fmt.Println("oh oh gorm error!")
		return 0, err
	}
	return size, nil
}

func (p *projectService) UpdateFileAccess(fileID uint) error {
	// set last accessed date to now and increment access count
	return p.DB.Model(&model.ProjectFile{}).
		Where("id = ?", fileID).
		Update("access_count", gorm.Expr("access_count + 1")).
		Update("last_accessed", time.Now()).
		Error
}
