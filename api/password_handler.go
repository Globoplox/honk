package api

import (
	"net/http"
	"strings"
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
		p := strings.Split(r.URL.Path, "/")
		if len(p) < 2 {
			RouteNotFound(w, r, a)
			return
		}
		passwordDelete(w, r, a, p[1])
	
	case http.MethodPut:
		p := strings.Split(r.URL.Path, "/")
		if len(p) < 2 {
			RouteNotFound(w, r, a)
			return
		}
		passwordUpdate(w, r, a, p[1])
	
	default:
		MethodNotAllowed(w, r)
	}
}