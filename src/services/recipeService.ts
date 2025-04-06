
import { Recipe } from '@/types/recipe';
import { v4 as uuidv4 } from 'uuid';

// Mock recipes data
const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Classic Margherita Pizza',
    description: 'A simple, delicious pizza with fresh ingredients',
    ingredients: [
      '1 pizza dough',
      '3/4 cup tomato sauce',
      '8 oz fresh mozzarella, sliced',
      '10 fresh basil leaves',
      '2 tbsp olive oil',
      'Salt and pepper to taste'
    ],
    steps: [
      'Preheat oven to 475°F (245°C)',
      'Roll out pizza dough on a floured surface',
      'Spread tomato sauce evenly over the dough',
      'Arrange mozzarella slices over the sauce',
      'Bake for 10-12 minutes until crust is golden',
      'Remove from oven and top with fresh basil leaves',
      'Drizzle with olive oil, season with salt and pepper',
      'Slice and serve immediately'
    ],
    creator: {
      name: 'Chef Mario',
      id: 'chef1'
    },
    imageUrl: 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?q=80&w=1920&auto=format&fit=crop',
    createdAt: '2023-10-15',
    tags: ['Italian', 'Pizza', 'Vegetarian'],
    preparationTime: 20,
    cookingTime: 12,
    servings: 4
  },
  {
    id: '2',
    title: 'Avocado Toast with Poached Egg',
    description: 'The perfect balanced breakfast to start your day',
    ingredients: [
      '2 slices whole grain bread',
      '1 ripe avocado',
      '2 eggs',
      '1 tbsp white vinegar',
      'Red pepper flakes',
      'Salt and black pepper',
      'Extra virgin olive oil'
    ],
    steps: [
      'Toast bread until golden and firm',
      'Cut avocado in half, remove pit, and scoop into a bowl',
      'Mash avocado with a fork and season with salt and pepper',
      'Bring a pot of water to a simmer, add vinegar',
      'Crack egg into a small bowl, then slide into simmering water',
      'Poach for 3-4 minutes, then remove with slotted spoon',
      'Spread mashed avocado on toast, top with poached egg',
      'Sprinkle with red pepper flakes and drizzle with olive oil'
    ],
    creator: {
      name: 'Breakfast Queen',
      id: 'chef2'
    },
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1920&auto=format&fit=crop',
    createdAt: '2023-11-05',
    tags: ['Breakfast', 'Healthy', 'Quick'],
    preparationTime: 10,
    cookingTime: 5,
    servings: 2
  },
  {
    id: '3',
    title: 'Thai Green Curry',
    description: 'A fragrant, spicy curry that\'s perfect for a weeknight dinner',
    ingredients: [
      '2 tbsp green curry paste',
      '1 can (14 oz) coconut milk',
      '1 lb chicken breast, sliced',
      '1 red bell pepper, sliced',
      '1 cup snap peas',
      '1 tbsp fish sauce',
      '1 tbsp brown sugar',
      'Fresh basil leaves',
      'Lime wedges for serving'
    ],
    steps: [
      'Heat a large pan or wok over medium-high heat',
      'Add 2 tbsp of coconut milk and the curry paste, stir until fragrant',
      'Add chicken and stir until no longer pink on the outside',
      'Pour in the rest of the coconut milk, bring to a simmer',
      'Add vegetables, fish sauce, and sugar, cook for 5-7 minutes',
      'Taste and adjust seasoning if needed',
      'Garnish with fresh basil leaves',
      'Serve hot with rice and lime wedges'
    ],
    creator: {
      name: 'Spice Master',
      id: 'chef3'
    },
    imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=1920&auto=format&fit=crop',
    createdAt: '2023-12-10',
    tags: ['Thai', 'Curry', 'Dinner'],
    preparationTime: 15,
    cookingTime: 20,
    servings: 4
  }
];

// Service functions
export const getRecipes = (): Promise<Recipe[]> => {
  return Promise.resolve(mockRecipes);
};

export const getRecipeById = (id: string): Promise<Recipe | undefined> => {
  const recipe = mockRecipes.find(recipe => recipe.id === id);
  return Promise.resolve(recipe);
};

export const addRecipe = (recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> => {
  const newRecipe: Recipe = {
    ...recipe,
    id: uuidv4(),
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  // In a real app, we would save to a database
  mockRecipes.push(newRecipe);
  
  return Promise.resolve(newRecipe);
};
