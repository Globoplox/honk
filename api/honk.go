package main

import (
	api "globoplox/honk/web"
	"os"
	"log"
	"os/signal"
	"syscall"
)

func main() {
	a, err := api.NewFromEnv()
	if err != nil {
		panic(err)
	}
	defer a.Close()

	stopChannel := make(chan os.Signal, 1)

	// Start API, if it somehow stop, then stop the program
	go func() {
		// Err is nil if the server has been manualy stopped.
		if err = a.Start(); err != nil {
			log.Printf("Api server stopped unexpectedly: '%v'.", err)
		}
		close(stopChannel)
	}()

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
