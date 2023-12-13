package web

import (
	"net/http"
)

func versionHandler(w http.ResponseWriter, r *http.Request, a *Api) {
	switch r.Method {
	case http.MethodGet:
		w.Write([]byte("1.0.0"))
	default:
		MethodNotAllowed(w, r)
	}
}