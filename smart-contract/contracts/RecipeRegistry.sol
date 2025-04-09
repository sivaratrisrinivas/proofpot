// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Import Ownable from OpenZeppelin
import "@openzeppelin/contracts/access/Ownable.sol";

// This contract stores recipe content hashes and their creators
contract RecipeRegistry is Ownable {

    // Mapping from recipe content hash (bytes32) to the creator's address
    mapping(bytes32 => address) public recipeOwners;

    // Mapping from recipe content hash to the block timestamp it was added
    mapping(bytes32 => uint256) public recipeTimestamps;

    // Event emitted when a new recipe is added
    event RecipeAdded(
        bytes32 indexed recipeHash,
        address indexed creator,
        uint256 timestamp
    );

    // Function for the backend (owner) to add a new recipe hash on behalf of a creator
    // Checks if the hash already exists
    // Stores the provided creator address as the owner
    // Stores the current block timestamp
    // Emits the RecipeAdded event
    function addRecipe(bytes32 _recipeHash, address _creator) public onlyOwner {
        require(
            recipeOwners[_recipeHash] == address(0),
            "Recipe hash already exists"
        );
        require(_creator != address(0), "Creator address cannot be zero"); // Add check for valid creator
        recipeOwners[_recipeHash] = _creator; // Store the provided creator's address
        recipeTimestamps[_recipeHash] = block.timestamp;
        emit RecipeAdded(_recipeHash, _creator, block.timestamp);
    }

    // Constructor to set the initial owner (deployer)
    constructor(address initialOwner) Ownable(initialOwner) {
        // The deployer address is automatically set as the owner by Ownable constructor
    }
} 