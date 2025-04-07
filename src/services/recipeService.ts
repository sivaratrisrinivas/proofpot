import { Recipe } from '@/types/recipe';
// import { v4 as uuidv4 } from 'uuid'; // No longer needed for mock

// Keep mock data for now if getRecipes/getRecipeById still use it
// Can be removed later when backend endpoints for GET are implemented
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

// --- Define the structure for the data sent TO the backend API --- 
interface RecipeApiPayload {
  title: string;
  description: string; // Assuming description will be handled by backend
  ingredients: string[];
  steps: string[];
  creatorAddress: string; // Matches Go struct json tag and frontend payload
  contentHash: string;    // Matches Go struct json tag and frontend payload
  // Add other optional fields if backend API supports them & they are in frontend payload
  // e.g., imageUrl?: string; tags?: string[]; preparationTime?: number; etc.
}

// --- Define the expected structure of the data received FROM the backend API --- 
// Assuming the backend returns the full Recipe object after creation, including DB-generated ID
interface RecipeApiResponse extends Recipe {
  // id should be populated by backend
}

// --- Service functions --- 

// getRecipes and getRecipeById still use mock data for now
export const getRecipes = (): Promise<Recipe[]> => {
  return Promise.resolve(mockRecipes);
};

export const getRecipeById = (id: string): Promise<Recipe | undefined> => {
  const recipe = mockRecipes.find(recipe => recipe.id === id);
  return Promise.resolve(recipe);
};

// --- Updated addRecipe function --- 
export const addRecipe = async (payload: RecipeApiPayload): Promise<RecipeApiResponse> => {
  // Define your backend API endpoint
  // If your backend runs on a different port (e.g., 8080) and you haven't set up a proxy in Vite,
  // you might need the full URL: const API_ENDPOINT = 'http://localhost:8080/api/recipes';
  const API_ENDPOINT = '/api/recipes';

  console.log("Sending recipe payload to backend:", payload); // Log payload for debugging

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Attempt to get more specific error message from backend response body
      let errorMsg = `HTTP error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        // Use a more specific error field if backend provides one, e.g., errorData.error
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        // Ignore if response body isn't JSON
      }
      console.error("Backend responded with error:", errorMsg);
      throw new Error(errorMsg); // Throw error to be caught by the calling component
    }

    // Assuming the backend returns the newly created recipe object (including id, createdAt)
    const createdRecipe: RecipeApiResponse = await response.json();
    console.log("Received created recipe from backend:", createdRecipe);
    return createdRecipe;

  } catch (error) {
    console.error("Error calling addRecipe API:", error);
    // Re-throw the error so the component can display a message
    // Ensure the error object is an instance of Error
    if (error instanceof Error) {
      throw error;
    }
    // If it's not an Error instance, wrap it
    throw new Error(String(error) || "An unknown error occurred while adding the recipe.");
  }
};
