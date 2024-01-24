package web

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

func usersCreate(ctx *Context) {
	var input userCreateInput
	json.NewDecoder(ctx.Request.Body).Decode(&input)

	if input.Name == nil {
		ctx.BadParameter("name", "must not be null")
		return
	}

	if len(*input.Name) <= 3 {
		ctx.BadParameter("name", "must be at least 3 characters")
		return
	}

	if len(*input.Name) > 200 {
		ctx.BadParameter("name", "must be at most 200 characters")
		return
	}

	// No sanity check for email. They are mostly harmful. My software, my opinions.
	// So many time I have had public services fuck silently because one of their
	// internal soft decided it disliked my perfectly valid emails
	// because it don't like the domain or because it has a character it disliked in it.
	// I needed to vent.
	if input.Email != nil && len(*input.Email) > 200 {
		ctx.BadParameter("email", "must be at most 200 characters")
		return
	}

	if input.Password == nil {
		ctx.BadParameter("password", "must not be null")
		return
	}

	if len(*input.Password) < 8 {
		ctx.BadParameter("password", "must be at least 8 characters")
		return
	}

	// TODO Manualy check name uniqueness for nice error

	password_hash, err := bcrypt.GenerateFromPassword([]byte(*input.Password), bcrypt.DefaultCost)

	if err != nil {
		ctx.ServerError(apiError { "Could not hash password", err })
		return
	}

	_, err = ctx.Database().Exec(
		ctx.Context(), 
		"INSERT INTO users (name, password, email) VALUES ($1, $2, $3)", 
		input.Name, password_hash, input.Email,
	)
	if err != nil {
		ctx.ServerError(apiError { "Could not create user", err })
		return 
	}

	ctx.Response.WriteHeader(http.StatusCreated)
	return
}