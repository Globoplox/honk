package api

import (
	"net/http"
	"log"
	"golang.org/x/crypto/bcrypt"
)

// Authenticate the request
// Return the user_id if successful.
// Else, return nil, a correct error response will have been written.
// TODO: constant time, rate limiting, ...
func Authenticate(a *Api, w http.ResponseWriter, r *http.Request) *string {
	u, p, ok := r.BasicAuth()
	if !ok {
		log.Printf("Request unauthorized, bad basic auth")
		Unauthorized(w, r)
		return nil
	}


	var id, password_hash *string
	err := a.Db.Pool.QueryRow(r.Context(), "SELECT id, password FROM users WHERE name = $1", u).Scan(&id, &password_hash)
	
	if err != nil {
		log.Printf("Database error during authentication: '%v'", err)
		Unauthorized(w, r)
		return nil
	}
	
	if id == nil || password_hash == nil {
		log.Printf("User not found during authentication: '%v'", u)
		Unauthorized(w, r)
		return nil
	}

	log.Printf("AUTHENTICATE COMPARE WITH HASH %s", *password_hash)
	log.Printf("P SIZE: %v", len(p))
	log.Printf("AUTHENTICATE PASSWORD %s", p)


	err = bcrypt.CompareHashAndPassword([]byte(*password_hash), []byte(p))
	if err != nil {
		log.Printf("Bad password for user: '%v': %v", u, err)
		Unauthorized(w, r)
		return nil	
	}

	return id
}
