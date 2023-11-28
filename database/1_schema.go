package database

import (
	"context"
	"github.com/jackc/pgx/v5"
)

func migration1Schema(ctx context.Context, t *pgx.Tx) error {
	// Large name because email as name are good, but enforcing them is not always.
	// Password is a bcrypt hash obviously. 
	_, err := (*t).Exec(ctx, `
		CREATE TABLE users (
			id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
			name VARCHAR(200) NOT NULL UNIQUE,
			password VARCHAR(60) NOT NULL,
			email VARCHAR(200) DEFAULT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)
  	`)
	if err != nil {
		return err
	}
	
	// Tags and name are not ciphered.
	// As far as I know, there are no practical ciphering or hash algorithm that 
	// allows searching.
	_, err = (*t).Exec(ctx, `
	  	CREATE TABLE passwords (
			id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
		 	user_id UUID REFERENCES users NOT NULL,
			name VARCHAR NOT NULL,
			tags VARCHAR[] NOT NULL,
		  	data TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
	  	)
	`)
	if err != nil {
		return err
	}

	_, err = (*t).Exec(ctx, "CREATE EXTENSION fuzzystrmatch")
	if err != nil {
		return err
	}

	/*
		This is a function that given two sets, 
		attempt to match the terms of each with the one of the others.
		It will produce a score based on the sum of the similarity score
		of the best pairs it found.  
		Any pair with a levenshtein distance higher than 5 is dropped.
		The highest the score, the better.
		Don't asks about performance.
		Todo: If this were to be used at large scale, 
				this probably should be handled by the api.
	*/
	_, err = (*t).Exec(ctx, `
		CREATE OR REPLACE FUNCTION tags_match_score(a VARCHAR[], b VARCHAR[]) RETURNS INT AS $$
		DECLARE
			tag_a VARCHAR;
			tag_b VARCHAR;
			result INT := 0;
			temporary INT;
			current_best INT;
		BEGIN
			FOREACH tag_a IN ARRAY a
			LOOP
				current_best := 0;
				FOREACH tag_b IN ARRAY b
				LOOP
					temporary := GREATEST(0, 5 - levenshtein(lower(tag_a), lower(tag_b)));
					IF temporary > current_best
					THEN
						current_best := temporary;
					END IF;
				END LOOP;
				result := result + current_best;
			END LOOP;
			RETURN result;
		END;
		$$ LANGUAGE plpgsql;
	`)
  	return err
}
