CREATE EXTENSION fuzzystrmatch;

CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
		name VARCHAR(200) NOT NULL UNIQUE,
		password VARCHAR(60) NOT NULL,
		email VARCHAR(200) DEFAULT NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS passwords (
		id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
	 	user_id UUID REFERENCES users NOT NULL,
		name VARCHAR NOT NULL,
		tags VARCHAR[] NOT NULL,
	  data TEXT NOT NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
