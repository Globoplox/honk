package web

import (
	"encoding/json"
	"time"
)


type userGetOutput struct {
	Id string `json:"id"`
	Name string `json:"name"`
	CreatedAt string `json:"created_at"`
}

func usersGet(ctx *Context) {
	userId := ctx.Authenticate()
	
	if userId == nil {
		return
	}

	output := userGetOutput{}
	output.Id = *userId
	var created time.Time 

	err := ctx.Database().QueryRow(
		ctx.Context(), 
		"SELECT name, created_at FROM users WHERE id = $1", 
		userId,
	).Scan(&output.Name, &created)
	
	if err != nil {
		ctx.ServerError(apiError { "Could not delete user", err })
		return 
	}
	
	output.CreatedAt = created.Format(time.RFC3339)

	json.NewEncoder(ctx.Response).Encode(output)
}