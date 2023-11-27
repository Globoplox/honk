package api

import (
	"net/http"
)

func userHandler(w http.ResponseWriter, r *http.Request, a *Api) {
	switch r.Method {
	case http.MethodPost:
		userCreate(w, r, a)
	case http.MethodDelete:
		userDelete(w, r, a)
	case http.MethodPut:
		userUpdate(w, r, a)
	default:
		MethodNotAllowed(w, r)
	}
}