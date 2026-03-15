
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, ShieldCheck, AlertTriangle, Salad, Zap, Flame } from "lucide-react";
import Image from "next/image";

// In a real app, this would fetch from Firestore based on the ID
const getFoodData = (id: string) => {
  const foods: Record<string, any> = {
    "apple": {
      name: "Apple (Red Delicious)",
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3,
      sugar: 19,
      vitamins: ["Vitamin C", "Vitamin A", "Vitamin K"],
      minerals: ["Potassium", "Manganese", "Copper"],
      ingredients: ["Fresh Apple"],
      healthBenefits: ["High in fiber", "Supports heart health", "Good for weight loss"],
      risks: ["Pesticide residue (if not organic)", "Natural sugars"],
      image: "https://picsum.photos/seed/apple/800/400"
    },
    "avocado": {
      name: "Hass Avocado",
      calories: 160,
      protein: 2,
      carbs: 9,
      fat: 15,
      sugar: 0.7,
      vitamins: ["Vitamin K", "Folate", "Vitamin C", "Vitamin B5", "Vitamin B6", "Vitamin E"],
      minerals: ["Potassium", "Copper"],
      ingredients: ["Fresh Avocado"],
      healthBenefits: ["Healthy monounsaturated fats", "Extremely nutritious", "May help lower cholesterol"],
      risks: ["High calorie density", "Latex-fruit allergy potential"],
      image: "https://picsum.photos/seed/avocado/800/400"
    }
  };
  return foods[id] || foods["apple"];
};

export default function FoodDetailPage({ params }: { params: { id: string } }) {
  const food = getFoodData(params.id);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-8 shadow-xl">
            <Image 
              src={food.image} 
              alt={food.name} 
              fill 
              className="object-cover"
              data-ai-hint="fresh fruit"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-4xl font-bold font-headline">{food.name}</h1>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="bg-primary/20 text-white border-none backdrop-blur-md">
                  Fruit
                </Badge>
                <Badge variant="secondary" className="bg-secondary/20 text-white border-none backdrop-blur-md">
                  Fresh
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Main Nutritional Info */}
            <div className="md:col-span-2 space-y-8">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Nutritional Breakdown (per 100g)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <Flame className="h-6 w-6 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{food.calories}</div>
                      <div className="text-xs text-muted-foreground uppercase">Calories</div>
                    </div>
                    <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                      <Salad className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{food.protein}g</div>
                      <div className="text-xs text-muted-foreground uppercase">Protein</div>
                    </div>
                    <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/10">
                      <Zap className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{food.carbs}g</div>
                      <div className="text-xs text-muted-foreground uppercase">Carbs</div>
                    </div>
                    <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10">
                      <Zap className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{food.fat}g</div>
                      <div className="text-xs text-muted-foreground uppercase">Fat</div>
                    </div>
                  </div>

                  <Separator className="my-8" />

                  <div className="grid sm:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        Vitamins
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {food.vitamins.map((v: string) => (
                          <Badge key={v} variant="outline" className="font-normal">{v}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-secondary" />
                        Minerals
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {food.minerals.map((m: string) => (
                          <Badge key={m} variant="outline" className="font-normal">{m}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Health Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {food.healthBenefits.map((benefit: string) => (
                      <li key={benefit} className="flex items-start gap-2 text-muted-foreground">
                        <div className="h-5 w-5 flex items-center justify-center rounded-full bg-green-100 text-green-600 mt-0.5">
                          ✓
                        </div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Side Column */}
            <div className="space-y-6">
              <Card className="shadow-md border-destructive/20 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Risks & Allergens
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {food.risks.map((risk: string) => (
                      <li key={risk} className="text-sm text-destructive/80">• {risk}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Ingredients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">
                    {food.ingredients.join(", ")}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
