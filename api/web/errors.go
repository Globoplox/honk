package web

// This file provides method for standard API response errors
// They will write the error response

import (
	"net/http"
	"encoding/json"
	"fmt"
	"log"
)

type unauthorized struct {
	Error string `json:"error"`
}

func (ctx *Context) Unauthorized() {
	ctx.Response.WriteHeader(http.StatusUnauthorized)
	json.NewEncoder(ctx.Response).Encode(
		unauthorized{ "Unauthorized" },
	)
}

type badParameter struct {
	Error string `json:"error"`
	Parameter string `json:"parameter"`
}

func (ctx *Context) BadParameter(parameter string, err string) {
	ctx.Response.WriteHeader(http.StatusBadRequest)
	json.NewEncoder(ctx.Response).Encode(
		badParameter{ 
			fmt.Sprintf("Parameter '%s': '%s'", parameter, err), 
			parameter,
		},
	)
}

type serverError struct {
	Error string `json:"error"`
}

func (ctx *Context) ServerError(err error) {
	log.Printf("Internal Server Error: %s", err)
	// TODO Maybe, in debug / env local/dev, output the error in the payload 
	ctx.Response.WriteHeader(http.StatusInternalServerError)
	json.NewEncoder(ctx.Response).Encode(
		serverError{ 
			fmt.Sprintf("Internal Server Error"),
		},
	)
}
