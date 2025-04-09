package blockchain

import (
	"context"
	"crypto/ecdsa"
	"encoding/hex"
	"fmt"
	"log"
	"math/big"
	"os"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

// Global variables for blockchain connection (consider dependency injection for more complex apps)
var (
	ethClient       *ethclient.Client
	contractAddress common.Address
	contractABI     abi.ABI
	auth            *bind.TransactOpts
	backendKey      *ecdsa.PrivateKey
)

// Updated ABI for RecipeRegistry with Ownable and modified addRecipe
const recipeRegistryABI = `[{"inputs":[{"internalType":"address","name":"initialOwner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"recipeHash","type":"bytes32"},{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"RecipeAdded","type":"event"},{"inputs":[{"internalType":"bytes32","name":"_recipeHash","type":"bytes32"},{"internalType":"address","name":"_creator","type":"address"}],"name":"addRecipe","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"recipeOwners","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"recipeTimestamps","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]`

// InitBlockchain initializes the Ethereum client, contract instance, and transaction signer.
func InitBlockchain() error {
	// Load config from environment variables
	rpcURL := os.Getenv("SEPOLIA_RPC_URL")   // Use the same var name as Hardhat config
	pKey := os.Getenv("BACKEND_PRIVATE_KEY") // Use a dedicated backend key
	contractAddrStr := os.Getenv("RECIPE_REGISTRY_CONTRACT_ADDRESS")

	if rpcURL == "" || pKey == "" || contractAddrStr == "" {
		return fmt.Errorf("required blockchain environment variables not set (SEPOLIA_RPC_URL, BACKEND_PRIVATE_KEY, RECIPE_REGISTRY_CONTRACT_ADDRESS)")
	}

	// --- Connect to Ethereum client ---
	var err error
	ethClient, err = ethclient.Dial(rpcURL)
	if err != nil {
		return fmt.Errorf("failed to connect to Ethereum client: %w", err)
	}
	log.Println("Connected to Ethereum client")

	// --- Load Contract ABI and Address ---
	contractAddress = common.HexToAddress(contractAddrStr)
	parsedABI, err := abi.JSON(strings.NewReader(recipeRegistryABI))
	if err != nil {
		return fmt.Errorf("failed to parse contract ABI: %w", err)
	}
	contractABI = parsedABI
	log.Println("Contract ABI loaded")

	// --- Setup Transaction Signer (Auth) ---
	privateKey, err := crypto.HexToECDSA(pKey)
	if err != nil {
		return fmt.Errorf("failed to load private key: %w", err)
	}
	backendKey = privateKey

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return fmt.Errorf("error casting public key to ECDSA")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
	nonce, err := ethClient.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		return fmt.Errorf("failed to get nonce: %w", err)
	}

	chainID, err := ethClient.ChainID(context.Background())
	if err != nil {
		return fmt.Errorf("failed to get chain ID: %w", err)
	}

	auth, err = bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		return fmt.Errorf("failed to create keyed transactor: %w", err)
	}
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)     // Amount of ETH to send with tx (0 for this call)
	auth.GasLimit = uint64(300000) // Set a suitable gas limit
	// Fetch suggested gas price (can be dynamic)
	gasPrice, err := ethClient.SuggestGasPrice(context.Background())
	if err != nil {
		log.Printf("Warning: failed to suggest gas price: %v. Using default.", err)
		// Set a default or handle error differently if needed
		// auth.GasPrice = big.NewInt(20000000000) // Example default: 20 Gwei
	} else {
		auth.GasPrice = gasPrice
	}

	log.Printf("Blockchain setup complete. Using address: %s", fromAddress.Hex())
	return nil
}

// RegisterRecipeOnChain interacts with the deployed RecipeRegistry contract to add a recipe hash.
func RegisterRecipeOnChain(contentHashHex string, creatorAddressStr string) error {
	if ethClient == nil || auth == nil || backendKey == nil {
		return fmt.Errorf("blockchain service not initialized correctly")
	}

	log.Printf("Attempting to register hash %s for creator %s on chain", contentHashHex, creatorAddressStr)

	// Convert the hex hash string (e.g., "0x...") to [32]byte
	hashBytes, err := hex.DecodeString(strings.TrimPrefix(contentHashHex, "0x"))
	if err != nil || len(hashBytes) != 32 {
		return fmt.Errorf("invalid content hash format: %w", err)
	}
	var contentHash [32]byte
	copy(contentHash[:], hashBytes)

	// Convert creator address string to common.Address
	if !common.IsHexAddress(creatorAddressStr) {
		return fmt.Errorf("invalid creator address format: %s", creatorAddressStr)
	}
	creatorAddress := common.HexToAddress(creatorAddressStr)

	// Create a contract instance bound to the specific address
	// Note: We use the low-level `abi.Pack` and `ethClient.SendTransaction` here
	// because we don't have the generated Go bindings for the contract.
	// Alternatively, use `abigen` to generate Go bindings for a typed interface.

	// Pack the data for the addRecipe function call, now including creatorAddress
	callData, err := contractABI.Pack("addRecipe", contentHash, creatorAddress)
	if err != nil {
		return fmt.Errorf("failed to pack data for addRecipe: %w", err)
	}

	// Create the transaction
	// Ensure nonce management is robust, fetch latest pending nonce before sending
	pendingNonce, err := ethClient.PendingNonceAt(context.Background(), auth.From)
	if err != nil {
		return fmt.Errorf("failed to get pending nonce before sending tx: %w", err)
	}
	auth.Nonce = big.NewInt(int64(pendingNonce))
	// Re-fetch gas price for potentially better estimate
	gasPrice, err := ethClient.SuggestGasPrice(context.Background())
	if err == nil {
		auth.GasPrice = gasPrice
	}

	tx := types.NewTransaction(auth.Nonce.Uint64(), contractAddress, auth.Value, auth.GasLimit, auth.GasPrice, callData)

	// Sign the transaction
	chainID, err := ethClient.ChainID(context.Background())
	if err != nil {
		return fmt.Errorf("failed to get chain ID for signing: %w", err)
	}
	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(chainID), backendKey)
	if err != nil {
		return fmt.Errorf("failed to sign transaction: %w", err)
	}

	// Send the transaction
	err = ethClient.SendTransaction(context.Background(), signedTx)
	if err != nil {
		// Potentially update nonce if error is nonce-related for retries
		// auth.Nonce.Add(auth.Nonce, big.NewInt(1)) // Example: Increment nonce for next attempt
		return fmt.Errorf("failed to send transaction: %w", err)
	}

	log.Printf("Transaction sent successfully: %s", signedTx.Hash().Hex())

	// --- Optional: Wait for Transaction Receipt ---
	// Generally good practice to confirm the transaction was mined.
	// This blocks until the transaction is included in a block.
	receipt, err := bind.WaitMined(context.Background(), ethClient, signedTx)
	if err != nil {
		return fmt.Errorf("failed to get transaction receipt: %w", err)
	}
	if receipt.Status == 0 {
		// Transaction reverted
		log.Printf("Transaction reverted! Receipt: %+v", receipt)
		return fmt.Errorf("transaction reverted on chain (Tx: %s)", signedTx.Hash().Hex())
	}

	log.Printf("Transaction confirmed successfully! Block: %d, Tx Hash: %s", receipt.BlockNumber, signedTx.Hash().Hex())
	// --- End Optional Wait ---

	return nil
}
