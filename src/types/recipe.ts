export interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string;
  steps: string;
  creatorAddress: string;
  contentHash: string;
  createdAt: string;
  tags: string[];
  preparationTime?: number;
  cookingTime?: number;
  servings?: number;
  creator?: {
    name: string;
    id: string;
  };
  imageUrl?: string;
}

export interface RecipeListItem {
  id: number;
  title: string;
  creatorAddress: string;
  contentHash: string;
  createdAt: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
}
