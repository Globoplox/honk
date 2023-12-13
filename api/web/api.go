package web

import (
	"globoplox/honk/database"
	"net"
	"net/http"
	"fmt"
	"log"
	"os"
	"context"
	"errors"
)

type apiError struct {
	message string
	cause error
}

func (err apiError) Error() string {
	if err.cause != nil {
		return fmt.Sprintf("Api error: %s\nCause: %v", err.message, err.cause)
	} else {
		return fmt.Sprintf("Api error: %s", err.message)
	}
}

func (err apiError) Unwrap() error {
	return err.cause
}

type Api struct {
	Db *database.Handle
	server *http.Server
	listener *net.Listener
	router *http.ServeMux
}

func (handle *Api) Close() {
	handle.server.Shutdown(context.Background()) // Why the hell does it need context ? Should I care ? Looks into it
	handle.Db.Close()
}

type wrapperHandler struct {
	router *http.ServeMux
}

func (handler wrapperHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	log.Printf("Request Start '%s' '%s'", r.Method, r.URL)
	origin := r.Header.Get("Origin")
	if len(origin) != 0 {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Vary", "Origin")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, PATCH, OPTIONS")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		if r.Method != http.MethodOptions {
			handler.router.ServeHTTP(w, r)
		}
	} else {
		handler.router.ServeHTTP(w, r)
	}
	log.Printf("Request Ended '%s'", r.URL)
}

func (handle *Api) Start() error {
	err := handle.server.Serve(*handle.listener)
	if !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}

func NewFromEnv() (*Api, error) {
	db, err := database.NewFromEnv()
	if err != nil {
		return nil, apiError{ "Could not initialize connection to the database", err }
	}

	api_network := os.Getenv("API_NETWORK")
	if api_network == "" {
		db.Close()
		return nil, apiError { "Missing or empty environment varibale API_NETWORK", nil }
	}

	api_address := os.Getenv("API_ADDRESS")
	if api_address == "" {
		db.Close()
		return nil, apiError { "Missing or empty environment varibale API_ADDRESS", nil }
	}

	listener, err := net.Listen(api_network, api_address)
	if err != nil {
		db.Close()
		return nil, apiError { "Could not open the API socket", err }
	}

	// Todo: drop it entierly, this is pure crap
	router := http.NewServeMux()
	wrapper := wrapperHandler { router }
	server := http.Server{ Handler: wrapper }

	handle := &Api{ db, &server, &listener, router }

	handle.registerAllRoutes()

	return handle, nil
}

func (handle *Api) HandleFunc(pattern string, handler func(http.ResponseWriter, *http.Request, *Api)) {
	handle.router.HandleFunc(pattern, func(w http.ResponseWriter, r *http.Request) {
		handler(w, r, handle)
	})
}