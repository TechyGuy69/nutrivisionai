
"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateRecipeFromIngredients, GenerateRecipeFromIngredientsOutput } from "@/ai/flows/generate-recipe-from-ingredients";
import { ChefHat, Plus, X, Loader2, Clock, Users, ListChecks, Info } from "lucide-react";

const dietOptions = ["Vegetarian", "Vegan", "Keto", "Low-Carb", "Gluten-Free", "High-Protein"];

export default function RecipesPage() {
  const [ingredient, setIngredient] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipe, setRecipe] = useState<GenerateRecipeFromIngredientsOutput | null>(null);

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
    try {
      const result = await generateRecipeFromIngredients({
        ingredients,
        dietaryPreferences: selectedDiets
      });
      setRecipe(result);
    } catch (error) {
      console.error("Error generating recipe", error);
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
            <p className="text-muted-foreground max-w-xl mx-auto">
              Tell us what's in your pantry, and we'll generate a personalized, healthy recipe just for you.
            </p>
          </header>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Input Panel */}
            <div className="space-y-6 lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What ingredients do you have?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={addIngredient} className="flex gap-2">
                    <Input 
                      value={ingredient}
                      onChange={(e) => setIngredient(e.target.value)}
                      placeholder="Add an ingredient..." 
                    />
                    <Button type="submit" size="icon" variant="secondary">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </form>

                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ing) => (
                      <Badge key={ing} variant="secondary" className="pl-3 pr-1 py-1 gap-1">
                        {ing}
                        <button onClick={() => removeIngredient(ing)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {ingredients.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">No ingredients added yet.</p>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-3">Dietary Preferences</h4>
                    <div className="flex flex-wrap gap-2">
                      {dietOptions.map((diet) => (
                        <button
                          key={diet}
                          onClick={() => toggleDiet(diet)}
                          className={`text-xs px-3 py-1.5 rounded-full transition-colors border ${
                            selectedDiets.includes(diet) 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "bg-background hover:bg-muted border-input"
                          }`}
                        >
                          {diet}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 text-lg font-semibold" 
                    disabled={ingredients.length === 0 || isGenerating}
                    onClick={generateRecipe}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <ChefHat className="mr-2 h-5 w-5" />
                        Craft Recipe
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2">
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center p-20 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20">
                  <div className="relative mb-6">
                    <ChefHat className="h-16 w-16 text-primary animate-bounce" />
                    <div className="absolute -top-1 -right-1">
                      <Loader2 className="h-6 w-6 text-secondary animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Creating your masterpiece</h3>
                  <p className="text-muted-foreground text-center">
                    Our AI chef is combining your ingredients into a delicious healthy meal...
                  </p>
                </div>
              ) : recipe ? (
                <Card className="animate-in fade-in zoom-in duration-500 overflow-hidden shadow-xl border-none">
                  <div className="bg-primary px-8 py-10 text-primary-foreground">
                    <h2 className="text-3xl font-bold mb-4 font-headline">{recipe.recipeName}</h2>
                    <div className="flex flex-wrap gap-6 opacity-90">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <span>Prep: {recipe.prepTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <span>Cook: {recipe.cookTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <span>Servings: {recipe.servings}</span>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-5 gap-10">
                      <div className="md:col-span-2">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <ListChecks className="h-5 w-5 text-primary" />
                          Ingredients
                        </h3>
                        <ul className="space-y-2">
                          {recipe.ingredientsList.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                              <span className="h-5 w-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-xs font-bold mt-0.5">
                                •
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="md:col-span-3">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <Info className="h-5 w-5 text-primary" />
                          Instructions
                        </h3>
                        <div className="space-y-6">
                          {recipe.instructions.map((step, i) => (
                            <div key={i} className="flex gap-4">
                              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                                {i + 1}
                              </span>
                              <p className="text-muted-foreground leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {recipe.notes && (
                      <div className="mt-10 p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                        <h4 className="font-bold text-secondary mb-2">Chef's Tips</h4>
                        <ul className="list-disc list-inside text-sm text-secondary/80 space-y-1">
                          {recipe.notes.map((note, i) => (
                            <li key={i}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-20 bg-muted/20 border-2 border-dashed rounded-2xl">
                  <ChefHat className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                  <h3 className="text-xl font-medium text-muted-foreground">Select ingredients to start cooking</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
