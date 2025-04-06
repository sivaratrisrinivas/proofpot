// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RecipeRegistry {
    mapping(bytes32 => address) public recipeOwners;
    mapping(bytes32 => uint256) public recipeTimestamps;

    event RecipeAdded(
        bytes32 indexed recipeHash,
        address indexed creator,
        uint256 timestamp
    );

    /**
     * @notice Adds a new recipe hash to the registry, linking it to the sender.
     * @dev Reverts if the hash already exists.
     * @param _recipeHash The SHA-256 hash of the recipe content.
     */
    function addRecipe(bytes32 _recipeHash) public {
        require(
            recipeOwners[_recipeHash] == address(0),
            "Recipe hash already exists"
        );

        address creator = msg.sender;
        uint256 timestamp = block.timestamp;

        recipeOwners[_recipeHash] = creator;
        recipeTimestamps[_recipeHash] = timestamp;

        emit RecipeAdded(_recipeHash, creator, timestamp);
    }
} 