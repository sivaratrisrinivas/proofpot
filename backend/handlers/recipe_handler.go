package handlers

import (
	"errors"
	"log"
	"net/http"
	"proofpot-backend/blockchain"
	"proofpot-backend/database"
	"proofpot-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn" // Import for checking specific PostgreSQL errors
)

// HandleCreateRecipe handles the POST request to create a new recipe.
func HandleCreateRecipe(c *gin.Context) {
	var payload models.RecipeCreatePayload // Bind to payload struct

	// Bind and validate JSON
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload: " + err.Error()})
		return
	}

	// Basic validation (example: check for empty fields)
	if payload.Title == "" || payload.Ingredients == "" || payload.Steps == "" || payload.CreatorAddress == "" || payload.ContentHash == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
		return
	}

	// --- Step 3.5: Duplicate Hash Check ---
	exists, err := database.CheckHashExists(payload.ContentHash)
	if err != nil {
		log.Printf("Error checking hash existence for %s: %v", payload.ContentHash, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error checking recipe hash"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Recipe with this content hash already exists"})
		return
	}
	// --- End Step 3.5 ---

	// --- Step 3.6: Store Recipe in Database ---
	// Pass database.DB and the payload
	insertedID, err := database.InsertRecipe(database.DB, payload)
	if err != nil {
		log.Printf("Error inserting recipe into database: %v", err)
		// Check for specific DB errors like unique constraint violation (though CheckHashExists should prevent this)
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" { // 23505 is unique_violation
			c.JSON(http.StatusConflict, gin.H{"error": "Recipe with this content hash already exists (database constraint)"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error saving recipe"})
		}
		return
	}
	// --- End Step 3.6 ---

	// --- Step 3.7: Trigger Smart Contract Interaction (Async) ---
	// Launch blockchain registration in a separate goroutine
	go func(hash, creator string) {
		log.Printf("Starting background blockchain registration for hash: %s", hash)
		err := blockchain.RegisterRecipeOnChain(hash, creator)
		if err != nil {
			// Log the error, but don't block the main request flow
			log.Printf("ERROR: Failed background blockchain registration for hash %s: %v", hash, err)
		} else {
			log.Printf("Successfully completed background blockchain registration for hash: %s", hash)
		}
	}(payload.ContentHash, payload.CreatorAddress) // Pass necessary variables to the goroutine
	// --- End Step 3.7 ---

	// Respond 201 Created immediately after DB insert and launching background task
	c.JSON(http.StatusCreated, gin.H{
		"id":             insertedID,
		"title":          payload.Title,
		"creatorAddress": payload.CreatorAddress,
		"contentHash":    payload.ContentHash,
		"imageUrl":       payload.ImageURL, // Include image URL if it's part of the payload
		// CreatedAt is not available here unless we re-fetch
	})
}

// HandleGetRecipes handles the GET request to retrieve all recipes.
func HandleGetRecipes(c *gin.Context) {
	// Pass database.DB
	recipes, err := database.GetAllRecipes(database.DB)
	if err != nil {
		log.Printf("Error retrieving recipes from database: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error retrieving recipes"})
		return
	}

	c.JSON(http.StatusOK, recipes)
}

// HandleGetRecipeByHash handles the GET request to retrieve a single recipe by its hash.
func HandleGetRecipeByHash(c *gin.Context) {
	hash := c.Param("hash")
	if hash == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Recipe hash parameter is missing"})
		return
	}

	// Pass database.DB
	recipe, err := database.GetRecipeByHash(database.DB, hash)
	if err != nil {
		// Use the specific error type returned by GetRecipeByHash if needed
		// Assuming GetRecipeByHash returns nil, nil for not found
		log.Printf("Error retrieving recipe by hash %s: %v", hash, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error retrieving recipe"})
		return // Return internal server error for any DB error
	}

	if recipe == nil { // Check if recipe is nil (indicating not found)
		c.JSON(http.StatusNotFound, gin.H{"error": "Recipe not found"})
		return
	}

	c.JSON(http.StatusOK, recipe)
}
