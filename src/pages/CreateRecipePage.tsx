
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addRecipe } from '@/services/recipeService';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { X, Plus, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb';

const CreateRecipePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    ingredients: [''],
    steps: [''],
    creatorName: '',
    imageUrl: '',
    tags: [''],
    preparationTime: '',
    cookingTime: '',
    servings: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (
    index: number,
    value: string,
    arrayName: 'ingredients' | 'steps' | 'tags'
  ) => {
    setForm((prev) => {
      const newArray = [...prev[arrayName]];
      newArray[index] = value;
      return { ...prev, [arrayName]: newArray };
    });
  };

  const handleAddItem = (arrayName: 'ingredients' | 'steps' | 'tags') => {
    setForm((prev) => {
      return { ...prev, [arrayName]: [...prev[arrayName], ''] };
    });
  };

  const handleRemoveItem = (index: number, arrayName: 'ingredients' | 'steps' | 'tags') => {
    if (form[arrayName].length <= 1) return;
    
    setForm((prev) => {
      const newArray = [...prev[arrayName]];
      newArray.splice(index, 1);
      return { ...prev, [arrayName]: newArray };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a title for your recipe",
        variant: "destructive"
      });
      return;
    }
    
    if (!form.creatorName.trim()) {
      toast({
        title: "Missing creator name",
        description: "Please enter your name",
        variant: "destructive"
      });
      return;
    }
    
    // Filter out empty strings from arrays
    const ingredients = form.ingredients.filter(i => i.trim());
    const steps = form.steps.filter(s => s.trim());
    const tags = form.tags.filter(t => t.trim());
    
    if (ingredients.length === 0) {
      toast({
        title: "Missing ingredients",
        description: "Please add at least one ingredient",
        variant: "destructive"
      });
      return;
    }
    
    if (steps.length === 0) {
      toast({
        title: "Missing steps",
        description: "Please add at least one instruction step",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data
      const recipeData: Omit<Recipe, 'id' | 'createdAt'> = {
        title: form.title,
        description: form.description,
        ingredients,
        steps,
        creator: {
          name: form.creatorName,
          id: 'user-' + Date.now() // In a real app, this would be a real user ID
        },
        imageUrl: form.imageUrl || undefined,
        tags: tags.length > 0 ? tags : ['Uncategorized'],
        preparationTime: form.preparationTime ? parseInt(form.preparationTime) : undefined,
        cookingTime: form.cookingTime ? parseInt(form.cookingTime) : undefined,
        servings: form.servings ? parseInt(form.servings) : undefined
      };
      
      const response = await addRecipe(recipeData);
      
      toast({
        title: "Recipe created",
        description: "Your recipe has been successfully created",
      });
      
      navigate(`/recipe/${response.id}`);
    } catch (error) {
      console.error('Error creating recipe:', error);
      toast({
        title: "Error",
        description: "There was a problem creating your recipe. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <BreadcrumbPage>Create Recipe</BreadcrumbPage>
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

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create a New Recipe</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Recipe Title</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Homemade Chocolate Chip Cookies"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Briefly describe your recipe"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              {form.imageUrl && (
                <div className="mt-2 relative w-32 h-32 overflow-hidden rounded border">
                  <img
                    src={form.imageUrl}
                    alt="Recipe preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/150?text=Invalid+URL";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div>
            <Label>Tags</Label>
            <div className="space-y-2">
              {form.tags.map((tag, index) => (
                <div key={`tag-${index}`} className="flex items-center gap-2">
                  <Input
                    value={tag}
                    onChange={(e) => handleArrayChange(index, e.target.value, 'tags')}
                    placeholder="e.g., Dessert, Italian, Vegetarian"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index, 'tags')}
                    disabled={form.tags.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddItem('tags')}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="preparationTime">Prep Time (minutes)</Label>
              <Input
                id="preparationTime"
                name="preparationTime"
                type="number"
                min="0"
                value={form.preparationTime}
                onChange={handleChange}
                placeholder="e.g., 15"
              />
            </div>
            
            <div>
              <Label htmlFor="cookingTime">Cook Time (minutes)</Label>
              <Input
                id="cookingTime"
                name="cookingTime"
                type="number"
                min="0"
                value={form.cookingTime}
                onChange={handleChange}
                placeholder="e.g., 25"
              />
            </div>
            
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                name="servings"
                type="number"
                min="1"
                value={form.servings}
                onChange={handleChange}
                placeholder="e.g., 4"
              />
            </div>
          </div>
          
          <div>
            <Label>Ingredients</Label>
            <div className="space-y-2">
              {form.ingredients.map((ingredient, index) => (
                <div key={`ingredient-${index}`} className="flex items-center gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => handleArrayChange(index, e.target.value, 'ingredients')}
                    placeholder={`Ingredient ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index, 'ingredients')}
                    disabled={form.ingredients.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddItem('ingredients')}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </div>
          </div>
          
          <div>
            <Label>Instructions</Label>
            <div className="space-y-2">
              {form.steps.map((step, index) => (
                <div key={`step-${index}`} className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <Textarea
                      value={step}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'steps')}
                      placeholder={`Step ${index + 1}`}
                      rows={2}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index, 'steps')}
                    disabled={form.steps.length <= 1}
                    className="flex-shrink-0 mt-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddItem('steps')}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="creatorName">Your Name</Label>
            <Input
              id="creatorName"
              name="creatorName"
              value={form.creatorName}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Recipe'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRecipePage;
