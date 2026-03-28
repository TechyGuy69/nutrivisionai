"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateRecipeFromIngredients, type GenerateRecipeFromIngredientsOutput } from "@/ai/flows/generate-recipe-from-ingredients";
import { ChefHat, Plus, X, Loader2, Clock, Users, ListChecks, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";

export const maxDuration = 60;

const dietOptions = ["Vegetarian", "Vegan", "Keto", "Low-Carb", "Gluten-Free", "High-Protein"];

export default function RecipesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [ingredient, setIngredient] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipe, setRecipe] = useState<GenerateRecipeFromIngredientsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const addIngredient = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (ingredient.trim() && !ingredients.includes(ingredient.trim())) {
      setIngredients([...ingredients, ingredient.trim()]);
      setIngredient("");
    }
  };

  const removeIngredient = (ing: string) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const toggleDiet = (diet: string) => {
    setSelectedDiets(prev => 
      prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]
    );
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) return;
    setIsGenerating(true);
    setRecipe(null);
    setError(null);
    try {
      const result = await generateRecipeFromIngredients({
        ingredients,
        dietaryPreferences: selectedDiets
      });
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setRecipe(result.data);
        if (user && db) {
          addDoc(collection(db, 'users', user.uid, 'activities'), {
            type: 'recipe',
            title: result.data.recipeName,
            timestamp: new Date().toISOString(),
            details: result.data
          }).catch(err => console.error("Failed to log activity", err));
        }
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-3xl font-bold font-headline mb-4">AI Recipe Crafter</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Turn pantry items into healthy meals with Gemini 2.5 Flash.</p>
          </header>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <Card>
                <CardHeader><CardTitle className="text-lg">Ingredients</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={addIngredient} className="flex gap-2">
                    <Input value={ingredient} onChange={(e) => setIngredient(e.target.value)} placeholder="e.g. Eggs..." />
                    <Button type="submit" size="icon" variant="secondary"><Plus className="h-4 w-4" /></Button>
                  </form>
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ing) => (
                      <Badge key={ing} variant="secondary" className="pl-3 pr-1 py-1 gap-1">
                        {ing}<button onClick={() => removeIngredient(ing)}><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full" disabled={ingredients.length === 0 || isGenerating} onClick={generateRecipe}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChefHat className="mr-2 h-4 w-4" />}
                    Craft Recipe
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center p-20 bg-primary/5 rounded-2xl border-2 border-dashed">
                  <ChefHat className="h-16 w-16 text-primary animate-bounce" /><h3 className="text-2xl font-bold mt-4">Creating...</h3>
                </div>
              ) : recipe ? (
                <Card className="animate-in fade-in zoom-in overflow-hidden shadow-xl">
                  <div className="bg-primary p-8 text-primary-foreground">
                    <h2 className="text-3xl font-bold font-headline">{recipe.recipeName}</h2>
                    <div className="flex gap-6 mt-4"><Clock className="h-5 w-5" /> {recipe.prepTime} <Users className="h-5 w-5" /> {recipe.servings}</div>
                  </div>
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold mb-4">Instructions</h3>
                    <div className="space-y-4">
                      {recipe.instructions.map((step, i) => (
                        <div key={i} className="flex gap-4"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">{i + 1}</span><p className="text-sm">{step}</p></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-20 bg-muted/20 border-2 border-dashed rounded-2xl">
                  <ChefHat className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                  <p className="text-muted-foreground">Add ingredients to start</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}