import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipeByHash } from '@/services/recipeService';
import { Recipe } from '@/types/recipe';
import { Clock, Users, ChevronLeft, ArrowLeft, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb';

const RecipeDetailPage = () => {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecipe = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!hash) {
          console.error("Recipe hash parameter missing from URL");
          setError("Recipe hash is missing in the URL.");
          setIsLoading(false);
          return;
        }

        const data = await getRecipeByHash(hash);

        if (!data) {
          toast({
            title: "Recipe not found",
            description: "The recipe you're looking for doesn't exist or has been removed.",
            variant: "destructive"
          });
          setError("Recipe not found.");
          setIsLoading(false);
          return;
        }

        setRecipe(data);
      } catch (error) {
        console.error('Failed to load recipe:', error);
        const errorMsg = error instanceof Error ? error.message : "An unknown error occurred fetching recipe details.";
        setError(errorMsg);
        toast({
          title: "Error loading recipe",
          description: errorMsg,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipe();
  }, [hash, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="animate-pulse max-w-4xl mx-auto">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded mb-8"></div>
          <div className="h-4 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded mb-2 w-5/6"></div>
          <div className="h-4 bg-muted rounded mb-8 w-4/6"></div>
          <div className="h-6 bg-muted rounded mb-4 w-1/4"></div>
          <div className="space-y-2 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-6 bg-muted rounded mb-4 w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 text-center text-destructive">
        <h2 className="text-xl font-medium mb-2">Error Loading Recipe</h2>
        <p>{error}</p>
        <Button onClick={() => navigate('/')} className="mt-4">Go Home</Button>
      </div>
    );
  }

  if (!recipe) {
    // This case should ideally be covered by isLoading or error states now
    // but keep as a fallback
    return null;
  }

  const getAvatarFallback = (address: string) => {
    return address ? `${address.substring(0, 2)}..${address.substring(address.length - 2)}` : '?';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{recipe.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button
        variant="ghost"
        className="mb-4 p-0 hover:bg-transparent"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to recipes
      </Button>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>

          <div className="flex flex-wrap gap-2 mb-6">
            {recipe.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          {recipe.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-auto object-cover max-h-[400px]"
              />
            </div>
          )}

          <div className="flex items-center mb-6">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback>{getAvatarFallback(recipe.creatorAddress)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium break-all">Recipe by {recipe.creatorAddress}</p>
              <p className="text-sm text-muted-foreground">Published on {new Date(recipe.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <p className="text-lg mb-6">{recipe.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {recipe.preparationTime && (
              <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center">
                <p className="text-sm text-muted-foreground mb-1">Prep Time</p>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{recipe.preparationTime} min</span>
                </div>
              </div>
            )}

            {recipe.cookingTime && (
              <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center">
                <p className="text-sm text-muted-foreground mb-1">Cook Time</p>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{recipe.cookingTime} min</span>
                </div>
              </div>
            )}

            {recipe.servings && (
              <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center">
                <p className="text-sm text-muted-foreground mb-1">Servings</p>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{recipe.servings}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-5 h-5 bg-primary/10 rounded-full mr-3 flex-shrink-0 mt-0.5"></span>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="space-y-4">
            {recipe.steps.map((step, index) => (
              <li key={index} className="flex">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium mr-4 flex-shrink-0">
                  {index + 1}
                </span>
                <p className="pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;
