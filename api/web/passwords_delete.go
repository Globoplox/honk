package web

import (
	"net/http"
)

func passwordsDelete(ctx *Context) {
	userId := ctx.Authenticate()

	if userId == nil {
		return
	}

	id := ctx.UriParameters["id"]

	_, err := ctx.Database().Exec(
		ctx.Context(), 
		"DELETE FROM passwords WHERE id = $1 AND user_id = $2", 
		id, userId,
	)
	if err != nil {
		ctx.ServerError(apiError { "Could not delete password", err })
		return 
	}

	ctx.Response.WriteHeader(http.StatusNoContent)
}