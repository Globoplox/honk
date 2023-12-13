package web

func (a *Api) registerAllRoutes() {
	a.HandleFunc("/", RouteNotFound)
	a.HandleFunc("/version", versionHandler)
	a.HandleFunc("/user/", userHandler)
	a.HandleFunc("/user", userHandler)
	a.HandleFunc("/user/self/", selfHandler)
	a.HandleFunc("/user/self", selfHandler)
	a.HandleFunc("/password/", passwordHandler)
	a.HandleFunc("/password", passwordHandler)
	a.HandleFunc("/passwords/", passwordsHandler)
	a.HandleFunc("/passwords", passwordsHandler)
}