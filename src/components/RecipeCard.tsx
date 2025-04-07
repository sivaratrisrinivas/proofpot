import { RecipeListItem } from '@/types/recipe';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface RecipeCardProps {
  recipe: RecipeListItem;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  return (
    <Link to={`/recipes/${recipe.contentHash}`}>
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

        <div className="p-4 flex flex-col h-full">
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {recipe.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <h3 className="text-lg font-semibold line-clamp-2 mb-2">{recipe.title}</h3>

          {recipe.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-grow">
              {recipe.description}
            </p>
          )}

          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            <p className="truncate">By {recipe.creatorAddress}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default RecipeCard;
