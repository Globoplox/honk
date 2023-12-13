package web

import (
	"net/http"
	"encoding/json"
	"time"
)


type userGetOutput struct {
	Id string `json:"id"`
	Name string `json:"name"`
	CreatedAt string `json:"created_at"`
}

func userGet(w http.ResponseWriter, r *http.Request, a *Api) {
	userId := Authenticate(a, w, r)
	if userId == nil {
		return
	}

	output := userGetOutput{}
	output.Id = *userId
	var created time.Time 

	err := a.Db.Pool.QueryRow(r.Context(), "SELECT name, created_at FROM users WHERE id = $1", userId).Scan(&output.Name, &created)
	if err != nil {
		ServerError(w, r, apiError { "Could not delete user", err })
		return 
	}
	output.CreatedAt = created.Format(time.RFC3339)

	json.NewEncoder(w).Encode(output)
}