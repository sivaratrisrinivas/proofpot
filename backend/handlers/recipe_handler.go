package handlers

import (
	"log"
	"net/http"
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

	// --- TODO: Implement Step 3.6: Store Recipe in Database ---
	// newRecipe.ID, err = database.InsertRecipe(newRecipe)
	// if err != nil { ... handle db error ... }

	// --- TODO: Implement Step 3.7: Trigger Smart Contract Interaction ---
	// err = blockchain.RegisterRecipeOnChain(newRecipe.ContentHash)
	// if err != nil { ... handle contract error, maybe log it ... }

	// If validation and checks pass (and DB insert happens later), respond 201 Created
	newRecipe.ID = 999 // Placeholder - Will be replaced by DB ID in Step 3.6
	c.JSON(http.StatusCreated, newRecipe)
}
