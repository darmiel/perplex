package services

import (
	"errors"
	"github.com/darmiel/perplex/pkg/model"
	"gorm.io/gorm"
)

var ErrCommentIsSolution = errors.New("cannot delete solution")

type CommentService interface {
	AddComment(authorID string, topicID uint, content string) (*model.Comment, error)
	GetComment(commentID uint) (*model.Comment, error)
	ListCommentsForTopic(topicID uint) ([]*model.Comment, error)
	EditComment(commentID uint, newContent string) error
	DeleteComment(commentID uint) error
	MarkCommentSolution(commentID uint) error
	UnmarkCommentSolution(commentID uint) error
}

type commentService struct {
	DB           *gorm.DB
	topicService TopicService
}

func NewCommentService(db *gorm.DB, topicService TopicService) CommentService {
	return &commentService{
		DB:           db,
		topicService: topicService,
	}
}

func (c *commentService) AddComment(authorID string, topicID uint, content string) (res *model.Comment, err error) {
	res = &model.Comment{
		AuthorID: authorID,
		Content:  content,
		TopicID:  topicID,
	}
	err = c.DB.Create(res).Error
	return
}

func (c *commentService) GetComment(commentID uint) (res *model.Comment, err error) {
	err = c.DB.First(&res, &model.Comment{
		Model: gorm.Model{
			ID: commentID,
		},
	}).Error
	return
}

func (c *commentService) ListCommentsForTopic(topicID uint) (res []*model.Comment, err error) {
	err = c.DB.Find(&res, &model.Comment{
		TopicID: topicID,
	}).Error
	return
}

func (c *commentService) EditComment(commentID uint, newContent string) error {
	return c.DB.Updates(&model.Comment{
		Model: gorm.Model{
			ID: commentID,
		},
		Content: newContent,
	}).Error
}

func (c *commentService) DeleteComment(commentID uint) error {
	// check if comment is solution
	var comment model.Comment
	if err := c.DB.First(&comment, &model.Comment{
		Model: gorm.Model{
			ID: commentID,
		},
	}).Error; err != nil {
		return err
	}
	// get topic of comment
	topic, err := c.topicService.GetTopic(comment.TopicID)
	if err != nil {
		return err
	}
	// check if comment is solution
	if topic.SolutionID == commentID {
		return ErrCommentIsSolution
	}
	return c.DB.Delete(&model.Comment{
		Model: gorm.Model{
			ID: commentID,
		},
	}).Error
}

func (c *commentService) toggleCommentSolution(commentID uint, status bool) error {
	// find comment
	comment, err := c.GetComment(commentID)
	if err != nil {
		return err
	}
	// find corresponding topic
	topic, err := c.topicService.GetTopic(comment.TopicID)
	if err != nil {
		return err
	}
	newSolutionComment := commentID
	if !status {
		newSolutionComment = 0 // no solution comment
	}
	return c.topicService.SetSolution(topic.ID, newSolutionComment)
}

func (c *commentService) MarkCommentSolution(commentID uint) error {
	return c.toggleCommentSolution(commentID, true)
}

func (c *commentService) UnmarkCommentSolution(commentID uint) error {
	return c.toggleCommentSolution(commentID, false)
}
