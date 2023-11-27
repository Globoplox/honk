package database

import (
	"context"
	"github.com/jackc/pgx/v5"
)

func migration1Schema(ctx context.Context, t *pgx.Tx) error {
	// Go implicit interace dont work on pointer, because ...?
	// Go operator associativity is worse than C because ...? 
	_, err := (*t).Exec(ctx, `
		CREATE TABLE users (
			id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
			name VARCHAR(40) NOT NULL UNIQUE,
			password VARCHAR(60) NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)
  	`)

	if err != nil {
		return err
	}
	
	_, err = (*t).Exec(ctx, `
	  	CREATE TABLE passwords (
			id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
		 	user_id UUID REFERENCES users NOT NULL,
			name BYTEA NOT NULL,
		  	data BYTEA NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
	  	)
	`)
	
  	return err
}
