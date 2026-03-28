"use client";

import { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, ShieldCheck, AlertTriangle, Salad, Zap, Flame, Loader2, ChevronLeft, Beaker, Heart, RefreshCw, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getFoodDetails, type FoodItemInfo } from "@/ai/flows/food-search-flow";
import { useParams } from "next/navigation";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, deleteDoc, query, where, getDocs, doc } from "firebase/firestore";

export default function FoodDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useUser();
  const db = useFirestore();
  const [food, setFood] = useState<FoodItemInfo | null>(null);
  const [foodImageUrl, setFoodImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  const favoritesQuery = useMemoFirebase(() => {
    if (!user || !db || !food) return null;
    return query(collection(db, 'users', user.uid, 'favorites'), where('title', '==', food.name));
  }, [user, db, food]);

  const { data: favoriteDocs } = useCollection(favoritesQuery);

  useEffect(() => {
    if (favoriteDocs && favoriteDocs.length > 0) {
      setIsFavorite(true);
    } else {
      setIsFavorite(false);
    }
  }, [favoriteDocs]);

  const fetchFoodAndImage = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const decodedId = decodeURIComponent(id);
      const data = await getFoodDetails(decodedId);
      
      if (!data) {
        setFood(null);
      } else {
        setFood(data);
        try {
          const imageResponse = await fetch(`/api/food-image?q=${encodeURIComponent(data.name)}`);
          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            setFoodImageUrl(imageData.url);
          }
        } catch (imgError) {
          console.error("Error fetching food image:", imgError);
        }
      }
    } catch (err: any) {
      console.error("Error fetching food details:", err);
      if (err.message === 'RATE_LIMIT_EXCEEDED') {
        setError("AI_BUSY");
      } else {
        setError("UNKNOWN");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFoodAndImage();
  }, [fetchFoodAndImage]);

  const toggleFavorite = async () => {
    if (!user || !db || !food || isFavoriting) return;
    setIsFavoriting(true);
    try {
      if (isFavorite) {
        const q = query(collection(db, 'users', user.uid, 'favorites'), where('title', '==', food.name));
        const snapshot = await getDocs(q);
        snapshot.forEach((d) => {
          deleteDoc(doc(db, 'users', user.uid, 'favorites', d.id));
        });
        setIsFavorite(false);
      } else {
        await addDoc(collection(db, 'users', user.uid, 'favorites'), {
          type: 'food',
          title: food.name,
          timestamp: new Date().toISOString(),
          details: food
        });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Favoriting error", err);
    } finally {
      setIsFavoriting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse uppercase tracking-widest">Consulting AI Nutritionist...</p>
        </div>
      </div>
    );
  }

  if (error === "AI_BUSY") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl border-none text-center p-8 bg-white">
            <div className="bg-orange-500/10 p-4 rounded-full w-fit mx-auto mb-6">
              <Clock className="h-10 w-10 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold font-headline mb-4">AI Service is Busy</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Our high-speed Gemini 2.5 Flash model is currently receiving many requests. Please wait about 30-60 seconds and try again.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => fetchFoodAndImage()} className="gap-2 h-12 text-lg">
                <RefreshCw className="h-5 w-5" /> Retry Now
              </Button>
              <Link href="/search" className="w-full">
                <Button variant="outline" className="w-full h-12">Back to Search</Button>
              </Link>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (!food || error) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border max-w-md">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Food Not Found</h1>
            <p className="text-muted-foreground mb-6">We couldn't retrieve details for this item at the moment.</p>
            <Link href="/search"><Button variant="outline">Back to Search</Button></Link>
          </div>
        </main>
      </div>
    );
  }

  const displayImageUrl = foodImageUrl || `https://picsum.photos/seed/${encodeURIComponent(food.name)}/1000/500`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link href="/search" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="h-4 w-4" /> Back to Search
            </Link>
            <Button 
              variant={isFavorite ? "secondary" : "outline"} 
              size="sm" 
              onClick={toggleFavorite} 
              disabled={isFavoriting}
              className="gap-2"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              {isFavorite ? "Favorited" : "Add to Favorites"}
            </Button>
          </div>

          <div className="relative h-72 md:h-96 w-full rounded-3xl overflow-hidden mb-8 shadow-2xl bg-muted">
            <Image src={displayImageUrl} alt={food.name} fill className="object-cover" unoptimized={displayImageUrl.includes('spoonacular.com')} priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <Badge variant="secondary" className="mb-2 bg-primary text-white border-none">{food.category}</Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold font-headline">{food.name}</h1>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-8">
              <Card className="shadow-xl border-none">
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle className="flex items-center gap-2 text-xl font-headline">
                    <Beaker className="h-5 w-5 text-primary" /> Macro Profile <span className="text-xs font-normal text-muted-foreground ml-auto">per 100g</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-4 bg-primary/10 rounded-2xl">
                    <Flame className="h-5 w-5 text-primary mb-1" />
                    <div className="text-xl font-bold">{food.calories}</div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Calories</div>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-blue-500/10 rounded-2xl">
                    <Salad className="h-5 w-5 text-blue-500 mb-1" />
                    <div className="text-xl font-bold">{food.protein}g</div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Protein</div>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-orange-500/10 rounded-2xl">
                    <Zap className="h-5 w-5 text-orange-500 mb-1" />
                    <div className="text-xl font-bold">{food.carbohydrates}g</div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Carbs</div>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-yellow-500/10 rounded-2xl">
                    <Zap className="h-5 w-5 text-yellow-500 mb-1" />
                    <div className="text-xl font-bold">{food.fat}g</div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Fat</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-none">
                <CardHeader className="bg-secondary/10 border-b">
                  <CardTitle className="text-xl font-headline flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-secondary" /> Health Benefits</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {food.healthBenefits.map((b) => (
                      <li key={b} className="flex gap-2 text-sm p-3 bg-muted/30 rounded-lg"><span className="text-primary font-bold">✓</span> {b}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-destructive/5 border-none shadow-xl">
                <CardHeader className="pb-2"><CardTitle className="text-destructive flex items-center gap-2 text-lg"><AlertTriangle className="h-5 w-5" /> Risks</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {food.risks.length > 0 ? food.risks.map((r) => (
                      <li key={r} className="text-sm text-destructive font-medium flex gap-2"><span>•</span> {r}</li>
                    )) : <li className="text-sm text-muted-foreground italic">No common risks identified.</li>}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
