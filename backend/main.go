package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"proofpot-backend/blockchain" // Import the blockchain package
	"proofpot-backend/database"   // Import the database package
	"proofpot-backend/handlers"   // Import the handlers package
	"syscall"
	"time"

	"github.com/gin-contrib/cors" // Import CORS middleware
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load() // Load .env file
	if err != nil {
		log.Println("Note: Error loading .env file, using system environment variables.")
	}

	// Initialize Database
	database.InitDB()
	// Ensure DB connection is closed when main function exits
	defer database.CloseDB()

	// Initialize Blockchain Connection
	if err := blockchain.InitBlockchain(); err != nil {
		log.Fatalf("Failed to initialize blockchain connection: %v", err)
	}

	r := gin.Default()

	// --- CORS Middleware ---
	// Allow requests from your frontend development server (e.g., localhost:5173)
	// Adjust origin as needed for deployment
	config := cors.DefaultConfig()
	// config.AllowOrigins = []string{"http://localhost:5173"}
	config.AllowAllOrigins = true // Allow all for now, restrict in production
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"} // Add other headers if needed
	r.Use(cors.New(config))

	// --- API Routes ---
	api := r.Group("/api")
	{
		// Health Check
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "pong"})
		})

		// Recipe Routes
		api.POST("/recipes", handlers.HandleCreateRecipe)
		// --- TODO: Add GET routes here later (Step 4.1, 4.2) ---
		// api.GET("/recipes", handlers.HandleGetRecipes)
		// api.GET("/recipes/:hash", handlers.HandleGetRecipeByHash)
	}

	// Run the server in a goroutine so it doesn't block
	srv := &http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	go func() {
		// service connections
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server with a timeout.
	quit := make(chan os.Signal, 1)
	// kill (no param) default send syscall.SIGTERM
	// kill -2 is syscall.SIGINT
	// kill -9 is syscall.SIGKILL but can't be caught, so don't need to add it
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// The context is used to inform the server it has 5 seconds to finish
	// the request it is currently handling
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}
