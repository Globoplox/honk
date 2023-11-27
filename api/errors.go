package api

// This file provides method for standard API response errors
// They will write the error response

import (
	"net/http"
	"encoding/json"
	"fmt"
)

type unauthorized struct {
	error string `json:error`
}

func Unauthorized(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusUnauthorized)
	json.NewEncoder(w).Encode(unauthorized{ "Unauthorized" })
}

type methodNotAllowed struct {
	error string `json:error`
	path string `json:path`
	method string `json:method`
}

func MethodNotAllowed(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusMethodNotAllowed)
	json.NewEncoder(w).Encode(methodNotAllowed{ 
		fmt.Sprintf("Method %v not allowed for route '%v'", r.Method, r.URL), 
		r.URL.String(),
		r.Method,
	 })
}

type routeNotFound struct {
	error string `json:error`
	path string `json:path`
}

func RouteNotFound(w http.ResponseWriter, r *http.Request, _ *Api) {
	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(routeNotFound{ fmt.Sprintf("Route '%v' not found", r.URL), r.URL.String() })
}
