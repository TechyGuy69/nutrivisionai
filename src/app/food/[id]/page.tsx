"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, ShieldCheck, AlertTriangle, Salad, Zap, Flame, Loader2, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getFoodDetails, type FoodItemInfo } from "@/ai/flows/food-search-flow";
import { useParams } from "next/navigation";

export default function FoodDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [food, setFood] = useState<FoodItemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFood() {
      if (!id) return;
      setIsLoading(true);
      try {
        const decodedId = decodeURIComponent(id);
        const data = await getFoodDetails(decodedId);
        setFood(data);
      } catch (error) {
        console.error("Error fetching food details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFood();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Food item not found</h1>
            <p className="text-muted-foreground mb-6">We couldn't retrieve information for this specific item.</p>
            <Link href="/search">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors py-2 px-4">
                Back to Explorer
              </Badge>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Link href="/search" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ChevronLeft className="h-4 w-4" />
            Back to Explorer
          </Link>

          {/* Header Section */}
          <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-8 shadow-xl">
            <Image 
              src={`https://picsum.photos/seed/${food.id}/800/400`} 
              alt={food.name} 
              fill 
              className="object-cover"
              data-ai-hint="food meal dish"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-4xl font-bold font-headline">{food.name}</h1>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="bg-primary/20 text-white border-none backdrop-blur-md">
                  {food.category}
                </Badge>
                <Badge variant="secondary" className="bg-secondary/20 text-white border-none backdrop-blur-md">
                  NutriVision Verified
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Main Nutritional Info */}
            <div className="md:col-span-2 space-y-8">
              <Card className="shadow-md border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Info className="h-5 w-5 text-primary" />
                    Nutritional Breakdown (per 100g)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                      <Flame className="h-5 w-5 text-primary mx-auto mb-1" />
                      <div className="text-xl font-bold">{food.calories}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Calories</div>
                    </div>
                    <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                      <Salad className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                      <div className="text-xl font-bold">{food.protein}g</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Protein</div>
                    </div>
                    <div className="p-3 bg-orange-500/5 rounded-xl border border-orange-500/10">
                      <Zap className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                      <div className="text-xl font-bold">{food.carbohydrates}g</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Carbs</div>
                    </div>
                    <div className="p-3 bg-yellow-500/5 rounded-xl border border-yellow-500/10">
                      <Zap className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                      <div className="text-xl font-bold">{food.fat}g</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Fat</div>
                    </div>
                    <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10">
                      <Info className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                      <div className="text-xl font-bold">{food.sugar}g</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Sugar</div>
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
                          <Badge key={v} variant="outline" className="font-normal text-[10px]">{v}</Badge>
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
                          <Badge key={m} variant="outline" className="font-normal text-[10px]">{m}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Health Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {food.healthBenefits.map((benefit: string) => (
                      <li key={benefit} className="flex items-start gap-3 text-muted-foreground text-sm">
                        <div className="h-5 w-5 flex-shrink-0 flex items-center justify-center rounded-full bg-green-100 text-green-600 mt-0.5">
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
              <Card className="shadow-md border-none bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive text-lg">
                    <AlertTriangle className="h-5 w-5" />
                    Risks & Allergens
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {food.risks.map((risk: string) => (
                      <li key={risk} className="text-sm text-destructive/80 flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-md border-none">
                <CardHeader>
                  <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Probable Ingredients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {food.ingredients.map((ing: string) => (
                      <Badge key={ing} variant="secondary" className="bg-muted text-foreground border-none text-[10px]">{ing}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-dashed border-primary/20">
                <CardContent className="p-6">
                  <h4 className="font-bold text-primary text-sm mb-2">NutriVision AI Tip</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This profile is generated based on standard compositions for {food.name}. Preparation methods may vary the actual nutritional yield.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
