"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ChevronRight, Apple, Info, Loader2, Utensils } from "lucide-react";
import Link from "next/link";
import { type FoodItemInfo } from "@/ai/flows/food-search-flow";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItemInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const response = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
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
          
          <form onSubmit={handleSearch} className="flex gap-2 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search raw foods or cooked dishes..." 
                className="pl-10 h-12 text-lg bg-white shadow-sm"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8 shadow-md" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Explore"}
            </Button>
          </form>

          <div className="grid gap-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Querying AI nutritional database...</p>
              </div>
            ) : results.length > 0 ? (
              results.map((item) => (
                <Link key={item.id} href={`/food/${encodeURIComponent(item.name)}`}>
                  <Card className="hover:border-primary/50 transition-all shadow-sm hover:shadow-md group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <Utensils className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                            <span className="font-medium text-foreground">{item.calories} kcal</span>
                            <span>P: {item.protein}g</span>
                            <span>C: {item.carbohydrates}g</span>
                            <span>F: {item.fat}g</span>
                            <span className="text-xs uppercase tracking-wider bg-muted px-1.5 rounded">{item.category}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardHeader>
                  </Card>
                </Link>
              ))
            ) : hasSearched ? (
              <div className="text-center py-20 bg-muted/10 rounded-xl border-2 border-dashed">
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold">No foods found</h3>
                <p className="text-muted-foreground">Try searching for something else like "Quinoa Salad" or "Tofu"</p>
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
