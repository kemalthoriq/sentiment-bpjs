package repository

import (
	"github.com/kemalthoriq/be-bpjs-go/internal/config"
)

func CountSentiments() (map[string]int, error) {
	rows, err := config.DB.Query(`
        SELECT sentiment, COUNT(*)
        FROM tweets
        GROUP BY sentiment
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make(map[string]int)
	for rows.Next() {
		var sentiment string
		var count int
		if err := rows.Scan(&sentiment, &count); err != nil {
			return nil, err
		}
		result[sentiment] = count
	}
	return result, nil
}

func CountTweetsPerDay() ([]map[string]interface{}, error) {
	rows, err := config.DB.Query(`
        SELECT DATE(created_at), COUNT(*)
        FROM tweets
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		var date string
		var count int
		if err := rows.Scan(&date, &count); err != nil {
			return nil, err
		}
		result = append(result, map[string]interface{}{
			"date":  date,
			"count": count,
		})
	}
	return result, nil
}
func CountTweetsPerProvince() ([]map[string]interface{}, error) {
	rows, err := config.DB.Query(`
        SELECT location, sentiment, subtopic, COUNT(*)
        FROM tweets
        GROUP BY location, sentiment, subtopic
        ORDER BY location
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		var location, sentiment, subtopic string
		var count int
		if err := rows.Scan(&location, &sentiment, &subtopic, &count); err != nil {
			return nil, err
		}
		result = append(result, map[string]interface{}{
			"location":  location,
			"sentiment": sentiment,
			"subtopic":  subtopic,
			"count":     count,
		})
	}
	return result, nil
}

func CountTweetsPerSubtopic() ([]map[string]interface{}, error) {
	rows, err := config.DB.Query(`
        SELECT subtopic, COUNT(*)
        FROM tweets
        GROUP BY subtopic
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		var subtopic string
		var count int
		if err := rows.Scan(&subtopic, &count); err != nil {
			return nil, err
		}
		result = append(result, map[string]interface{}{
			"subtopic": subtopic,
			"count":    count,
		})
	}
	return result, nil
}
func FlagBPJSUsers() error {
	_, err := config.DB.Exec(`
        UPDATE tweets
        SET is_bpjs_user = TRUE
        WHERE full_text ILIKE '%pakai bpjs%' OR full_text ILIKE '%daftar bpjs%' OR full_text ILIKE '%menggunakan bpjs%'
    `)
	if err != nil {
		return err
	}
	return nil
}

func CountSentimentsForBPJSUsers() (map[string]int, error) {
	rows, err := config.DB.Query(`
        SELECT sentiment, COUNT(*)
        FROM tweets
        WHERE is_bpjs_user = TRUE
        GROUP BY sentiment
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make(map[string]int)
	for rows.Next() {
		var sentiment string
		var count int
		if err := rows.Scan(&sentiment, &count); err != nil {
			return nil, err
		}
		result[sentiment] = count
	}
	return result, nil
}

func CountSentimentsPerSubtopic(subtopic string) (map[string]int, error) {
	rows, err := config.DB.Query(`
        SELECT sentiment, COUNT(*)
        FROM tweets
        WHERE subtopic = $1
        GROUP BY sentiment
    `, subtopic)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make(map[string]int)
	for rows.Next() {
		var sentiment string
		var count int
		if err := rows.Scan(&sentiment, &count); err != nil {
			return nil, err
		}
		result[sentiment] = count
	}
	return result, nil
}
