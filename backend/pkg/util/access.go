package util

import "github.com/darmiel/dmp/pkg/model"

func HasAccess(project *model.Project, userID string) bool {
	if project.OwnerID == userID {
		return true
	}
	for _, u := range project.Users {
		if u.ID == userID {
			return true
		}
	}
	return false
}
