package api

import (
	"net/http"
)

func passwordDelete(w http.ResponseWriter, r *http.Request, a *Api, id string) {
	userId := Authenticate(a, w, r)
	if userId == nil {
		return
	}

	_, err := a.Db.Pool.Exec(
		r.Context(), 
		"DELETE FROM passwords WHERE id = $1 AND user_id = $2", 
		id, userId,
	)
	if err != nil {
		ServerError(w, r, apiError { "Could not delete password", err })
		return 
	}

	w.WriteHeader(http.StatusNoContent)
}