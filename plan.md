# proofPot Development Plan

This document breaks down the features required for the proofPot application into small, manageable steps.

## Phase 1: Project Setup & Core Backend/Contract

### 1.1: Backend Setup (Go/Gin) ✅
     - Initialize Go module (`go mod init <module-path>`). ✅
     - Install Gin (`go get -u github.com/gin-gonic/gin`). ✅
     - Create a basic `main.go` file. ✅
     - Set up a simple Gin engine (`r := gin.Default()`). ✅
     - Create a basic health check endpoint (`/ping`) that returns "pong". ✅
     - Run the server locally (`go run main.go`). ✅

### 1.2: Database Setup (PostgreSQL) ✅
     - Install PostgreSQL locally or set up a cloud instance. ✅
     - Create a database named `proofpot_dev`. ✅
     - Design the `recipes` table schema: ✅
        - `id` (SERIAL PRIMARY KEY)
        - `title` (VARCHAR, not null)
        - `ingredients` (TEXT, not null)
        - `steps` (TEXT, not null)
        - `creator_address` (VARCHAR, not null)
        - `content_hash` (VARCHAR, not null, unique)
        - `created_at` (TIMESTAMP WITH TIME ZONE, default NOW())
     - Create the `recipes` table using SQL commands. ✅

### 1.3: Smart Contract Setup (Solidity/Hardhat) ✅
     - Create a new directory for the contract (e.g., `smart-contract`). ✅
     - Inside `smart-contract`, initialize a Hardhat project (`npx hardhat`). Choose "Create a TypeScript project" (or JavaScript if preferred). ✅
     - Install Hardhat toolbox: `npm install --save-dev @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-network-helpers @nomicfoundation/hardhat-chai-matchers @nomiclabs/hardhat-ethers @nomiclabs/hardhat-etherscan chai ethers hardhat-gas-reporter solidity-coverage @typechain/hardhat @typechain/ethers-v5 typechain typescript ts-node @types/node @types/mocha @types/chai` (or the JS equivalents). ✅ (Toolbox covers most)
     - Delete the sample contract (`Lock.sol`) and test/script files. ✅

### 1.4: Smart Contract Development (`RecipeRegistry.sol`)
     - Create `contracts/RecipeRegistry.sol`.
     - Define the Solidity version (e.g., `pragma solidity ^0.8.0;`).
     - Define the `RecipeRegistry` contract.
     - Add state variables:
        - `mapping(bytes32 => address) public recipeOwners;`
        - `mapping(bytes32 => uint256) public recipeTimestamps;`
     - Define an event: `event RecipeAdded(bytes32 indexed recipeHash, address indexed creator, uint256 timestamp);`
     - Implement the `addRecipe(bytes32 _recipeHash)` function:
        - Check if hash exists: `require(recipeOwners[_recipeHash] == address(0), "Recipe hash already exists");`
        - Store owner: `recipeOwners[_recipeHash] = msg.sender;`
        - Store timestamp: `recipeTimestamps[_recipeHash] = block.timestamp;`
        - Emit the `RecipeAdded` event.
     - Compile the contract: `npx hardhat compile`.

### 1.5: Smart Contract Deployment Script
     - Create `scripts/deploy.ts`.
     - Write script using `ethers.js` (via Hardhat) to deploy `RecipeRegistry.sol`.
     - Log the deployed contract address upon successful deployment.

### 1.6: Smart Contract Testing
     - Create `test/RecipeRegistry.test.ts`.
     - Write tests for the `addRecipe` function:
        - Test successful addition of a new recipe hash.
        - Test that owner and timestamp are stored correctly.
        - Test that the `RecipeAdded` event is emitted with correct parameters.
        - Test that adding the same hash twice fails with the correct error message.
     - Run tests: `npx hardhat test`.

### 1.7: Smart Contract Deployment to Sepolia
     - Configure `hardhat.config.ts`.
     - Ensure the deployer wallet has Sepolia ETH.
     - Run the deployment script targeting Sepolia: `npx hardhat run scripts/deploy.ts --network sepolia`.
     - Save the deployed contract address securely.

### 1.8: Backend - Database Connection & Models
     - Install Go Postgres driver (`go get github.com/lib/pq`).
     - Create a `database` package.
     - Implement logic to connect to the PostgreSQL database using connection string from environment variables.
     - Create a `models` package.
     - Define a `Recipe` struct matching the database schema.

## Phase 2: Frontend Setup & Wallet Connection ✅

### 2.1: Frontend Setup (React) ✅
     - Create a new React project (e.g., using Vite: `npm create vite@latest client -- --template react-ts`). ✅
     - Navigate into the `client` directory. ✅
     - Install dependencies: `npm install`. ✅
     - Install Tailwind CSS: Follow the official Tailwind guide for Vite. ✅
     - Install React Router: `npm install react-router-dom`. ✅
     - Set up basic routing (`BrowserRouter`, `Routes`, `Route`) in `App.tsx` for Home (`/`), Upload (`/upload`), and Recipe Detail (`/recipes/:id`). Create placeholder components for these pages. ✅
     - Run the frontend dev server: `npm run dev`. ✅

### 2.2: Frontend - Wallet Connection Libraries ✅
     - Install Web3Modal and ethers.js: `npm install web3modal ethers@^5`. (Note: Web3Modal v2 often uses ethers v5). ✅

### 2.3: Frontend - Web3Modal Configuration ✅
     - Obtain a Project ID from WalletConnect Cloud (`cloud.walletconnect.com`). ✅
     - Create a configuration file (e.g., `src/config/web3modal.ts`). ✅
     - Configure `EthereumClient` and `Web3Modal` using your Project ID and desired chains (Sepolia). ✅

### 2.4: Frontend - Wallet State Management ✅
     - Create a state management solution (e.g., Zustand store or React Context) to hold wallet connection state (isConnected, address, chainId, provider, signer). ✅

### 2.5: Frontend - Connect/Disconnect Button ✅
     - Create a `ConnectWalletButton` component. ✅
     - Use Web3Modal hooks/functions (`useWeb3Modal`, `useWeb3ModalState`, `useWeb3ModalAccount`) to get modal functions and connection state. ✅
     - If disconnected:
        - Display a "Connect Wallet" button. ✅
        - On click, call Web3Modal's `open()` function. ✅
     - If connected:
        - Display the connected account address (truncated). ✅
        - Display a "Disconnect" button. ✅
        - On click, call Web3Modal's disconnect logic. ✅
     - Add this button to the main layout/header. ✅

## Phase 3: Recipe Upload Feature

### 3.1: Frontend - Recipe Upload Form ✅
    - Create the `UploadRecipePage` component. ✅
    - Create a `RecipeForm` component within it. ✅
    - Add form fields (controlled components using `useState`): ✅
        - Input for `title`. ✅
        - Textarea for `ingredients`. ✅
        - Textarea for `steps`. ✅
    - Add a submit button. ✅
    - Ensure the form is only submittable if a wallet is connected. ✅

### 3.2: Frontend - Client-Side Hashing ✅
    - Add logic to the `RecipeForm` submission handler: ✅
        - Concatenate the `ingredients` and `steps` state variables into a single string. ✅
        - Use `ethers.utils.sha256(ethers.utils.toUtf8Bytes(content))` to calculate the SHA-256 hash. ✅

### 3.3: Frontend - API Call for Upload
    - Create an API service/hook for interacting with the backend. ✅
    - In the `RecipeForm` submission handler: ✅
        - Get the connected user's address from the wallet state. ✅
        - Construct the request body: { title, ingredients, steps, creatorAddress, contentHash }. ✅
        - Make a `POST` request to the backend (`/api/recipes`) using `fetch` or `axios`.
        - Handle the response: show success/error messages to the user (e.g., using a toast library). Redirect to home or the new recipe page on success.

### 3.4: Backend - Recipe Upload Endpoint (`POST /api/recipes`)
    - In `main.go`, define the `POST /api/recipes` route and link it to a handler function (e.g., `handleCreateRecipe`).
    - In the handler:
        - Bind the incoming JSON request body to the `Recipe` struct. Handle binding errors.
        - Perform basic validation (e.g., ensure required fields are not empty).

### 3.5: Backend - Duplicate Hash Check
    - In the `database` package, create a function `CheckHashExists(hash string) (bool, error)`.
    - Implement the SQL query `SELECT EXISTS(SELECT 1 FROM recipes WHERE content_hash = $1)`.
    - In the `handleCreateRecipe` handler, call `CheckHashExists`. If it returns true, respond with a 409 Conflict error ("Recipe already exists").

### 3.6: Backend - Store Recipe in Database
    - In the `database` package, create a function `InsertRecipe(recipe models.Recipe) (int, error)` that inserts the recipe data and returns the new recipe ID.
    - In the `handleCreateRecipe` handler (if hash doesn't exist), call `InsertRecipe`. Handle potential database errors.

### 3.7: Backend - Trigger Smart Contract Interaction
    - Install go-ethereum: `go get github.com/ethereum/go-ethereum`.
    - Create a `blockchain` package.
    - Implement logic to:
        - Load the `RecipeRegistry` ABI (can be stored as a const string).
        - Load the deployed contract address (from env var).
        - Load the backend wallet's private key (from env var).
        - Connect to the Sepolia RPC node (URL from env var).
        - Create an authenticated transaction signer using the private key and chain ID.
        - Create an instance of the contract using the address, ABI, and client/signer.
    - In the `handleCreateRecipe` handler (after successful DB insert):
        - Convert the recipe `contentHash` string (hex) to `[32]byte`.
        - Call the `addRecipe` method on the contract instance, passing the hash bytes.
        - Wait for the transaction receipt (optional, but good for confirming). Handle transaction errors (e.g., out of gas, reverted). Log the transaction hash.
        - If the contract interaction fails, potentially consider how to handle the already inserted DB record (e.g., mark as pending, implement retry, or log for manual intervention - simplest for MVP is to just log the error).
    - Respond to the frontend with 201 Created and the newly created recipe data (or just its ID).

## Phase 4: Recipe Display Feature

### 4.1: Backend - Get All Recipes Endpoint (`GET /api/recipes`)
    - Define the `GET /api/recipes` route and handler (`handleGetRecipes`).
    - In the `database` package, create `GetAllRecipes() ([]models.Recipe, error)`. Implement the SQL query `SELECT id, title, creator_address, content_hash, created_at FROM recipes ORDER BY created_at DESC;` (Note: Exclude large text fields for list view).
    - In the handler, call `GetAllRecipes`, handle errors, and return the list as JSON.

### 4.2: Backend - Get Single Recipe Endpoint (`GET /api/recipes/:hash`)
    - Define the `GET /api/recipes/:hash` route and handler (`handleGetRecipeByHash`).
    - Get the `hash` parameter from the URL.
    - In the `database` package, create `GetRecipeByHash(hash string) (models.Recipe, error)`. Implement the SQL query `SELECT * FROM recipes WHERE content_hash = $1;`. Handle "not found" errors specifically.
    - In the handler, call `GetRecipeByHash`, handle errors (return 404 if not found), and return the full recipe details as JSON.

### 4.3: Frontend - Home Page Recipe List ✅
    - Create the `HomePage` component. ✅
    - Use `useEffect` and the API service to fetch data from `GET /api/recipes` when the component mounts. Store results in `useState`.
    - Create `RecipeList` and `RecipeListItem` components. ✅
    - `RecipeList`: Takes the array of recipes as a prop and maps over it, rendering a `RecipeListItem` for each. ✅
    - `RecipeListItem`: Displays title and truncated creator address. Make the item clickable, linking to the detail page (e.g., `/recipes/<hash>`). ✅
    - Handle loading and error states during the API call. ✅

### 4.4: Frontend - Recipe Detail Page ✅
    - Create the `RecipeDetailPage` component. ✅
    - Get the recipe hash from the URL parameters using `useParams` from `react-router-dom`. ✅
    - Use `useEffect` to fetch data from `GET /api/recipes/:hash` based on the hash. Store result in `useState`.
    - Display all recipe details: title, full creator address, ingredients, steps, creation timestamp. ✅
    - Handle loading state and "Recipe not found" errors. ✅

## Phase 5: Crypto Tipping Feature

### 5.1: Frontend - Tip Button & Input ✅
    - In the `RecipeDetailPage` component: ✅
        - Add a "Tip Creator" button near the creator's address. ✅
        - Add an input field (type="number", step="0.01") for the user to enter the tip amount in ETH. Use `useState` to manage its value. ✅
        - Disable the button and input if the current user's wallet is not connected OR if the connected user *is* the creator. ✅

### 5.2: Frontend - Tipping Logic ✅
    - Add an `onClick` handler to the "Tip Creator" button. ✅
    - Inside the handler: ✅
        - Get the `signer` object from the wallet state. If no signer, return/show error. ✅
        - Get the creator's address from the recipe data. ✅
        - Get the tip amount from the input state. Validate it's a positive number. ✅
        - Convert the tip amount (ETH string) to Wei using `ethers.utils.parseEther()`. ✅
        - Construct the transaction object: `{ to: creatorAddress, value: tipAmountInWei }`. ✅
        - Call `signer.sendTransaction(txObject)`. ✅
        - Wrap the call in a try/catch block to handle errors (user rejection, insufficient funds, etc.). ✅
        - Provide user feedback: show a loading indicator while sending, display success message with transaction hash link (e.g., to Etherscan) on success, show error message on failure. ✅

## Phase 6: Refinements & Deployment

### 6.1: Styling & UI Polish
    - Apply Tailwind CSS classes consistently across all components for a clean UI.
    - Ensure responsiveness on different screen sizes.
    - Add loading indicators where appropriate (API calls, transaction sending).
    - Improve error handling feedback.

### 6.2: Backend Configuration & Environment Variables
    - Ensure all sensitive information (DB connection string, JWT secret, RPC URLs, private keys, contract addresses) is loaded from environment variables, not hardcoded.
    - Use a `.env` file for local development.

### 6.3: Frontend Build & Backend Dockerization (Optional)
    - Create a production build of the React app (`npm run build`).
    - Create a `Dockerfile` for the Go backend application.
    - Build the Docker image.

### 6.4: Deployment
    - Deploy the frontend static build to Vercel, Netlify, or similar.
    - Deploy the backend (Go app or Docker container) to Heroku, Fly.io, Render, AWS, etc.
    - Configure environment variables in the deployment platforms.
    - Set up CORS correctly on the backend to allow requests from the frontend domain.
    - Test the live application thoroughly.
