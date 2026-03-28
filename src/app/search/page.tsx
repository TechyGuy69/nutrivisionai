
"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, ChevronRight, Apple, Info, Loader2, Utensils, X, AlertCircle, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FoodItemInfo } from "@/ai/flows/food-search-flow";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, deleteDoc, query, where, getDocs, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function SearchPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [queryStr, setQueryStr] = useState("");
  const [results, setResults] = useState<FoodItemInfo[]>([]);
  const [suggestions, setSuggestions] = useState<FoodItemInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch current favorites to highlight them in search results
  const favoritesQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, 'users', user.uid, 'favorites'), where('type', '==', 'food'));
  }, [user, db]);

  const { data: favorites } = useCollection(favoritesQuery);

  const isFavorited = (name: string) => {
    return favorites?.some(fav => fav.title === name);
  };

  // Debounce logic for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (queryStr.trim().length > 1) {
        fetchSuggestions(queryStr);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [queryStr]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (q: string) => {
    setIsSuggesting(true);
    try {
      const response = await fetch(`/api/food-search?q=${encodeURIComponent(q)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(Array.isArray(data) ? data.slice(0, 5) : []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Suggestions error:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!queryStr.trim()) return;

    setShowSuggestions(false);
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/food-search?q=${encodeURIComponent(queryStr)}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "The AI service is currently unavailable.");
      }
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Search error:", error);
      setError(error.message || "Failed to retrieve food data. Please try again later.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, food: FoodItemInfo) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || !db || processingId) return;
    
    setProcessingId(food.id);
    const alreadyFavorited = isFavorited(food.name);

    try {
      if (alreadyFavorited) {
        const q = query(collection(db, 'users', user.uid, 'favorites'), where('title', '==', food.name));
        const snapshot = await getDocs(q);
        snapshot.forEach((d) => {
          deleteDoc(doc(db, 'users', user.uid, 'favorites', d.id));
        });
        toast({ title: "Removed from favorites" });
      } else {
        await addDoc(collection(db, 'users', user.uid, 'favorites'), {
          type: 'food',
          title: food.name,
          timestamp: new Date().toISOString(),
          details: food
        });
        toast({ title: "Added to favorites", description: `${food.name} saved!` });
      }
    } catch (err) {
      console.error("Favoriting error", err);
      toast({ variant: "destructive", title: "Action failed" });
    } finally {
      setProcessingId(null);
    }
  };

  const clearSearch = () => {
    setQueryStr("");
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
    setHasSearched(false);
    setResults([]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2 font-headline">Food Data Explorer</h1>
            <p className="text-muted-foreground">Search our AI-powered database for detailed nutritional facts on any food or dish.</p>
          </header>
          
          <div ref={searchRef} className="relative mb-10">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  value={queryStr}
                  onChange={(e) => setQueryStr(e.target.value)}
                  onFocus={() => queryStr.length > 1 && setShowSuggestions(true)}
                  placeholder="Search raw foods or cooked dishes..." 
                  className="pl-10 pr-10 h-12 text-lg bg-white shadow-sm rounded-xl focus-visible:ring-primary"
                />
                {queryStr && (
                  <button 
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button type="submit" size="lg" className="h-12 px-8 shadow-md rounded-xl" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Explore"}
              </Button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || isSuggesting) && (
              <Card className="absolute z-50 w-full mt-2 shadow-2xl border-primary/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <CardContent className="p-0">
                  {isSuggesting ? (
                    <div className="p-4 flex items-center justify-center text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Searching suggestions...
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {suggestions.map((item) => (
                        <li key={item.id}>
                          <Link 
                            href={`/food/${encodeURIComponent(item.name)}`}
                            className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/5 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <Utensils className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-semibold group-hover:text-primary transition-colors">{item.name}</div>
                                <div className="text-xs text-muted-foreground">{item.category} • {item.calories} kcal</div>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid gap-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium animate-pulse">Querying AI nutritional database...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-destructive/5 rounded-xl border border-destructive/20 border-dashed">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-destructive mb-2">Service Error</h3>
                <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
                <Button variant="outline" className="mt-6" onClick={handleSearch}>Try Again</Button>
              </div>
            ) : results.length > 0 ? (
              results.map((item) => (
                <Link key={item.id} href={`/food/${encodeURIComponent(item.name)}`}>
                  <Card className="hover:border-primary/50 transition-all shadow-sm hover:shadow-md group rounded-xl overflow-hidden border-none bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <Utensils className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-headline">{item.name}</CardTitle>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                            <span className="font-bold text-primary">{item.calories} kcal</span>
                            <span>P: {item.protein}g</span>
                            <span>C: {item.carbohydrates}g</span>
                            <span>F: {item.fat}g</span>
                            <span className="text-[10px] uppercase tracking-widest bg-muted px-2 py-0.5 rounded-full font-bold">{item.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn(
                            "rounded-full transition-all hover:bg-destructive/10",
                            isFavorited(item.name) ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-400"
                          )}
                          onClick={(e) => toggleFavorite(e, item)}
                          disabled={processingId === item.id}
                        >
                          {processingId === item.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Heart className={cn("h-5 w-5", isFavorited(item.name) && "fill-current")} />
                          )}
                        </Button>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))
            ) : hasSearched ? (
              <div className="text-center py-20 bg-muted/10 rounded-xl border-2 border-dashed">
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold">No foods found</h3>
                <p className="text-muted-foreground">Try searching for something more specific like "Fresh Spinach" or "Lentil Soup"</p>
              </div>
            ) : (
              <div className="text-center py-20 bg-primary/5 rounded-xl border-2 border-dashed border-primary/20">
                <Apple className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">Enter a food name to begin exploration</h3>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
