package api

import (
	"net/http"
	"encoding/json"
	"strings"
	"time"
)

type passwordOutput struct {
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
	rows, err := a.Db.Pool.Query(r.Context(), `
		SELECT id, name, tags, data, created_at, updated_at
		FROM passwords
		WHERE user_id = $1
		ORDER BY tags_match_score(tags, $2) DESC
		LIMIT 10
	`, userId, terms)

	if err != nil {
		ServerError(w, r, apiError { "Could not search password", err })
		return 
	}

	defer rows.Close()
	passwords := make([]passwordOutput, 0)

	for rows.Next() {
	  p := passwordOutput{}
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