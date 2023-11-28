package api

import (
	"net/http"
)

func passwordDelete(w http.ResponseWriter, r *http.Request, a *Api) {
	userId := Authenticate(a, w, r)
	if userId == nil {
		return
	}

	// Todo
}