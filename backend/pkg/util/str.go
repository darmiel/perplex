package util

func Truncate(what string, length int) string {
	if len(what) > length {
		return what[:length-3] + "..."
	}
	return what
}
