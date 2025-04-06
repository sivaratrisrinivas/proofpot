
export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  creator: {
    name: string;
    id: string;
  };
  imageUrl?: string;
  createdAt: string;
  tags: string[];
  preparationTime?: number;
  cookingTime?: number;
  servings?: number;
}
