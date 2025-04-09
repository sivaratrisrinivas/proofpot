import { Recipe, RecipeListItem, RecipeCreationApiResponse } from '@/types/recipe';
// import { v4 as uuidv4 } from 'uuid'; // No longer needed for mock

// Base URL for the API - Use environment variable
// Fallback to /api for local development if the env var is not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Keep mock data for now if getRecipes/getRecipeById still use it
// Can be removed later when backend endpoints for GET are implemented
/*
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
*/

// Define structure received from the component
interface RecipeComponentPayload {
  title: string;
  description: string;
  ingredients: string[]; // Array from component
  steps: string[];       // Array from component
  creatorAddress: string;
  contentHash: string;
  // Include other optional fields from component form state if needed
  imageUrl?: string;
  // tags?: string[];
  // etc.
}

// Define structure sent TO the backend (matching Go struct)
interface RecipeApiPayload {
  title: string;
  // description: string; // Backend doesn't use description from creation payload yet
  ingredients: string; // Joined string for backend
  steps: string;       // Joined string for backend
  creatorAddress: string;
  contentHash: string;
  imageUrl?: string;   // Added imageUrl field (optional)
  // Omit other fields not present in the Go `models.Recipe` struct
}

// --- Define the expected structure of the data received FROM the backend API --- 
// Assuming the backend returns the full Recipe object after creation, including DB-generated ID
interface RecipeApiResponse extends Recipe {
  // id should be populated by backend
}

// Helper for full Recipe transformation (for getRecipeByHash, addRecipe response)
const transformBackendRecipeToRecipe = (backendRecipe: any): Recipe => {
  // Ensure required fields always have a default, even if backend data is weird
  return {
    id: backendRecipe?.id ?? 0, // Use nullish coalescing for defaults
    title: backendRecipe?.title ?? '',
    creatorAddress: backendRecipe?.creatorAddress ?? '',
    contentHash: backendRecipe?.contentHash ?? '',
    createdAt: backendRecipe?.createdAt ?? '',
    // Ensure ingredients/steps are always arrays, split non-empty strings
    ingredients: typeof backendRecipe?.ingredients === 'string' && backendRecipe.ingredients ? backendRecipe.ingredients.split('\n') : [],
    steps: typeof backendRecipe?.steps === 'string' && backendRecipe.steps ? backendRecipe.steps.split('\n') : [],
    // Ensure optional fields that should be arrays are always arrays
    tags: Array.isArray(backendRecipe?.tags) ? backendRecipe.tags : [], // Handle if backend sends null/undefined/non-array
    // Optional fields default to undefined if not present
    description: backendRecipe?.description,
    imageUrl: backendRecipe?.imageUrl,
    preparationTime: backendRecipe?.preparationTime,
    cookingTime: backendRecipe?.cookingTime,
    servings: backendRecipe?.servings,
  };
};

// Helper for RecipeListItem transformation (for getRecipes)
const transformBackendRecipeToListItem = (backendListItem: any): RecipeListItem => {
  // Ensure required fields always have a default
  return {
    id: backendListItem?.id ?? 0,
    title: backendListItem?.title ?? '',
    creatorAddress: backendListItem?.creatorAddress ?? '',
    contentHash: backendListItem?.contentHash ?? '',
    createdAt: backendListItem?.createdAt ?? '',
    // Optional fields default to undefined
    description: backendListItem?.description,
    imageUrl: backendListItem?.imageUrl,
    tags: Array.isArray(backendListItem?.tags) ? backendListItem.tags : [], // Ensure tags is always array
  };
};

// --- Service functions --- 

// Updated getRecipes to fetch from backend and return RecipeListItem[]
export const getRecipes = async (): Promise<RecipeListItem[]> => {
  // Use the base URL defined above
  const response = await fetch(`${API_BASE_URL}/recipes`);
  if (!response.ok) {
    console.error('Fetch error:', response.status, await response.text()); // Log error details
    throw new Error('Failed to fetch recipes');
  }
  const data = await response.json();
  // Transform each item using the specific list item transformer
  return data.map(transformBackendRecipeToListItem);
};

// New function to fetch by hash, returns full Recipe
export const getRecipeByHash = async (hash: string): Promise<Recipe | null> => {
  const normalizedHash = hash.startsWith('0x') ? hash : `0x${hash}`;
  console.log(`[RecipeService] Fetching recipe by hash: ${normalizedHash} from ${API_BASE_URL}/recipes/${normalizedHash}`); // Log hash being fetched
  try {
    // Use the base URL defined above
    const response = await fetch(`${API_BASE_URL}/recipes/${normalizedHash}`);
    console.log(`[RecipeService] Fetch response status for ${normalizedHash}: ${response.status}`); // Log status

    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[RecipeService] Error fetching recipe ${normalizedHash}. Status: ${response.status}. Body: ${errorText}`);
      throw new Error(`Failed to fetch recipe with hash ${hash}: ${response.statusText}`);
    }
    const backendRecipe = await response.json();
    console.log(`[RecipeService] Received backend data for ${normalizedHash}:`, backendRecipe); // Log received data
    return transformBackendRecipeToRecipe(backendRecipe);
  } catch (error) {
    console.error(`[RecipeService] Network or other error fetching recipe ${normalizedHash}:`, error);
    throw error;
  }
};

// Updated addRecipe, returns the explicit creation response structure
export const addRecipe = async (componentPayload: RecipeComponentPayload): Promise<RecipeCreationApiResponse> => {
  // Use the base URL defined above
  const API_ENDPOINT = `${API_BASE_URL}/recipes`;

  // Ensure imageUrl is included if present in componentPayload
  const apiPayload: RecipeApiPayload = {
    title: componentPayload.title,
    // description: '', // Removed description as backend doesn't use it yet
    ingredients: componentPayload.ingredients.join('\n'),
    steps: componentPayload.steps.join('\n'),
    creatorAddress: componentPayload.creatorAddress,
    contentHash: componentPayload.contentHash,
    imageUrl: componentPayload.imageUrl, // Add the imageUrl from the component payload
  };
  console.log(`[RecipeService] Sending POST to ${API_ENDPOINT} with payload:`, apiPayload);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    });

    // Log response status regardless of ok status
    console.log(`[RecipeService] POST response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[RecipeService] Error creating recipe. Status: ${response.status}. Body: ${errorText}`);
      // Throw a more specific error message if possible
      let errorMessage = `Failed to create recipe: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch (e) { /* Ignore if response body is not JSON */ }
      throw new Error(errorMessage);
    }

    const createdRecipeResponse = await response.json();
    console.log("[RecipeService] Received created recipe from backend:", createdRecipeResponse);

    // Backend returns specific fields, ensure they match RecipeCreationApiResponse
    if (!createdRecipeResponse || typeof createdRecipeResponse.id === 'undefined' || typeof createdRecipeResponse.contentHash === 'undefined') {
      console.error("[RecipeService] Unexpected response format from backend after creation:", createdRecipeResponse);
      throw new Error("Unexpected response format after recipe creation.");
    }

    return {
      id: createdRecipeResponse.id,
      contentHash: createdRecipeResponse.contentHash,
      // Add other fields if the backend returns them and they are part of RecipeCreationApiResponse
    };

  } catch (error) {
    console.error('[RecipeService] Network or other error creating recipe:', error);
    throw error; // Re-throw to be handled by the component
  }
};
