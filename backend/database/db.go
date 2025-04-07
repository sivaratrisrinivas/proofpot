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

// GetAllRecipes retrieves a list of all recipes with selected fields for display.
func GetAllRecipes() ([]models.RecipeListItem, error) {
	query := `SELECT id, title, creator_address, content_hash, created_at FROM recipes ORDER BY created_at DESC`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error querying recipes: %w", err)
	}
	defer rows.Close()

	var recipes []models.RecipeListItem
	for rows.Next() {
		var recipe models.RecipeListItem
		if err := rows.Scan(&recipe.ID, &recipe.Title, &recipe.CreatorAddress, &recipe.ContentHash, &recipe.CreatedAt); err != nil {
			// Log the error but continue processing other rows if possible
			log.Printf("Error scanning recipe row: %v", err)
			continue // Or return the error immediately: return nil, fmt.Errorf("error scanning recipe row: %w", err)
		}
		recipes = append(recipes, recipe)
	}

	if err = rows.Err(); err != nil {
		// This catches errors that happened during iteration
		return nil, fmt.Errorf("error iterating recipe rows: %w", err)
	}

	return recipes, nil
}

// GetRecipeByHash retrieves a single full recipe by its content hash.
// It returns sql.ErrNoRows if no recipe is found with the given hash.
func GetRecipeByHash(hash string) (models.Recipe, error) {
	var recipe models.Recipe
	query := `SELECT id, title, ingredients, steps, creator_address, content_hash, created_at FROM recipes WHERE content_hash = $1`

	err := DB.QueryRow(query, hash).Scan(
		&recipe.ID,
		&recipe.Title,
		&recipe.Ingredients,
		&recipe.Steps,
		&recipe.CreatorAddress,
		&recipe.ContentHash,
		&recipe.CreatedAt,
	)

	if err != nil {
		// Return the error directly. If it's sql.ErrNoRows, the handler will deal with it.
		// Otherwise, it's a genuine database error.
		return models.Recipe{}, fmt.Errorf("error querying or scanning recipe by hash %s: %w", hash, err)
	}

	return recipe, nil
}

// --- TODO: Add functions for GET endpoints here later (Step 4.1, 4.2) ---
// GetRecipeByHash(hash string) (models.Recipe, error)
