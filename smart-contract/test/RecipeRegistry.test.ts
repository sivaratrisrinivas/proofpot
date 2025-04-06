import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { RecipeRegistry } from "../typechain-types"; // Adjust path if needed
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";


describe("RecipeRegistry", function () {
    let recipeRegistry: RecipeRegistry;
    let owner: HardhatEthersSigner;
    let addr1: HardhatEthersSigner;
    let recipeHash: string;

    beforeEach(async function () {
        // Get signers
        [owner, addr1] = await ethers.getSigners();

        // Deploy a fresh contract before each test
        const RecipeRegistryFactory = await ethers.getContractFactory("RecipeRegistry", owner);
        const deployedContract = await RecipeRegistryFactory.deploy();
        recipeRegistry = await deployedContract.waitForDeployment() as RecipeRegistry;

        // Generate a sample hash for testing
        recipeHash = ethers.keccak256(ethers.toUtf8Bytes("Test Recipe Content"));
    });

    describe("addRecipe", function () {
        it("Should add a new recipe hash successfully", async function () {
            await expect(recipeRegistry.addRecipe(recipeHash))
                .to.not.be.reverted;
        });

        it("Should store the correct owner for the recipe hash", async function () {
            await recipeRegistry.addRecipe(recipeHash);
            expect(await recipeRegistry.recipeOwners(recipeHash)).to.equal(owner.address);
        });

        it("Should store a timestamp for the recipe hash", async function () {
            const tx = await recipeRegistry.addRecipe(recipeHash);
            const receipt = await tx.wait();
            const block = await ethers.provider.getBlock(receipt!.blockNumber);
            const storedTimestamp = await recipeRegistry.recipeTimestamps(recipeHash);

            expect(storedTimestamp).to.equal(block!.timestamp);
            expect(storedTimestamp).to.be.gt(0); // Ensure timestamp is greater than 0
        });

        it("Should emit a RecipeAdded event on successful addition", async function () {
            const tx = await recipeRegistry.addRecipe(recipeHash);
            const receipt = await tx.wait();
            const block = await ethers.provider.getBlock(receipt!.blockNumber);
            const expectedTimestamp = block!.timestamp;

            await expect(tx)
                .to.emit(recipeRegistry, "RecipeAdded")
                .withArgs(recipeHash, owner.address, expectedTimestamp);
        });

        it("Should fail if the recipe hash already exists", async function () {
            // Add the hash first
            await recipeRegistry.addRecipe(recipeHash);

            // Try adding the same hash again (e.g., with a different account)
            const registryAsAddr1 = recipeRegistry.connect(addr1);
            await expect(registryAsAddr1.addRecipe(recipeHash))
                .to.be.revertedWith("Recipe hash already exists");
        });

        it("Should fail if the same owner tries to add the recipe hash again", async function () {
            // Add the hash first
            await recipeRegistry.addRecipe(recipeHash);

            // Try adding the same hash again with the same owner
            await expect(recipeRegistry.addRecipe(recipeHash))
                .to.be.revertedWith("Recipe hash already exists");
        });
    });
}); 