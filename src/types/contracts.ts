
export interface RecipeContract {
  mintRecipe: (title: string, description: string, creator: string) => Promise<{ tokenId: string, txHash: string }>;
  getRecipeOwner: (tokenId: string) => Promise<string>;
  getRecipesByOwner: (ownerAddress: string) => Promise<string[]>;
  transferRecipe: (tokenId: string, toAddress: string) => Promise<{ success: boolean, txHash: string }>;
}

export interface ContractTransaction {
  hash: string;
  wait: () => Promise<{ status: number }>;
}

export interface RecipeToken {
  tokenId: string;
  title: string;
  description: string;
  creator: string;
  owner: string;
  createdAt: number;
}
