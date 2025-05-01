package main

import (
	"log"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/kemalthoriq/be-bpjs-go/internal/config"
	"github.com/kemalthoriq/be-bpjs-go/internal/interface/controller"
)

func main() {
	config.InitDB()

	r := mux.NewRouter()
	tweetController := controller.NewTweetController()

	// Routing API
	r.HandleFunc("/api/sentiment-distribution", tweetController.GetSentimentDistribution).Methods("GET")
	r.HandleFunc("/api/tweets-over-time", tweetController.GetTweetsOverTime).Methods("GET")
	r.HandleFunc("/api/subtopics", tweetController.GetSubtopics).Methods("GET")
	r.HandleFunc("/api/tweets-per-province", tweetController.GetTweetsPerProvince).Methods("GET")
	r.HandleFunc("/api/sentiment-distribution-bpjs-users", tweetController.GetSentimentDistributionForBPJSUsers).Methods("GET")

	// CORS
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedMethods([]string{"GET", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type"}),
	)(r)

	log.Println("✅ Connected to PostgreSQL!")
	log.Println("✅ Backend API siap diakses di http://localhost:8081")
	log.Fatal(http.ListenAndServe(":8081", corsHandler))
}
