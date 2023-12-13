package web

import (
	"net/http"
	"encoding/json"
)

type passwordUpdateInput struct {
	Name *string `json:"name"`
	Tags []string `json:"tags"`
	Data *string `json:"data"`
}

func passwordUpdate(w http.ResponseWriter, r *http.Request, a *Api, id string) {
	userId := Authenticate(a, w, r)
	if userId == nil {
		return
	}

	var input passwordUpdateInput
	json.NewDecoder(r.Body).Decode(&input)

	if input.Name == nil {
		BadParameter(w, r, "name", "must not be null")
		return
	}

	if len(*input.Name) <= 3 {
		BadParameter(w, r, "name", "must be at least 3 characters")
		return
	}

	if len(*input.Name) > 200 {
		BadParameter(w, r, "name", "must be at most 200 characters")
		return
	}

	if input.Data == nil {
		BadParameter(w, r, "data", "must not be null")
		return
	}

	for i := 0; i < len(input.Tags); i++ {
		if len(input.Tags[i]) > 40 {
			BadParameter(w, r, "tags", "must not contain tags longer than 40 characters")
			return
		} 

		if len(input.Tags[i]) == 0 {
			BadParameter(w, r, "tags", "must not contain empty tags")
			return
		} 
	}

	_, err := a.Db.Pool.Exec(
		r.Context(), ` 
			UPDATE passwords SET
				name = $3,
				tags = $4,
				data = $5,
				updated_at = NOW()
			WHERE user_id = $1 AND id = $2 
		`, 
		userId, id, *input.Name, input.Tags, input.Data,
	)
	
	if err != nil {
		ServerError(w, r, apiError { "Could not update password", err })
		return 
	}

	w.WriteHeader(http.StatusNoContent)
	return
}