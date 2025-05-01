package controller

import (
	"encoding/json"
	"net/http"

	"github.com/kemalthoriq/be-bpjs-go/internal/usecase/interactor"
)

type TweetController struct {
	Interactor *interactor.TweetInteractor
}

func NewTweetController() *TweetController {
	return &TweetController{
		Interactor: &interactor.TweetInteractor{},
	}
}

func (tc *TweetController) GetSentimentDistribution(w http.ResponseWriter, r *http.Request) {
	data, err := tc.Interactor.GetSentimentDistribution()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func (tc *TweetController) GetTweetsOverTime(w http.ResponseWriter, r *http.Request) {
	data, err := tc.Interactor.GetTweetsOverTime()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func (tc *TweetController) GetSubtopics(w http.ResponseWriter, r *http.Request) {
	data, err := tc.Interactor.GetSubtopics()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func (tc *TweetController) GetTweetsPerProvince(w http.ResponseWriter, r *http.Request) {
	data, err := tc.Interactor.GetTweetsPerProvince()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func (tc *TweetController) GetSentimentDistributionForBPJSUsers(w http.ResponseWriter, r *http.Request) {
	data, err := tc.Interactor.GetSentimentDistributionForBPJSUsers()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
