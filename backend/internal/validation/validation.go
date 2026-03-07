package validation

import "github.com/go-playground/validator/v10"

var validate = validator.New(validator.WithRequiredStructEnabled())

func Struct(v any) error {
	return validate.Struct(v)
}