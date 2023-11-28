package api

import (
	"net/http"
	"encoding/json"
)

type passwordCreateInput struct {
	Name *string `json:"name"`
	Tags []string `json:"tags"`
	Data *string `json:"data"`
}

func passwordCreate(w http.ResponseWriter, r *http.Request, a *Api) {
	userId := Authenticate(a, w, r)
	if userId == nil {
		return
	}

	var input passwordCreateInput
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
		r.Context(), 
		"INSERT INTO passwords (user_id, name, tags, data) VALUES ($1, $2, $3, $4)", 
		userId, *input.Name, input.Tags, input.Data,
	)
	
	if err != nil {
		ServerError(w, r, apiError { "Could not create password", err })
		return 
	}

	w.WriteHeader(http.StatusCreated)
	return
}