package database

import (
	"database/sql"
	"log"

	"proofpot-backend/models"
)

// GetAllRecipes fetches all recipes (summary view) from the database.
func GetAllRecipes(db *sql.DB) ([]models.RecipeListItem, error) {
	// Select necessary fields including image_url
	rows, err := db.Query("SELECT id, title, creator_address, content_hash, image_url, created_at FROM recipes ORDER BY created_at DESC")
	if err != nil {
		log.Printf("Error querying all recipes: %v", err)
		return nil, err
	}
	defer rows.Close()

	var recipes []models.RecipeListItem
	for rows.Next() {
		var recipe models.RecipeListItem
		// Scan ImageURL, handling potential null values
		if err := rows.Scan(&recipe.ID, &recipe.Title, &recipe.CreatorAddress, &recipe.ContentHash, &recipe.ImageURL, &recipe.CreatedAt); err != nil {
			log.Printf("Error scanning recipe row: %v", err)
			return nil, err
		}
		recipes = append(recipes, recipe)
	}

	if err = rows.Err(); err != nil {
		log.Printf("Error iterating recipe rows: %v", err)
		return nil, err
	}

	return recipes, nil
}

// GetRecipeByHash fetches a single recipe by its content hash.
func GetRecipeByHash(db *sql.DB, hash string) (*models.Recipe, error) {
	var recipe models.Recipe
	// Select all fields including image_url
	row := db.QueryRow("SELECT id, title, ingredients, steps, creator_address, content_hash, image_url, created_at FROM recipes WHERE content_hash = $1", hash)

	// Scan ImageURL, handling potential null values
	err := row.Scan(
		&recipe.ID,
		&recipe.Title,
		&recipe.Ingredients,
		&recipe.Steps,
		&recipe.CreatorAddress,
		&recipe.ContentHash,
		&recipe.ImageURL, // Scan the ImageURL field
		&recipe.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Recipe not found is not necessarily an error in this context
		}
		log.Printf("Error scanning recipe row by hash %s: %v", hash, err)
		return nil, err
	}
	return &recipe, nil
}

// InsertRecipe adds a new recipe to the database.
func InsertRecipe(db *sql.DB, recipe models.RecipeCreatePayload) (int, error) {
	var recipeID int
	// Include image_url in the INSERT statement and handle its value
	err := db.QueryRow(
		`INSERT INTO recipes (title, ingredients, steps, creator_address, content_hash, image_url)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		recipe.Title, recipe.Ingredients, recipe.Steps, recipe.CreatorAddress, recipe.ContentHash, recipe.ImageURL, // Pass ImageURL
	).Scan(&recipeID)

	if err != nil {
		log.Printf("Error inserting recipe: %v", err)
		return 0, err
	}

	log.Printf("Successfully inserted recipe with ID: %d, Hash: %s", recipeID, recipe.ContentHash)
	return recipeID, nil
}
