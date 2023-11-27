package api

func (a *Api) registerAllRoutes() {
	a.HandleFunc("/", RouteNotFound)
	// I wanted to split the routes into packages, but go think he is smarter than other and disallow import cycle
	// I not gonna rely on globals or write shitty interface package like its C99, fuck this, everything in the same direcotry
	// seems to be the go way. Because fuck developer right ig 
	a.HandleFunc("/user", userHandler)
}