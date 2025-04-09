import { ethers } from "hardhat";

async function main() {
    // Get the deployer's address
    const [deployer] = await ethers.getSigners();
    console.log(
        "Deploying RecipeRegistry contract with the account:",
        deployer.address
    );

    console.log("Deploying RecipeRegistry contract...");

    // Get the contract factory
    const RecipeRegistry = await ethers.getContractFactory("RecipeRegistry");

    // Deploy the contract, passing the deployer's address as the initial owner
    const recipeRegistry = await RecipeRegistry.deploy(deployer.address);

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