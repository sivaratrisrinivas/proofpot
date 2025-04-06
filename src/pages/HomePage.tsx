
import { useState, useEffect } from 'react';
import { getRecipes } from '@/services/recipeService';
import { Recipe } from '@/types/recipe';
import RecipeCard from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const data = await getRecipes();
        setRecipes(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load recipes:', error);
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, []);

  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">ProofPot</h1>
          <p className="text-muted-foreground">Discover and share amazing recipes</p>
        </div>
        
        <div className="flex w-full lg:w-auto gap-2">
          <div className="relative flex-grow lg:flex-grow-0 lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => navigate('/create')}>
            Create Recipe
          </Button>
        </div>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No recipes found</h2>
          <p className="text-muted-foreground mb-4">Try adjusting your search terms or create a new recipe</p>
          <Button onClick={() => navigate('/create')}>Create Recipe</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
