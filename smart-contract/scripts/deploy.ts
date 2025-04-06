import { ethers } from "hardhat";

async function main() {
    console.log("Deploying RecipeRegistry contract...");

    // Get the contract factory
    const RecipeRegistry = await ethers.getContractFactory("RecipeRegistry");

    // Deploy the contract
    const recipeRegistry = await RecipeRegistry.deploy();

    // Wait for the deployment transaction to be mined
    await recipeRegistry.waitForDeployment();

    // Get the deployed contract address
    const deployedAddress = await recipeRegistry.getAddress();

    console.log(`RecipeRegistry deployed to: ${deployedAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 