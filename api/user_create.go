package api

import (
	"net/http"
	"encoding/json"
	"golang.org/x/crypto/bcrypt"
)

type userCreateInput struct {
	Name *string `json:"name"`
	Email *string `json:"email"`
	Password *string `json:"password"`
}

func userCreate(w http.ResponseWriter, r *http.Request, a *Api) {
	var input userCreateInput
	json.NewDecoder(r.Body).Decode(&input)

	if input.Name == nil {
		BadParameter(w, r, "name", "must not be null")
		return
	}

	if len(*input.Name) <= 3 {
		BadParameter(w, r, "name", "must be at least 3 characters")
		return
	}

	if len(*input.Name) > 200 {
		BadParameter(w, r, "name", "must be at most 200 characters")
		return
	}

	// No sanity check for email. They are mostly harmful. My software, my opinions.
	// So many time I have had public services fuck silently because one of their
	// internal soft decided it disliked my perfectly valid emails
	// because it don't like the domain or because it has a character it disliked in it.
	// I needed to vent.
	if input.Email != nil && len(*input.Email) > 200 {
		BadParameter(w, r, "email", "must be at most 200 characters")
		return
	}

	if input.Password == nil {
		BadParameter(w, r, "password", "must not be null")
		return
	}

	if len(*input.Password) < 8 {
		BadParameter(w, r, "password", "must be at least 8 characters")
		return
	}

	if len(*input.Password) > 70 {
		BadParameter(w, r, "password", "must be at most 70 characters")
		return
	}

	// TODO Ban stupid passwords 
	// TODO Check name uniqueness

	password_hash, err := bcrypt.GenerateFromPassword([]byte(*input.Password), bcrypt.DefaultCost)
	if err != nil {
		ServerError(w, r, apiError { "Could not hash password", err })
		return
	}

	_, err = a.Db.Pool.Exec(r.Context(), "INSERT INTO users (name, password, email) VALUES ($1, $2, $3)", input.Name, password_hash, input.Email)
	if err != nil {
		ServerError(w, r, apiError { "Could not create user", err })
		return 
	}

	w.WriteHeader(http.StatusCreated)
	return
}