package model

import (
	"database/sql"
	"gorm.io/gorm"
	"time"
)

// User represents a user which can log in (obviously)
type User struct {
	// ID is generated by firebase (in the best case)
	ID string `gorm:"primarykey" json:"id,omitempty"`
	// Name is the username which is displayed in the frontend
	Name string `json:"name,omitempty"`
	// CreatedAt is the time when the entry was first created
	CreatedAt time.Time `json:"created_at"`
	// UpdatedAt is the time when the entry was modified
	UpdatedAt time.Time `json:"updated_at"`
	// DeletedAt is the time when the entry was (soft-) removed
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
	// OwnerProjects contains a list of all projects the user is owner of
	OwnerProjects []Project `gorm:"foreignKey:OwnerID" json:"owner_projects,omitempty"`
	// UserProjects contains a list of all projects the user has access to
	UserProjects []Project `gorm:"many2many:user_projects;" json:"user_projects,omitempty"`
	// AssignedTopics contains all topics the user was assigned to
	AssignedTopics []Topic `gorm:"many2many:user_topic_assignments" json:"assigned_users"`
}

// Comment represents a comment in a topic
type Comment struct {
	gorm.Model
	// AuthorID is the id of the author of the comment
	AuthorID string `json:"author_id,omitempty"`
	// Author is the author of the comment
	Author User `json:"author,omitempty"`
	// Content is the comment content as markdown
	Content string `json:"content,omitempty"`
	// TopicID is the ID of the topic the comment belongs to
	TopicID uint `json:"topic_id,omitempty"`
}

// Topic represents a ToDo-Point for the meeting
type Topic struct {
	gorm.Model
	// Title of the topic
	Title string `json:"title,omitempty"`
	// Description of the topic
	Description string `json:"description,omitempty"`
	// ID of the creator of the topic
	CreatorID string `json:"creator_id,omitempty"`
	// Creator of the topic
	Creator User `json:"creator,omitempty"`
	// Comments in the topic
	Comments []Comment `json:"comments,omitempty"`
	// SolutionID is the ID of the comment which represents the solution of this topic
	SolutionID uint `json:"solution_id,omitempty"`
	// Solution is the comment which represents the solution of this topic
	Solution Comment `json:"solution,omitempty"`
	// ClosedAt represents the time when the topic was resolved (if valid)
	ClosedAt sql.NullTime `json:"closed_at"`
	// ForceSolution requires a solution to be able to close topic if true
	ForceSolution bool `json:"force_solution,omitempty"`
	// MeetingID is the ID of the meeting the topic belongs to
	MeetingID uint `json:"meeting_id,omitempty"`
	// AssignedUsers contains a list of users assigned to a topic
	AssignedUsers []User `gorm:"many2many:user_topic_assignments" json:"assigned_users"`
}

// Meeting represents a meeting (who would've guessed)
type Meeting struct {
	gorm.Model
	// Name if the meeting
	Name string `json:"name,omitempty"`
	// StartDate of the meeting
	StartDate time.Time `json:"start_date"`
	// Topics of the meeting
	Topics []Topic `json:"topics,omitempty"`
	// ProjectID is the project the meeting belongs to
	ProjectID uint `json:"project_id,omitempty"`
	// ID of the creator of the meeting
	CreatorID string `json:"creator_id,omitempty"`
	// Creator of the meeting
	Creator User `json:"creator,omitempty"`
}

// Project is a custom "realm" where meetings are saved
type Project struct {
	gorm.Model
	// Name is the name of the project and displayed in the frontend
	Name string `json:"name,omitempty"`
	// Description of the project
	Description string `json:"description,omitempty"`
	// PreviewURL is the display image
	PreviewURL string `json:"preview_url,omitempty"`
	// OwnerID is the id of the creator of the project
	OwnerID string `json:"owner_id,omitempty"`
	// Owner is the creator of the project
	Owner User `json:"owner,omitempty"`
	// Users contains all users which have access to the project
	Users []User `gorm:"many2many:user_projects;" json:"users,omitempty"`
	// Meetings contains all meetings in the project
	Meetings []Meeting `json:"meetings,omitempty"`
}
