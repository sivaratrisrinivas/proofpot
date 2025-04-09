import { expect } from "chai";
import { ethers } from "hardhat";
// import { time } from "@nomicfoundation/hardhat-network-helpers"; // Not explicitly used for timestamp comparison here
import { RecipeRegistry } from "../typechain-types"; // Adjust path if needed
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";


describe("RecipeRegistry", function () {
    let recipeRegistry: RecipeRegistry;
    let owner: HardhatEthersSigner; // Contract deployer/owner
    let addr1: HardhatEthersSigner; // Represents a user/creator
    let nonOwner: HardhatEthersSigner; // Another account
    let recipeHash: string;

    beforeEach(async function () {
        // Get signers
        [owner, addr1, nonOwner] = await ethers.getSigners();

        // Deploy a fresh contract before each test, passing the owner
        const RecipeRegistryFactory = await ethers.getContractFactory("RecipeRegistry", owner);
        // Pass owner address to constructor
        const deployedContract = await RecipeRegistryFactory.deploy(owner.address);
        recipeRegistry = await deployedContract.waitForDeployment() as RecipeRegistry;

        // Generate a sample hash for testing
        recipeHash = ethers.keccak256(ethers.toUtf8Bytes("Test Recipe Content"));
    });

    describe("addRecipe", function () {
        it("Should allow the owner to add a new recipe hash for a creator", async function () {
            // Owner calls addRecipe, passing addr1 as the creator
            await expect(recipeRegistry.addRecipe(recipeHash, addr1.address))
                .to.not.be.reverted;
        });

        it("Should store the correct owner for the recipe hash", async function () {
            await recipeRegistry.addRecipe(recipeHash, addr1.address);
            // Check that the stored owner is the creator (addr1), not the caller (owner)
            expect(await recipeRegistry.recipeOwners(recipeHash)).to.equal(addr1.address);
        });

        it("Should store a timestamp for the recipe hash", async function () {
            const tx = await recipeRegistry.addRecipe(recipeHash, addr1.address);
            const receipt = await tx.wait();
            const block = await ethers.provider.getBlock(receipt!.blockNumber);
            const storedTimestamp = await recipeRegistry.recipeTimestamps(recipeHash);

            expect(storedTimestamp).to.equal(block!.timestamp);
            expect(storedTimestamp).to.be.gt(0); // Ensure timestamp is greater than 0
        });

        it("Should emit a RecipeAdded event on successful addition", async function () {
            const tx = await recipeRegistry.addRecipe(recipeHash, addr1.address);
            const receipt = await tx.wait();
            const block = await ethers.provider.getBlock(receipt!.blockNumber);
            const expectedTimestamp = block!.timestamp;

            await expect(tx)
                .to.emit(recipeRegistry, "RecipeAdded")
                // Check emitted creator is addr1
                .withArgs(recipeHash, addr1.address, expectedTimestamp);
        });

        it("Should fail if the recipe hash already exists", async function () {
            // Add the hash first
            await recipeRegistry.addRecipe(recipeHash, addr1.address);

            // Try adding the same hash again (e.g., with a different creator)
            const anotherCreator = nonOwner.address;
            await expect(recipeRegistry.addRecipe(recipeHash, anotherCreator))
                .to.be.revertedWith("Recipe hash already exists");
        });

        it("Should fail if the owner tries to add the recipe hash again with the same creator", async function () {
            // Add the hash first
            await recipeRegistry.addRecipe(recipeHash, addr1.address);

            // Try adding the same hash again with the same owner
            await expect(recipeRegistry.addRecipe(recipeHash, addr1.address))
                .to.be.revertedWith("Recipe hash already exists");
        });

        it("Should fail if called by a non-owner", async function () {
            // Attempt to call addRecipe from nonOwner account
            const registryAsNonOwner = recipeRegistry.connect(nonOwner);
            await expect(registryAsNonOwner.addRecipe(recipeHash, addr1.address))
                .to.be.revertedWithCustomError(recipeRegistry, "OwnableUnauthorizedAccount"); // Use custom error for Ownable v5+
        });

        it("Should fail if the creator address is the zero address", async function () {
            const zeroAddress = ethers.ZeroAddress;
            await expect(recipeRegistry.addRecipe(recipeHash, zeroAddress))
                .to.be.revertedWith("Creator address cannot be zero");
        });
    });
}); 