package api

import (
	"net/http"
)

func passwordUpdate(w http.ResponseWriter, r *http.Request, a *Api) {
	userId := Authenticate(a, w, r)
	if userId == nil {
		return
	}

	// Todo
}