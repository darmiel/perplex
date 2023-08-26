package util

import (
	"github.com/go-playground/validator/v10"
	"regexp"
)

func registerValidation(v *validator.Validate, tag string, pattern *regexp.Regexp) error {
	return v.RegisterValidation(tag, func(fl validator.FieldLevel) bool {
		return pattern.MatchString(fl.Field().String())
	})
}

func anyErr(errs ...error) error {
	for _, e := range errs {
		if e != nil {
			return e
		}
	}
	return nil
}

func NewValidate() (*validator.Validate, error) {
	v := validator.New()
	if err := anyErr(
		registerValidation(v, "proj-extended", regexp.MustCompile("^[\\x20-\\x3B=\\x3F-\\x7E]+$")),
		registerValidation(v, "username", regexp.MustCompile("^[a-zA-Z0-9_-]+$")),
	); err != nil {
		return nil, err
	}
	return v, nil
}
