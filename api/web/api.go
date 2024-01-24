package web

import (
	"globoplox/honk/database"
	"github.com/globoplox/gradix"
	"github.com/jackc/pgx/v5/pgxpool" // i dislike this
	"net"
	"net/http"
	"fmt"
	"log"
	"os"
	"context"
	"errors"
	"encoding/json"
)

// Small trick because go dont automatically a function as a valid implementation
// of an interface that declare only a method of similar prototype
// Also must declare a type because somehow 
// go dislike func as receiver.
// guess they haven't heard of referential transpatency
type httpHandler func(http.ResponseWriter, *http.Request)
func (self httpHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    self(w, r)
}
// Tada !

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

type Context struct {
	Response http.ResponseWriter
	Request *http.Request
	UriParameters map[string]string
	Api *Api
}

func (ctx *Context) Context() context.Context {
	return ctx.Request.Context()
}

func (ctx *Context) Database() *pgxpool.Pool {
	return ctx.Api.Db.Pool
}

type routeNotFound struct {
	Error string `json:"error"`
	Path string `json:"path"`
}

type Api struct {
	Db *database.Handle
	server *http.Server
	listener *net.Listener
	router *gradix.Radix[func(*Context)]
}

func (self *Api) Close() {
	// Why the hell does it need context ? Should I care ? Looks into it
	self.server.Shutdown(context.Background())
	self.Db.Close()
}

func (self *Api) Start() error {
	if err := self.server.Serve(*self.listener); !errors.Is(err, http.ErrServerClosed) {
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

	api := &Api{}

	api.Db = db

	listener, err := net.Listen(api_network, api_address)
	if err != nil {
		db.Close()
		return nil, apiError { "Could not open the API socket", err }
	}
	api.listener = &listener

	api.router = gradix.New[func(*Context)]()

	api.server = &http.Server{ Handler: httpHandler(func (w http.ResponseWriter, r *http.Request) {
		log.Printf("Request Start '%s' '%s'", r.Method, r.URL)
		
		if origin := r.Header.Get("Origin"); len(origin) != 0 {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, PATCH, OPTIONS")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}

		if r.Method != http.MethodOptions {
			match := api.router.Search(fmt.Sprintf("/%v/%v", r.Method, r.URL.Path))
			if len(match) == 0 {
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(routeNotFound{ fmt.Sprintf("Route '%v' not found", r.URL), r.URL.String() })			
			} else {
				match[0].Payload(&Context{w, r, match[0].Parameters, api})
			}
		}
		log.Printf("Request Ended '%s'", r.URL)
	}) }

	api.registerAllRoutes()

	return api, nil
}

func (self *Api) Register(method string, path string, handler func(*Context)) {
	self.router.Add(fmt.Sprintf("/%v/%v", method, path), handler)
}