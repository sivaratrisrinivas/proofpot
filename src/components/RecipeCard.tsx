
import { Recipe } from '@/types/recipe';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  return (
    <Link to={`/recipe/${recipe.id}`}>
      <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-300">
        <div className="relative h-48 overflow-hidden">
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">No image</p>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {recipe.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <h3 className="text-lg font-semibold line-clamp-2 mb-2">{recipe.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {recipe.description}
          </p>

          <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{(recipe.preparationTime || 0) + (recipe.cookingTime || 0)} min</span>
            </div>

            {recipe.servings && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{recipe.servings}</span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t text-xs">
            <p>By {recipe.creator.name}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default RecipeCard;
