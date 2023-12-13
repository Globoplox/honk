package web

import (
	"net/http"
)

func userDelete(w http.ResponseWriter, r *http.Request, a *Api) {
	userId := Authenticate(a, w, r)
	if userId == nil {
		return
	}

	// Backup passwords if possible => user email
	
	_, err := a.Db.Pool.Exec(r.Context(), "DELETE FROM users WHERE id = $1", userId)
	if err != nil {
		ServerError(w, r, apiError { "Could not delete user", err })
		return 
	}

	w.WriteHeader(http.StatusNoContent)
	return
}