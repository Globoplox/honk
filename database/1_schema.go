package database

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
)

func migration1Schema(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
        CREATE TABLE users (
			id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
			name VARCHAR(40) NOT NULL UNIQUE,
			public_key_modulus BYTEA NOT NULL,
			public_key_exponent INT NOT NULL,
			created_at TIMESTAMPZ NOT NULL DEAFULT now()
		)
  	`)
	if err != nil {
		return err
	}
	
	_, err = pool.Exec(ctx, `
	  	CREATE TABLE passwords (
			id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
		 	user_id UUID REFERENCES users NOT NULL,
			name BYTEA NOT NULL,
		  	data BYTEA NOT NULL,
			created_at TIMESTAMPZ NOT NULL DEAFULT now(),
			updated_at TIMESTAMPZ NOT NULL DEAFULT now()
	  	)
	`)
	
  	return err
}
