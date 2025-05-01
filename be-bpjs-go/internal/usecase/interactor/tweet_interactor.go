package interactor

import (
	"github.com/kemalthoriq/be-bpjs-go/internal/domain/repository"
)

type TweetInteractor struct{}

func (ti *TweetInteractor) GetSentimentDistribution() (map[string]int, error) {
	return repository.CountSentiments()
}

func (ti *TweetInteractor) GetTweetsOverTime() ([]map[string]interface{}, error) {
	return repository.CountTweetsPerDay()
}

func (ti *TweetInteractor) GetSubtopics() ([]map[string]interface{}, error) {
	return repository.CountTweetsPerSubtopic()
}

func (ti *TweetInteractor) GetTweetsPerProvince() ([]map[string]interface{}, error) {
	return repository.CountTweetsPerProvince()
}
func (ti *TweetInteractor) GetSentimentDistributionForBPJSUsers() (map[string]int, error) {
	return repository.CountSentimentsForBPJSUsers()
}
