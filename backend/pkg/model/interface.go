package model

type Ownership interface {
	CheckProjectOwnership(projectID uint) bool
}
