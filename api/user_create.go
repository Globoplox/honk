package api

import (
	"net/http"
	"encoding/json"
	"golang.org/x/crypto/bcrypt"
)

type userCreateInput struct {
	name *string
	password *string
}

func userCreate(w http.ResponseWriter, r *http.Request, a *Api) {
	var input userCreateInput
	json.NewDecoder(r.Body).Decode(&input)

	if input.name == nil {
		BadParameter(w, r, "name", "must not be null")
		return
	}

	if len(*input.name) <= 3 {
		BadParameter(w, r, "name", "must be at least 3 characters")
		return
	}

	if len(*input.name) > 200 {
		BadParameter(w, r, "name", "must be at most 200 characters")
		return
	}

	if input.password == nil {
		BadParameter(w, r, "password", "must not be null")
		return
	}

	if len(*input.password) <= 10 {
		BadParameter(w, r, "password", "must be at least 10 characters")
		return
	}

	if len(*input.password) > 70 {
		BadParameter(w, r, "password", "must be at most 70 characters")
		return
	}

	// TODO Ban stupid passwords 
	// TODO Check name uniqueness

	password_hash, err := bcrypt.GenerateFromPassword([]byte(*input.password), bcrypt.DefaultCost)
	if err != nil {
		ServerError(w, r, apiError { "Could not hash password", err })
		return 
	}

	_, err = a.Db.Pool.Exec(r.Context(), "INSERT INTO users (name, password) VALUES ($1, $2)", *input.name, password_hash)
	if err != nil {
		ServerError(w, r, apiError { "Could not create user", err })
		return 
	}

	w.WriteHeader(http.StatusCreated)
	return
}