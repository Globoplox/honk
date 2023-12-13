package database

import (
	"context"
	"fmt"
	"os"
	"log"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5"
)

type databaseError struct {
	message string
	cause error
}

func (err databaseError) Error() string {
	if err.cause != nil {
		return fmt.Sprintf("Database error: %s\nCause: %v", err.message, err.cause)
	} else {
		return fmt.Sprintf("Database error: %s", err.message)
	}
}

func (err databaseError) Unwrap() error {
	return err.cause
}

type Handle struct {
	Pool *pgxpool.Pool
}

func (handle *Handle) Close() {
	a := handle.Pool
	a.Close()
}

type migration struct {
	Name string
	Execute func(context.Context, *pgx.Tx) error
}

var migrations = [...]migration {
	{Name: "Initial Schema", Execute: migration1Schema,},
}

func NewFromEnv() (*Handle, error) {
	db_name := os.Getenv("POSTGRES_DB")
	if db_name == "" {
		return nil, databaseError { "Missing or empty environment varibale POSTGRES_DB", nil }
	}
	
	db_user := os.Getenv("POSTGRES_USER")
	if db_user == "" {
		return nil, databaseError { "Missing or empty environment varibale POSTGRES_USER", nil }
	}
	
	db_pwd := os.Getenv("POSTGRES_PASSWORD")
	if db_pwd == "" {
		return nil, databaseError { "Missing or empty environment varibale POSTGRES_PASSWORD", nil }
	}

	db_host := os.Getenv("POSTGRES_HOST")
	if db_host == "" {
		return nil, databaseError { "Missing or empty environment varibale POSTGRES_HOST", nil }
	}

	uri := fmt.Sprintf("postgres://%s:%s@%s/%s", db_user, db_pwd, db_host, db_name)

	return New(context.Background(), uri)
}

func New(ctx context.Context, url string) (*Handle, error) {
	dbpool, err := pgxpool.New(ctx, url)
	if err != nil {
		return nil, databaseError { "Could not open connection", err }
	}

	_, err = dbpool.Exec(ctx, `
    	CREATE TABLE IF NOT EXISTS migrations (
      		id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
      		name TEXT NOT NULL,
      		finished_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)
  	`)
	if err != nil {
		dbpool.Close()
		return nil, databaseError { "Could not initialize migrations", err }
	}

	var migrations_count int
	err = dbpool.QueryRow(ctx, "SELECT COUNT(*) FROM migrations").Scan(&migrations_count)
	if err != nil {
		dbpool.Close()
		return nil, databaseError { "Could not fetch previous migrations", err }
	}

	for ; migrations_count < len(migrations); migrations_count++ {
		var to_run = migrations[migrations_count]

		log.Printf("Starting transaction %s", to_run.Name)

		transaction, err := dbpool.Begin(ctx)
		if err != nil {
			dbpool.Close()
			return nil, databaseError { fmt.Sprintf("Opening transaction failed"), err }
		}
	
		err = to_run.Execute(ctx, &transaction)		
		if err != nil {
			transaction.Rollback(ctx)
			dbpool.Close()
			return nil, databaseError { fmt.Sprintf("Running migration '%s' failed", to_run.Name), err }
		}
		
		_, err = transaction.Exec(ctx, "INSERT INTO migrations (name) VALUES ($1)", to_run.Name)
		if err != nil {
			transaction.Rollback(ctx)
			dbpool.Close()
			return nil, databaseError { fmt.Sprintf("Could not insert migrations '%s' ", to_run.Name), err }
		}

		err = transaction.Commit(ctx)
		if err != nil {
			transaction.Rollback(ctx)
			dbpool.Close()
			return nil, databaseError { fmt.Sprintf("Commiting migration '%s' failed", to_run.Name), err }
		}

		log.Printf("Finished transaction %s", to_run.Name)
	}
	
	return &Handle{dbpool}, nil
}
