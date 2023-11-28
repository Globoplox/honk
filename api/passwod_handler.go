package api

import (
	"net/http"
)

func passwordsHandler(w http.ResponseWriter, r *http.Request, a *Api) {
	switch r.Method {
	case http.MethodGet:
		passwordsSearch(w, r, a)
	default:
		MethodNotAllowed(w, r)
	}
}

func passwordHandler(w http.ResponseWriter, r *http.Request, a *Api) {
	switch r.Method {
	case http.MethodPost:
		passwordCreate(w, r, a)
	case http.MethodDelete:
		userDelete(w, r, a)
	case http.MethodPut:
		passwordUpdate(w, r, a)
	default:
		MethodNotAllowed(w, r)
	}
}