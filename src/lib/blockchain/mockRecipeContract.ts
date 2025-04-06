
import { RecipeContract, RecipeToken, ContractTransaction } from "@/types/contracts";
import { v4 as uuidv4 } from "uuid";

// Mock storage for recipe tokens
const recipeTokens: RecipeToken[] = [];

// Simple mock implementation of a recipe NFT contract
export class MockRecipeContract implements RecipeContract {
  async mintRecipe(title: string, description: string, creator: string): Promise<{ tokenId: string, txHash: string }> {
    // Generate a random token ID and transaction hash
    const tokenId = uuidv4();
    const txHash = "0x" + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)).join('');
    
    // Store the new token
    recipeTokens.push({
      tokenId,
      title,
      description,
      creator,
      owner: creator,
      createdAt: Date.now()
    });
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { tokenId, txHash };
  }

  async getRecipeOwner(tokenId: string): Promise<string> {
    const token = recipeTokens.find(t => t.tokenId === tokenId);
    if (!token) {
      throw new Error("Token not found");
    }
    return token.owner;
  }

  async getRecipesByOwner(ownerAddress: string): Promise<string[]> {
    return recipeTokens
      .filter(token => token.owner.toLowerCase() === ownerAddress.toLowerCase())
      .map(token => token.tokenId);
  }

  async transferRecipe(tokenId: string, toAddress: string): Promise<{ success: boolean, txHash: string }> {
    const token = recipeTokens.find(t => t.tokenId === tokenId);
    if (!token) {
      throw new Error("Token not found");
    }
    
    const txHash = "0x" + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)).join('');
    
    // Update the owner
    token.owner = toAddress;
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, txHash };
  }

  async getRecipeDetails(tokenId: string): Promise<RecipeToken | null> {
    const token = recipeTokens.find(t => t.tokenId === tokenId);
    return token || null;
  }
}
