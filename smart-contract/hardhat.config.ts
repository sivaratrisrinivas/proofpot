import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

// Ensure environment variables are loaded
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

if (!SEPOLIA_RPC_URL) {
  console.warn("SEPOLIA_RPC_URL not found in .env file. Deployment to Sepolia will not work.");
}
if (!PRIVATE_KEY) {
  console.warn("PRIVATE_KEY not found in .env file. Deployment to Sepolia will not work.");
}

const config: HardhatUserConfig = {
  solidity: "0.8.24", // Updated to match contract pragma
  networks: {
    hardhat: {
      // Configuration for the local Hardhat Network (optional)
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [], // Use array notation for accounts
      chainId: 11155111, // Sepolia chain ID
    },
  },
  // Optional: Add Etherscan config for verification later
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};

export default config;
