package util

import "github.com/darmiel/perplex/pkg/model"

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

func Any[T any](list []T, check func(t T) bool) (res T, ok bool) {
	for _, l := range list {
		if check(l) {
			return l, true
		}
	}
	return
}
