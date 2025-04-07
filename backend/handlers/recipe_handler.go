package handlers

import (
	"database/sql" // Needed for sql.ErrNoRows
	"errors"       // Needed for errors.Is
	"log"
	"net/http"
	"proofpot-backend/blockchain"
	"proofpot-backend/database"
	"proofpot-backend/models"

	"github.com/gin-gonic/gin"
)

// HandleCreateRecipe handles the POST request to create a new recipe.
func HandleCreateRecipe(c *gin.Context) {
	var newRecipe models.Recipe

	// Bind and validate JSON
	if err := c.ShouldBindJSON(&newRecipe); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload: " + err.Error()})
		return
	}

	// --- Step 3.5: Duplicate Hash Check ---
	exists, err := database.CheckHashExists(newRecipe.ContentHash)
	if err != nil {
		// Log the actual database error for server-side debugging
		log.Printf("Error checking hash existence for %s: %v", newRecipe.ContentHash, err)
		// Return a generic server error to the client
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error checking recipe hash"})
		return
	}
	if exists {
		// Hash already exists, return 409 Conflict
		c.JSON(http.StatusConflict, gin.H{"error": "Recipe with this content hash already exists"})
		return
	}
	// --- End Step 3.5 ---

	// --- Step 3.6: Store Recipe in Database ---
	insertedID, err := database.InsertRecipe(newRecipe)
	if err != nil {
		log.Printf("Error inserting recipe into database: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error saving recipe"})
		return
	}
	newRecipe.ID = insertedID // Set the ID from the database result
	// Note: CreatedAt is automatically set by the database default
	// --- End Step 3.6 ---

	// --- Step 3.7: Trigger Smart Contract Interaction ---
	err = blockchain.RegisterRecipeOnChain(newRecipe.ContentHash)
	if err != nil {
		// Log the error, but maybe don't fail the whole request?
		// The recipe is saved in the DB, but contract call failed.
		// For MVP, just logging might be okay. Could add a status field to recipe later.
		log.Printf("WARNING: Failed to register recipe hash %s on chain after DB insert: %v", newRecipe.ContentHash, err)
		// Optionally: return a different status or modified response to indicate partial success?
		// For now, we proceed to return 201 Created as the core DB operation succeeded.
	}
	// --- End Step 3.7 ---

	// Respond 201 Created with the full recipe data (including the new ID)
	c.JSON(http.StatusCreated, newRecipe)
}

// handleGetRecipes handles the GET request to retrieve all recipes.
func HandleGetRecipes(c *gin.Context) {
	recipes, err := database.GetAllRecipes()
	if err != nil {
		log.Printf("Error retrieving recipes from database: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error retrieving recipes"})
		return
	}

	// Return 200 OK with the list of recipes
	// If no recipes exist, this will correctly return an empty list `[]`
	c.JSON(http.StatusOK, recipes)
}

// HandleGetRecipeByHash handles the GET request to retrieve a single recipe by its hash.
func HandleGetRecipeByHash(c *gin.Context) {
	// Get the hash from the URL parameter
	hash := c.Param("hash")
	if hash == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Recipe hash parameter is missing"})
		return
	}

	// Call the database function to get the recipe
	recipe, err := database.GetRecipeByHash(hash)
	if err != nil {
		// Check if the error is specifically "no rows found"
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Recipe not found"})
		} else {
			// Log the actual database error and return a generic server error
			log.Printf("Error retrieving recipe by hash %s: %v", hash, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error retrieving recipe"})
		}
		return
	}

	// Return 200 OK with the found recipe
	c.JSON(http.StatusOK, recipe)
}
