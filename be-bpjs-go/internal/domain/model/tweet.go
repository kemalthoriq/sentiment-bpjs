package model

type Tweet struct {
	ConversationIDStr   int64  `json:"conversation_id_str"`
	CreatedAt           string `json:"created_at"`
	FavoriteCount       int    `json:"favorite_count"`
	FullText            string `json:"full_text"`
	IDStr               int64  `json:"id_str"`
	ImageURL            string `json:"image_url"`
	InReplyToScreenName string `json:"in_reply_to_screen_name"`
	Lang                string `json:"lang"`
	Location            string `json:"location"`
	QuoteCount          int    `json:"quote_count"`
	ReplyCount          int    `json:"reply_count"`
	RetweetCount        int    `json:"retweet_count"`
	TweetURL            string `json:"tweet_url"`
	UserIDStr           int64  `json:"user_id_str"`
	Username            string `json:"username"`
	CleanedText         string `json:"cleaned_text"`
	Sentiment           string `json:"sentiment"`
	Subtopic            string `json:"subtopic"`
	IsBPJSUser          bool   `json:"is_bpjs_user"`
}
