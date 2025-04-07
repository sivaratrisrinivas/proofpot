package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"proofpot-backend/models"

	_ "github.com/lib/pq" // PostgreSQL driver
)

var DB *sql.DB

// InitDB initializes the database connection using environment variables.
func InitDB() {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Error opening database connection: %v\n", err)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatalf("Error connecting to the database: %v\n", err)
	}

	fmt.Println("Successfully connected to the database!")
}

// CloseDB closes the database connection.
func CloseDB() {
	if DB != nil {
		DB.Close()
		fmt.Println("Database connection closed.")
	}
}

// CheckHashExists checks if a recipe with the given content hash already exists in the database.
func CheckHashExists(hash string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM recipes WHERE content_hash = $1)`
	err := DB.QueryRow(query, hash).Scan(&exists)
	if err != nil {
		// It's important to distinguish between "no rows" (which shouldn't happen with SELECT EXISTS)
		// and actual database errors.
		if err == sql.ErrNoRows {
			// This case should ideally not be reached with SELECT EXISTS, but handle defensively
			return false, nil
		}
		// Return the actual database error for other issues
		return false, fmt.Errorf("error checking hash existence: %w", err)
	}
	return exists, nil
}

// InsertRecipe inserts a new recipe into the database and returns the generated ID.
// Note: We assume description is handled appropriately (e.g., added to struct/db later or ignored).
func InsertRecipe(recipe models.Recipe) (int, error) {
	var id int
	query := `
		INSERT INTO recipes (title, ingredients, steps, creator_address, content_hash)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`
	// Execute the query, scanning the returned ID into the id variable.
	err := DB.QueryRow(query,
		recipe.Title,
		recipe.Ingredients, // Assumes this is the joined string
		recipe.Steps,       // Assumes this is the joined string
		recipe.CreatorAddress,
		recipe.ContentHash,
	).Scan(&id)

	if err != nil {
		return 0, fmt.Errorf("error inserting recipe: %w", err)
	}

	return id, nil
}

// --- TODO: Add functions for GET endpoints here later (Step 4.1, 4.2) ---
// GetAllRecipes() ([]models.Recipe, error)
// GetRecipeByHash(hash string) (models.Recipe, error)
