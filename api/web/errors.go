package web

// This file provides method for standard API response errors
// They will write the error response

import (
	"net/http"
	"encoding/json"
	"fmt"
	"log"
)

// Field MUST be exported and double quotes around name are mandatory
// IT SILENTLY FAIL OTHERWISE LOL
type unauthorized struct {
	Error string `json:"error"`
}

func Unauthorized(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusUnauthorized)
	json.NewEncoder(w).Encode(unauthorized{ "Unauthorized" })
}

type methodNotAllowed struct {
	Error string `json:"error"`
	Path string `json:"path"`
	Method string `json:"method"`
}

func MethodNotAllowed(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusMethodNotAllowed)
	json.NewEncoder(w).Encode(methodNotAllowed{ 
		fmt.Sprintf("Method %v not allowed for route '%v'", r.Method, r.URL), 
		r.URL.String(),
		r.Method,
	 })
}

type badParameter struct {
	Error string `json:"error"`
	Parameter string `json:"parameter"`
}

func BadParameter(w http.ResponseWriter, r *http.Request, parameter string, err string) {
	w.WriteHeader(http.StatusBadRequest)
	json.NewEncoder(w).Encode(badParameter{ 
		fmt.Sprintf("Parameter '%s': '%s'", parameter, err), 
		parameter,
	 })
}

type routeNotFound struct {
	Error string `json:"error"`
	Path string `json:"path"`
}

func RouteNotFound(w http.ResponseWriter, r *http.Request, _ *Api) {
	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(routeNotFound{ fmt.Sprintf("Route '%v' not found", r.URL), r.URL.String() })
}

type serverError struct {
	Error string `json:"error"`
}

func ServerError(w http.ResponseWriter, r *http.Request, err error) {
	log.Printf("Internal Server Error: %s", err)
	// Maybe, in debug / env local/dev, output the error in the payload 
	w.WriteHeader(http.StatusInternalServerError)
	json.NewEncoder(w).Encode(serverError{ fmt.Sprintf("Internal Server Error") })
}
