package web

import (
	"net/http"
	"encoding/json"
	"strings"
	"time"
	"strconv"
	"slices"
)

type passwordSearchOutput struct {
	Id string `json:"id"`
	Name string `json:"name"`
	Tags []string `json:"tags"`
	Data string `json:"data"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

func passwordsSearch(w http.ResponseWriter, r *http.Request, a *Api) {
	userId := Authenticate(a, w, r)
	if userId == nil {
		return
	}

	terms := strings.Split(r.URL.Query().Get("search"), ",")
	terms = slices.DeleteFunc(terms, func(term string) bool {
        return term == ""
    })

	page_param := r.URL.Query().Get("page")
	page := 0
	if page_param != "" {
		page, err := strconv.Atoi(page_param)
		if err != nil {
			BadParameter(w, r, "page", "Must be an integer")
			return 
		}
		if page < 1 {
			BadParameter(w, r, "page", "Must be higher than 0")
			return 
		}
		page = page - 1
	}
	offset := page * 10

	rows, err := a.Db.Pool.Query(r.Context(), `
		SELECT id, name, tags, data, created_at, updated_at
		FROM passwords
		WHERE user_id = $1
			AND CASE
				WHEN ARRAY_LENGTH($2::varchar[], 1) IS NOT NULL
					THEN tags_match_score(tags, $2) > 0
				ELSE TRUE
			END
		ORDER BY CASE
			WHEN ARRAY_LENGTH($2::varchar[], 1) IS NOT NULL 
				THEN tags_match_score(tags, $2)
			ELSE EXTRACT(EPOCH FROM created_at)
		END
		DESC
		OFFSET $3
		LIMIT 10
	`, userId, terms, offset)
	// Todo: should also scan password name.
	// Note: SQL annoyingness forces me to repeat the 'expensive' tags_match_score call.
	// Hopefully optimizer catch it.

	if err != nil {
		ServerError(w, r, apiError { "Could not search password", err })
		return 
	}

	defer rows.Close()
	passwords := make([]passwordSearchOutput, 0)

	for rows.Next() {
	  p := passwordSearchOutput{}
	  var created time.Time 
	  var updated time.Time 
	  err := rows.Scan(
		&p.Id, &p.Name, &p.Tags, 
		&p.Data, &created, &updated,
	  )
	  p.CreatedAt = created.Format(time.RFC3339)
	  p.UpdatedAt = updated.Format(time.RFC3339)
	  if err != nil {
		ServerError(w, r, apiError { "Could not search password", err })
		return 
	  }
	  passwords = append(passwords, p)
	}

	json.NewEncoder(w).Encode(passwords)
}