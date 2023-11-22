package main

import (
	api "globoplox/honk/api"
	"net/http"
	"fmt"
	"os"
	"log"
	"html"
	"os/signal"
	"syscall"
)

func main() {
	// Variable can shadow type ????? THIS IS STUPID 
	// The naming convention are not only stupid they are evil
	// Naming Things are maybe kinda hard, but in go ITS HELL, it's not fatality its just go being chaotic stupid
	apiButNotThePackage, err := api.NewFromEnv()
	if err != nil {
		panic(err)
	}
	defer apiButNotThePackage.Close()

	// TODO: the parameter is useless and shadowing make it annoying. Just use the closure I guess
	// There will be no way to do a plug and play, properly split codebase in go anyway it seems
	apiButNotThePackage.HandleFunc("/hi", func(w http.ResponseWriter, r *http.Request, _ *api.Api) {
		// Use the database to do thing, i guess
		fmt.Fprintf(w, "Hello, %q", html.EscapeString(r.URL.Path))
	})

	stopChannel := make(chan os.Signal, 1)

	// Start API, if it somehow stop, then stop the program
	go func() {
		err = apiButNotThePackage.Start()
		// Err is nil if the server has been manualy stopped.
		if err != nil {
			log.Printf("Api server stopped unexpectedly: '%v'.", err)
		}
		close(stopChannel)
	}() // Wtf, why take the worst from js ?

	// Block until sigterm.
	// Will behave correctly running manually, with docker, or with systemd
	signalChannel := make(chan os.Signal, 1)
	signal.Notify(signalChannel, syscall.SIGTERM)
	go func() {
		signal := <- signalChannel
		log.Printf("Caught %v, closing gracefully.", signal)
		close(stopChannel)
	}()

	<-stopChannel
}