
"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ChevronRight, Apple, Info } from "lucide-react";
import Link from "next/link";

// Mock data for search results
const mockSearchResults = [
  { id: "apple", name: "Apple (Red Delicious)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { id: "chicken-breast", name: "Grilled Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: "avocado", name: "Hass Avocado", calories: 160, protein: 2, carbs: 9, fat: 15 },
  { id: "quinoa", name: "Cooked Quinoa", calories: 222, protein: 8, carbs: 39, fat: 4 },
  { id: "salmon", name: "Atlantic Salmon", calories: 208, protein: 22, carbs: 0, fat: 13 },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(mockSearchResults);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = mockSearchResults.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 font-headline">Food Data Explorer</h1>
          
          <form onSubmit={handleSearch} className="flex gap-2 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search nutritional database..." 
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8">Search</Button>
          </form>

          <div className="grid gap-4">
            {results.length > 0 ? (
              results.map((item) => (
                <Link key={item.id} href={`/food/${item.id}`}>
                  <Card className="hover:border-primary/50 transition-colors shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                          <Apple className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span>{item.calories} kcal</span>
                            <span>P: {item.protein}g</span>
                            <span>C: {item.carbs}g</span>
                            <span>F: {item.fat}g</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center py-20 bg-muted/10 rounded-xl border-2 border-dashed">
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold">No foods found</h3>
                <p className="text-muted-foreground">Try searching for something else like "Banana" or "Pizza"</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
