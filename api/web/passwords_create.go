package web

import (
	"net/http"
	"encoding/json"
)

type passwordCreateInput struct {
	Name *string `json:"name"`
	Tags []string `json:"tags"`
	Data *string `json:"data"`
}

func passwordsCreate(ctx *Context) {
	userId := ctx.Authenticate()
	if userId == nil {
		return
	}

	var input passwordCreateInput
	json.NewDecoder(ctx.Request.Body).Decode(&input)

	if input.Name == nil {
		ctx.BadParameter("name", "must not be null")
		return
	}

	if len(*input.Name) <= 3 {
		ctx.BadParameter("name", "must be at least 3 characters")
		return
	}

	if len(*input.Name) > 200 {
		ctx.BadParameter("name", "must be at most 200 characters")
		return
	}

	if input.Data == nil {
		ctx.BadParameter("data", "must not be null")
		return
	}

	for i := 0; i < len(input.Tags); i++ {
		if len(input.Tags[i]) > 40 {
			ctx.BadParameter("tags", "must not contain tags longer than 40 characters")
			return
		} 

		if len(input.Tags[i]) == 0 {
			ctx.BadParameter("tags", "must not contain empty tags")
			return
		} 
	}

	_, err := ctx.Database().Exec(
		ctx.Context(), 
		"INSERT INTO passwords (user_id, name, tags, data) VALUES ($1, $2, $3, $4)", 
		userId, *input.Name, input.Tags, input.Data,
	)
	
	if err != nil {
		ctx.ServerError(apiError { "Could not create password", err })
		return 
	}

	ctx.Response.WriteHeader(http.StatusCreated)
	return
}