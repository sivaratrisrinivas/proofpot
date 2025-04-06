package models

import "time"

// Recipe represents the structure of a recipe in the database and API.
type Recipe struct {
	ID             int       `json:"id"` // Use 'int' for SERIAL, will be populated by DB
	Title          string    `json:"title" binding:"required"`
	Ingredients    string    `json:"ingredients" binding:"required"`
	Steps          string    `json:"steps" binding:"required"`
	CreatorAddress string    `json:"creatorAddress" binding:"required"` // Matches frontend/contract terminology
	ContentHash    string    `json:"contentHash" binding:"required"`
	CreatedAt      time.Time `json:"createdAt"` // Populated by DB
}
