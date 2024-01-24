package web

import (
	"log"
	"golang.org/x/crypto/bcrypt"
)

// Authenticate the request
// Return the user_id if successful.
// Else, return nil, a correct error response will have been written.
// TODO: constant time, rate limiting, ...
func (ctx *Context) Authenticate() *string {
	u, p, ok := ctx.Request.BasicAuth()
	if !ok {
		log.Printf("Request unauthorized, bad basic auth")
		ctx.Unauthorized()
		return nil
	}

	var id, password_hash *string
	err := ctx.Database().QueryRow(
		ctx.Context(), 
		"SELECT id, password FROM users WHERE name = $1", 
		u,
	).Scan(&id, &password_hash)
	
	if err != nil {
		log.Printf("Database error during authentication: '%v'", err)
		ctx.Unauthorized()
		return nil
	}
	
	if id == nil || password_hash == nil {
		log.Printf("User not found during authentication: '%v'", u)
		ctx.Unauthorized()
		return nil
	}

	err = bcrypt.CompareHashAndPassword([]byte(*password_hash), []byte(p))
	if err != nil {
		log.Printf("Bad password for user: '%v': %v", u, err)
		ctx.Unauthorized()
		return nil	
	}

	return id
}
