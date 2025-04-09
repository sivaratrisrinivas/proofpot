# proofPot Development Plan

This document breaks down the features required for the proofPot application into small, manageable steps.

## Phase 1: Project Setup & Core Backend/Contract

### 1.1: Backend Setup (Go/Gin) ✅
     - Initialize Go module (`go mod init <module-path>`). ✅ (`proofpot-backend`)
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
        - `image_url` (TEXT, nullable) ✅ (Added via ALTER TABLE)
     - Create the `recipes` table using SQL commands. ✅

### 1.3: Smart Contract Setup (Solidity/Hardhat) ✅
     - Create a new directory for the contract (e.g., `smart-contract`). ✅
     - Inside `smart-contract`, initialize a Hardhat project (`npx hardhat`). Choose "Create a TypeScript project" (or JavaScript if preferred). ✅
     - Install Hardhat toolbox: `npm install --save-dev @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-network-helpers @nomicfoundation/hardhat-chai-matchers @nomiclabs/hardhat-ethers @nomiclabs/hardhat-etherscan chai ethers hardhat-gas-reporter solidity-coverage @typechain/hardhat @typechain/ethers-v5 typechain typescript ts-node @types/node @types/mocha @types/chai` (or the JS equivalents). ✅ (Toolbox covers most)
     - Delete the sample contract (`Lock.sol`) and test/script files. ✅

### 1.4: Smart Contract Development (`RecipeRegistry.sol`) ✅
     - Create `contracts/RecipeRegistry.sol`. ✅
     - Define the Solidity version (e.g., `pragma solidity ^0.8.0;`). ✅
     - Define the `RecipeRegistry` contract. ✅ (Uses OpenZeppelin Ownable) ✅
     - Add state variables: ✅
        - `mapping(bytes32 => address) public recipeCreators;` (Renamed from recipeOwners) ✅
        - `mapping(bytes32 => uint256) public recipeTimestamps;` ✅
     - Define an event: `event RecipeAdded(bytes32 indexed recipeHash, address indexed creator, uint256 timestamp);` ✅
     - Implement the `addRecipe(bytes32 _recipeHash, address _creator)` function: ✅
        - Check if hash exists: `require(recipeCreators[_recipeHash] == address(0), "Recipe hash already exists");` ✅
        - Store creator: `recipeCreators[_recipeHash] = _creator;` ✅
        - Store timestamp: `recipeTimestamps[_recipeHash] = block.timestamp;` ✅
        - Add `onlyOwner` modifier. ✅
        - Emit the `RecipeAdded` event. ✅
     - Compile the contract: `npx hardhat compile`. ✅

### 1.5: Smart Contract Deployment Script ✅
     - Create `scripts/deploy.ts`. ✅
     - Write script using `ethers.js` (via Hardhat) to deploy `RecipeRegistry.sol`. ✅
     - Log the deployed contract address upon successful deployment. ✅

### 1.6: Smart Contract Testing ✅
     - Create `test/RecipeRegistry.test.ts`. ✅
     - Write tests for the `addRecipe` function: ✅
        - Test successful addition by the owner. ✅
        - Test failure when called by non-owner. ✅
        - Test that creator and timestamp are stored correctly. ✅
        - Test that the `RecipeAdded` event is emitted with correct parameters. ✅
        - Test that adding the same hash twice fails with the correct error message. ✅
     - Run tests: `npx hardhat test`. ✅

### 1.7: Smart Contract Deployment to Sepolia ✅
     - Configure `hardhat.config.ts`. ✅
     - Ensure the deployer wallet has Sepolia ETH. ✅
     - Run the deployment script targeting Sepolia: `npx hardhat run scripts/deploy.ts --network sepolia`. ✅
     - Save the deployed contract address securely. ✅ (Address: `0x0CB9e22727D43B2d909081c329D5D056375Fab65`) ✅

### 1.8: Backend - Database Connection & Models ✅
     - Install Go Postgres driver (`go get github.com/lib/pq`). ✅
     - Create a `database` package. ✅
     - Implement logic to connect to the PostgreSQL database using connection string from environment variables (`db.go`). ✅
     - Create a `models` package. ✅
     - Define `Recipe`, `RecipeListItem`, `RecipeCreatePayload` structs matching schema/API needs. ✅ (Includes `ImageURL` handling: `string` in payload, `*string` in others). ✅

## Phase 2: Frontend Setup & Wallet Connection ✅

### 2.1: Frontend Setup (React) ✅
     - Create a new React project (e.g., using Vite: `npm create vite@latest client -- --template react-ts`). ✅ (`client` dir renamed to project root `src`) ✅
     - Navigate into the `client` directory. ✅ (Not applicable, setup in root)
     - Install dependencies: `npm install`. ✅
     - Install Tailwind CSS: Follow the official Tailwind guide for Vite. ✅ (Uses shadcn/ui) ✅
     - Install React Router: `npm install react-router-dom`. ✅
     - Set up basic routing (`BrowserRouter`, `Routes`, `Route`) in `App.tsx` for Home (`/`), Upload (`/upload`), and Recipe Detail (`/recipes/:hash`). Create placeholder components for these pages. ✅ (Uses `/recipe/:hash`) ✅
     - Run the frontend dev server: `npm run dev`. ✅

### 2.2: Frontend - Wallet Connection Libraries ✅
     - Install Web3Modal and ethers.js: `npm install web3modal ethers@^5`. ✅

### 2.3: Frontend - Web3Modal Configuration ✅
     - Obtain a Project ID from WalletConnect Cloud (`cloud.walletconnect.com`). ✅
     - Create a configuration file (e.g., `src/config/web3modal.ts`). ✅
     - Configure `EthereumClient` and `Web3Modal` using your Project ID and desired chains (Sepolia). ✅

### 2.4: Frontend - Wallet State Management ✅
     - Create a state management solution (e.g., Zustand store or React Context) to hold wallet connection state (isConnected, address, chainId, provider, signer). ✅ (Implemented using Web3Modal hooks) ✅

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

## Phase 3: Recipe Upload Feature ✅

### 3.1: Frontend - Recipe Upload Form ✅
    - Create the `UploadRecipePage` component. ✅ (`CreateRecipePage.tsx`) ✅
    - Create a `RecipeForm` component within it. ✅ (Form logic within page) ✅
    - Add form fields (controlled components using `useState`): ✅
        - Input for `title`. ✅
        - Textarea for `ingredients`. ✅
        - Textarea for `steps`. ✅
        - Input for `imageUrl` (optional). ✅
    - Add a submit button. ✅
    - Ensure the form is only submittable if a wallet is connected. ✅

### 3.2: Frontend - Client-Side Hashing ✅
    - Add logic to the form submission handler: ✅
        - Concatenate the `ingredients` and `steps` state variables into a single string. ✅
        - Use `ethers.utils.sha256(ethers.utils.toUtf8Bytes(content))` to calculate the SHA-256 hash. ✅

### 3.3: Frontend - API Call for Upload ✅
    - Create an API service/hook for interacting with the backend (`src/services/recipeService.ts`). ✅
    - In the form submission handler: ✅
        - Get the connected user's address from the wallet state. ✅
        - Construct the request body (`RecipeComponentPayload` -> `RecipeApiPayload`): { title, ingredients (joined), steps (joined), creatorAddress, contentHash, imageUrl }. ✅
        - Make a `POST` request to the backend (`/api/recipes`) using `fetch` or `axios`. ✅
        - Handle the response: show success/error messages to the user (e.g., using a toast library). Redirect to home or the new recipe page on success. ✅

### 3.4: Backend - Recipe Upload Endpoint (`POST /api/recipes`) ✅
    - In `main.go`, define the `POST /api/recipes` route and link it to a handler function (`handlers.HandleCreateRecipe`). ✅
    - In the handler:
        - Bind the incoming JSON request body to the `models.RecipeCreatePayload` struct. Handle binding errors. ✅ (Uses `RecipeCreatePayload` with `ImageURL` as `string`) ✅
        - Perform basic validation (e.g., ensure required fields are not empty). ✅

### 3.5: Backend - Duplicate Hash Check ✅
    - In the `database` package, create a function `CheckHashExists(hash string) (bool, error)` (`db.go`). ✅
    - Implement the SQL query `SELECT EXISTS(SELECT 1 FROM recipes WHERE content_hash = $1)`. ✅
    - In the `handleCreateRecipe` handler, call `CheckHashExists`. If it returns true, respond with a 409 Conflict error ("Recipe already exists"). ✅

### 3.6: Backend - Store Recipe in Database ✅
    - In the `database` package, create a function `InsertRecipe(db *sql.DB, recipe models.RecipeCreatePayload) (int, error)` (`recipe_repo.go`) that inserts the recipe data (including `image_url`) and returns the new recipe ID. ✅
    - In the `handleCreateRecipe` handler (if hash doesn't exist), call `InsertRecipe` passing `database.DB` and the payload. Handle potential database errors. ✅ (Includes check for unique constraint `pgErr.Code == "23505"`). ✅

### 3.7: Backend - Trigger Smart Contract Interaction ✅
    - Install go-ethereum: `go get github.com/ethereum/go-ethereum`. ✅
    - Create a `blockchain` package. ✅
    - Implement logic to: ✅
        - Load the `RecipeRegistry` ABI (stored as a const string). ✅
        - Load the deployed contract address (from env var). ✅
        - Load the backend wallet's private key (from env var). ✅ (Key *must* correspond to Contract Owner address) ✅
        - Connect to the Sepolia RPC node (URL from env var). ✅
        - Create an authenticated transaction signer using the private key and chain ID. ✅
        - Create an instance of the contract using the address, ABI, and client/signer. ✅ (Implicitly done via packing/sending) ✅
    - Define `RegisterRecipeOnChain(hash string, creatorAddress string) error`. ✅
    - In the `handleCreateRecipe` handler (after successful DB insert): ✅
        - Convert the recipe `contentHash` string (hex) to `[32]byte`. ✅
        - Get the `creatorAddress` string from the payload. ✅
        - Call `RegisterRecipeOnChain` which calls the `addRecipe` method on the contract instance, passing the hash bytes and the creator address. ✅
        - Wait for the transaction receipt (optional, but good for confirming). ✅ (Waits for receipt) ✅
        - Handle transaction errors (e.g., out of gas, reverted). Log the transaction hash. ✅
        - If the contract interaction fails, log the error. ✅
    - Respond to the frontend with 201 Created and essential recipe data (id, hash, creator, title, imageUrl). ✅

## Phase 4: Recipe Display Feature ✅

### 4.1: Backend - Get All Recipes Endpoint (`GET /api/recipes`) ✅
    - Define the `GET /api/recipes` route and handler (`handlers.HandleGetRecipes`). ✅
    - In the `database` package (`recipe_repo.go`), create `GetAllRecipes(db *sql.DB) ([]models.RecipeListItem, error)`. Implement SQL query selecting needed fields (including `image_url`) from `recipes` table. ✅
    - In the handler, call `GetAllRecipes` passing `database.DB`, handle errors, and return the list of `RecipeListItem` as JSON. ✅

### 4.2: Backend - Get Single Recipe Endpoint (`GET /api/recipes/:hash`) ✅
    - Define the `GET /api/recipes/:hash` route and handler (`handlers.HandleGetRecipeByHash`). ✅
    - Get the `hash` parameter from the URL. ✅
    - In the `database` package (`recipe_repo.go`), create `GetRecipeByHash(db *sql.DB, hash string) (*models.Recipe, error)`. Implement SQL query selecting all fields (including `image_url`) from `recipes` WHERE `content_hash = $1`. Handle "not found" by returning `nil, nil`. ✅
    - In the handler, call `GetRecipeByHash` passing `database.DB`, handle errors (return 404 if result is `nil`), and return the full `models.Recipe` details as JSON. ✅

### 4.3: Frontend - Home Page Recipe List ✅
    - Create the `HomePage` component. ✅
    - Use `useEffect` and the API service (`recipeService.getRecipes`) to fetch data from `GET /api/recipes` when the component mounts. Store results in `useState`. ✅
    - Create `RecipeList` and `RecipeCard` components. ✅
    - `RecipeList`: Takes the array of recipes as a prop and maps over it, rendering a `RecipeCard` for each. ✅ (Logic within `HomePage`). ✅
    - `RecipeCard`: Displays title, truncated creator address, and the image (or placeholder if `imageUrl` is empty/missing). Make the item clickable, linking to the detail page (`/recipe/<hash>`). ✅
    - Handle loading and error states during the API call. ✅ (Skeleton loaders implemented) ✅

### 4.4: Frontend - Recipe Detail Page ✅
    - Create the `RecipeDetailPage` component. ✅
    - Get the recipe hash from the URL parameters using `useParams` from `react-router-dom`. ✅
    - Use `useEffect` to fetch data from `GET /api/recipes/:hash` using `recipeService.getRecipeByHash` based on the hash. Store result in `useState`. ✅
    - Display all recipe details: title, full creator address, ingredients, steps, creation timestamp, image (if available). ✅
    - Handle loading state and "Recipe not found" errors. ✅

## Phase 5: Crypto Tipping Feature (Not Started)

### 5.1: Frontend - Tip Button & Input
    - In the `RecipeDetailPage` component:
        - Add a "Tip Creator" button near the creator's address.
        - Add an input field (type="number", step="0.01") for the user to enter the tip amount in ETH. Use `useState` to manage its value.
        - Disable the button and input if the current user's wallet is not connected OR if the connected user *is* the creator.

### 5.2: Frontend - Tipping Logic
    - Add an `onClick` handler to the "Tip Creator" button.
    - Inside the handler:
        - Get the `signer` object from the wallet state. If no signer, return/show error.
        - Get the creator's address from the recipe data.
        - Get the tip amount from the input state. Validate it's a positive number.
        - Convert the tip amount (ETH string) to Wei using `ethers.utils.parseEther()`.
        - Construct the transaction object: `{ to: creatorAddress, value: tipAmountInWei }`.
        - Call `signer.sendTransaction(txObject)`.
        - Wrap the call in a try/catch block to handle errors (user rejection, insufficient funds, etc.).
        - Provide user feedback: show a loading indicator while sending, display success message with transaction hash link (e.g., to Etherscan) on success, show error message on failure.

## Phase 6: Refinements & Deployment (Partially Done)

### 6.1: Styling & UI Polish ✅
    - Apply Tailwind CSS classes consistently across all components for a clean UI. ✅ (Using shadcn/ui) ✅
    - Ensure responsiveness on different screen sizes. (Needs testing)
    - Add loading indicators where appropriate (API calls, transaction sending). ✅ (Skeleton loaders implemented) ✅
    - Improve error handling feedback. ✅ (Added toasts/messages for API/contract errors) ✅

### 6.2: Backend Configuration & Environment Variables ✅
    - Ensure all sensitive information (DB connection string, RPC URLs, private keys, contract addresses) is loaded from environment variables, not hardcoded. ✅
    - Use a `.env` file for local development. ✅ (Requires `.env.example`) ✅
    - Set necessary secrets on deployment platform (Fly.io): ✅
        - `DATABASE_URL` (via `fly postgres attach`) ✅
        - `CORS_ALLOWED_ORIGINS` ✅
        - `SEPOLIA_RPC_URL` ✅
        - `BACKEND_PRIVATE_KEY` ✅
        - `RECIPE_REGISTRY_CONTRACT_ADDRESS` ✅

### 6.3: Database Schema & Optimization ✅
    - Create `recipes` table in production database (Fly.io). ✅
    - Add index on `content_hash` column for performance (`CREATE INDEX idx_recipes_content_hash ON recipes(content_hash);`). ✅

### 6.4: Frontend Environment Configuration ✅
    - Set `VITE_API_BASE_URL` in Vercel environment variables to point to the deployed backend API (e.g., `https://proofpot-backend.fly.dev/api`). ✅

### 6.5: Frontend API Service Robustness ✅
    - Handle potential `null` response from `GET /api/recipes` when list is empty in `recipeService.ts`. ✅

### 6.6: Performance - Backend Request Handling ✅
    - Modify `HandleCreateRecipe` to run blockchain registration asynchronously in a goroutine, improving API response time. ✅

### 6.7: Frontend Build & Backend Dockerization (Optional) (Not Started)
    - Create a production build of the React app (`npm run build`).
    - Create a `Dockerfile` for the Go backend application.
    - Build the Docker image.

### 6.8: Deployment (Partially Done - Vercel/Fly.io)
    - Deploy the frontend static build to Vercel, Netlify, or similar. ✅ (Deployed to Vercel)
    - Deploy the backend (Go app or Docker container) to Heroku, Fly.io, Render, AWS, etc. ✅ (Deployed to Fly.io)
    - Configure environment variables in the deployment platforms. ✅ (Partially done, see 6.2/6.4)
    - Set up CORS correctly on the backend to allow requests from the frontend domain. ✅ (Done via middleware and secret)
    - Test the live application thoroughly. ✅ (Ongoing)

### 6.9: Performance - Further Optimization (Not Started)
    - Implement API pagination (`limit`, `offset`) for `GET /api/recipes`.
    - Implement frontend pagination/infinite scroll.
    - Optimize `RecipeListItem` payload (omit large fields).
    - Replace background goroutine with a robust job queue (e.g., Asynq).
