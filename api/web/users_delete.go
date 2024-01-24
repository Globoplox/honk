package web

import (
	"net/http"
)

func usersDelete(ctx *Context) {
	userId := ctx.Authenticate()
	
	if userId == nil {
		return
	}

	// Backup passwords if possible => user email
	
	_, err := ctx.Database().Exec(
		ctx.Context(), 
		"DELETE FROM users WHERE id = $1", 
		userId,
	)

	if err != nil {
		ctx.ServerError(apiError { "Could not delete user", err })
		return 
	}

	ctx.Response.WriteHeader(http.StatusNoContent)
	return
}