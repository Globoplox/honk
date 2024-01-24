package web

func usersUpdate(ctx *Context) {
	userId := ctx.Authenticate()
	
	if userId == nil {
		return
	}

	// Todo
}