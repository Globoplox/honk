package api

func (a *Api) registerAllRoutes() {
	a.HandleFunc("/", RouteNotFound)
	a.HandleFunc("/user", userHandler)
	a.HandleFunc("/password", passwordHandler)
	a.HandleFunc("/passwords", passwordsHandler)
}