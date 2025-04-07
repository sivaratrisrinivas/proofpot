package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

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

// --- TODO: Add InsertRecipe function here later (Step 3.6) ---
