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

func Any[T any](list []T, check func(t T) bool) (res T) {
	for _, l := range list {
		if check(l) {
			return l
		}
	}
	return
}

func GetMeeting(project *model.Project, meetingID uint) (res model.Meeting, ok bool) {
	for _, m := range project.Meetings {
		if m.ID == meetingID {
			return m, true
		}
	}
	return
}
