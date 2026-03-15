"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, ShieldCheck, AlertTriangle, Salad, Zap, Flame, Loader2, ChevronLeft, Beaker, Camera } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getFoodDetails, type FoodItemInfo } from "@/ai/flows/food-search-flow";
import { useParams } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function FoodDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [food, setFood] = useState<FoodItemInfo | null>(null);
  const [foodImageUrl, setFoodImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(false);

  useEffect(() => {
    async function fetchFoodAndImage() {
      if (!id) return;
      setIsLoading(true);
      try {
        const decodedId = decodeURIComponent(id);
        const data = await getFoodDetails(decodedId);
        setFood(data);

        if (data) {
          // Fetch dynamic image
          setIsImageLoading(true);
          try {
            const imageResponse = await fetch(`/api/food-image?q=${encodeURIComponent(data.name)}`);
            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              setFoodImageUrl(imageData.url);
            }
          } catch (imgError) {
            console.error("Error fetching food image:", imgError);
          } finally {
            setIsImageLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching food details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFoodAndImage();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Retrieving Expert Nutritional Data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Analysis Unavailable</h1>
            <p className="text-muted-foreground mb-6">We couldn't retrieve or generate nutritional data for this specific item right now.</p>
            <Link href="/search">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors py-2 px-6 text-sm">
                Return to Explorer
              </Badge>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const defaultPlaceholder = "https://picsum.photos/seed/food-placeholder/1000/500";
  const displayImageUrl = foodImageUrl || defaultPlaceholder;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Link href="/search" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group w-fit">
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Explorer
          </Link>

          {/* Header Section with Dynamic Image */}
          <div className="relative h-72 md:h-96 w-full rounded-3xl overflow-hidden mb-8 shadow-2xl bg-muted">
            {isImageLoading && !foodImageUrl ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
              </div>
            ) : (
              <Image 
                src={displayImageUrl} 
                alt={food.name} 
                fill 
                className="object-cover transition-opacity duration-500"
                unoptimized={displayImageUrl.includes('spoonacular.com')}
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <Badge variant="secondary" className="mb-3 bg-primary text-white border-none px-3 py-1 uppercase tracking-widest text-[10px] font-bold">
                {food.category}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold font-headline leading-tight drop-shadow-md">{food.name}</h1>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Main Nutritional Info */}
            <div className="md:col-span-2 space-y-8">
              <Card className="shadow-xl border-none overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <CardTitle className="flex items-center gap-2 text-xl font-headline">
                    <Beaker className="h-5 w-5 text-primary" />
                    Macro Profile <span className="text-sm font-normal text-muted-foreground ml-auto">per 100g</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div className="flex flex-col items-center p-4 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm">
                      <Flame className="h-6 w-6 text-primary mb-2" />
                      <div className="text-xl md:text-2xl font-black text-primary">{food.calories}</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Kcal</div>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-sm">
                      <Salad className="h-6 w-6 text-blue-500 mb-2" />
                      <div className="text-xl md:text-2xl font-black text-blue-500">{food.protein}g</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protein</div>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 shadow-sm">
                      <Zap className="h-6 w-6 text-orange-500 mb-2" />
                      <div className="text-xl md:text-2xl font-black text-orange-500">{food.carbohydrates}g</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Carbs</div>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 shadow-sm">
                      <Zap className="h-6 w-6 text-yellow-500 mb-2" />
                      <div className="text-xl md:text-2xl font-black text-yellow-500">{food.fat}g</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fat</div>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-sm">
                      <Info className="h-6 w-6 text-purple-500 mb-2" />
                      <div className="text-xl md:text-2xl font-black text-purple-500">{food.sugar}g</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sugar</div>
                    </div>
                  </div>

                  <Separator className="my-10" />

                  <div className="grid sm:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        Key Vitamins
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {food.vitamins.length > 0 ? (
                          food.vitamins.map((v) => (
                            <Badge key={v} variant="outline" className="font-medium bg-white px-3 py-1 shadow-sm">{v}</Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Standard nutritional vitamins</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-secondary" />
                        Essential Minerals
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {food.minerals.length > 0 ? (
                          food.minerals.map((m) => (
                            <Badge key={m} variant="outline" className="font-medium bg-white px-3 py-1 shadow-sm">{m}</Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Essential trace minerals</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-none">
                <CardHeader className="bg-secondary/10 border-b border-secondary/20">
                  <CardTitle className="flex items-center gap-2 text-xl font-headline text-secondary-foreground">
                    <ShieldCheck className="h-6 w-6 text-secondary" />
                    Health Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="grid sm:grid-cols-2 gap-4">
                    {food.healthBenefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border text-sm text-foreground/80">
                        <div className="h-5 w-5 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-white font-bold text-[10px]">
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
            <div className="space-y-8">
              <Card className="shadow-xl border-none bg-destructive/5 overflow-hidden">
                <CardHeader className="bg-destructive/10">
                  <CardTitle className="flex items-center gap-2 text-destructive text-lg font-headline">
                    <AlertTriangle className="h-5 w-5" />
                    Risks & Allergens
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3">
                    {food.risks.length > 0 ? (
                      food.risks.map((risk) => (
                        <li key={risk} className="text-sm font-medium text-destructive/90 flex items-start gap-3">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0 shadow-[0_0_5px_rgba(255,0,0,0.5)]" />
                          {risk}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground italic">No common allergens identified.</li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-none">
                <CardHeader>
                  <CardTitle className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-black">Composition Insight</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {food.ingredients.map((ing) => (
                      <Badge key={ing} variant="secondary" className="bg-muted hover:bg-primary/10 transition-colors text-foreground px-3 py-1 text-[11px] font-medium border-none">{ing}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary shadow-2xl text-primary-foreground border-none">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Beaker className="h-6 w-6 opacity-80" />
                    <h4 className="font-black text-xs uppercase tracking-[0.2em]">AI Intelligence Tip</h4>
                  </div>
                  <p className="text-sm leading-relaxed opacity-90 font-medium">
                    "This nutritional profile is a high-precision synthesis for <span className="underline decoration-secondary decoration-2 font-bold">{food.name}</span>. Image and data are retrieved from USDA and Spoonacular databases via AI orchestration."
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
