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
	ImageURL       *string   `json:"imageUrl,omitempty"` // Added field (pointer to allow null)
	CreatedAt      time.Time `json:"createdAt"`          // Populated by DB
}

// RecipeListItem represents the data structure for a recipe in a list view
type RecipeListItem struct {
	ID             int       `json:"id"`
	Title          string    `json:"title"`
	CreatorAddress string    `json:"creatorAddress"`
	ContentHash    string    `json:"contentHash"`
	ImageURL       *string   `json:"imageUrl,omitempty"` // Added field (pointer to allow null)
	CreatedAt      time.Time `json:"createdAt"`
}

// RecipeCreatePayload defines the structure expected for creating a new recipe via the API.
// Matches the frontend's RecipeApiPayload.
type RecipeCreatePayload struct {
	Title          string `json:"title" binding:"required"`
	Ingredients    string `json:"ingredients" binding:"required"`
	Steps          string `json:"steps" binding:"required"`
	CreatorAddress string `json:"creatorAddress" binding:"required"`
	ContentHash    string `json:"contentHash" binding:"required"`
	ImageURL       string `json:"imageUrl"`
}

// RecipeCreateResponse defines the structure returned after successfully creating a recipe.
// Matches the frontend's RecipeCreationApiResponse.
type RecipeCreateResponse struct {
	ID          int    `json:"id"`
	ContentHash string `json:"contentHash"`
}
