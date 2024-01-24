package web

import (
	"net/http"
)

func (self *Api) registerAllRoutes() {
	self.Register(http.MethodGet, "/version", func (ctx *Context) { 
		ctx.Response.Write([]byte("1.0.0"))
	 })

	self.Register(http.MethodGet, "/users/self", usersGet)
	self.Register(http.MethodDelete, "/users/self", usersDelete)
	self.Register(http.MethodPut, "/users/self", usersUpdate)
	self.Register(http.MethodPost, "/users", usersCreate)
	
	self.Register(http.MethodPut, "/passwords/:id", passwordsUpdate)
	self.Register(http.MethodDelete, "/passwords/:id", passwordsDelete)
	self.Register(http.MethodPost, "/passwords", passwordsCreate)
	self.Register(http.MethodGet, "/passwords", passwordsSearch)
}