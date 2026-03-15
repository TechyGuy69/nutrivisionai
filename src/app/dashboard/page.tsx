"use client";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Apple, History, Heart, Target, ChevronRight, Activity, Loader2 } from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";

const recentScans = [
  { id: "apple", name: "Red Apple", date: "Today, 10:24 AM", calories: 95 },
  { id: "avocado", name: "Avocado Toast", date: "Yesterday, 8:45 AM", calories: 320 },
  { id: "chicken", name: "Grilled Chicken", date: "Oct 24, 1:15 PM", calories: 165 },
];

const favoriteRecipes = [
  { name: "Mediterranean Quinoa Bowl", ingredients: "Quinoa, Cucumber, Feta, Olives" },
  { name: "Morning Berry Smoothie", ingredients: "Mixed Berries, Spinach, Almond Milk" },
];

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();

  // Memoize user document ref
  const userRef = user && db ? doc(db, 'users', user.uid) : null;
  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-headline">
                {isProfileLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin inline mr-2" />
                ) : (
                  `Welcome back, ${profile?.name || 'Friend'}!`
                )}
              </h1>
              <p className="text-muted-foreground">
                {profile?.healthGoal 
                  ? `Focusing on: ${profile.healthGoal}. You're 80% towards your daily protein goal.` 
                  : "You're 80% towards your daily protein goal. Keep it up!"}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="bg-white px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">Streak: 12 Days</span>
              </div>
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Daily Goals & Progress */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-md border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Daily Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Calories</span>
                      <span>1,240 / 2,000 kcal</span>
                    </div>
                    <Progress value={62} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Protein</span>
                      <span>64g / 80g</span>
                    </div>
                    <Progress value={80} className="h-2 bg-blue-100" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Carbs</span>
                      <span>142g / 250g</span>
                    </div>
                    <Progress value={56} className="h-2 bg-orange-100" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Fats</span>
                      <span>35g / 65g</span>
                    </div>
                    <Progress value={53} className="h-2 bg-yellow-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary text-primary-foreground border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Coach Tip</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed opacity-90">
                    "Since you follow a <span className="font-bold underline">{profile?.dietaryPreference || 'Healthy'}</span> diet, 
                    try a lighter dinner with lean proteins and leafy greens to balance your macros for the day!"
                  </p>
                  <Link href="/coach">
                    <Button variant="secondary" className="w-full mt-4 text-xs h-8">Ask for ideas</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* History & Favorites Tabs */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="history" className="w-full">
                <TabsList className="w-full h-12 mb-6">
                  <TabsTrigger value="history" className="flex-1 text-base">
                    <History className="h-4 w-4 mr-2" />
                    Activity History
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="flex-1 text-base">
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="history">
                  <div className="grid gap-4">
                    {recentScans.map((scan) => (
                      <Card key={scan.id} className="hover:bg-muted/30 transition-colors shadow-sm cursor-pointer border-none bg-white">
                        <CardHeader className="flex flex-row items-center justify-between p-4 space-y-0">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <Apple className="h-6 w-6" />
                            </div>
                            <div>
                              <CardTitle className="text-base font-bold">{scan.name}</CardTitle>
                              <CardDescription>{scan.date}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <div className="font-bold text-sm">{scan.calories} kcal</div>
                              <div className="text-xs text-muted-foreground">Logged</div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                    <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/5">
                      View Full History
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="favorites">
                  <div className="grid gap-4 md:grid-cols-2">
                    {favoriteRecipes.map((recipe, i) => (
                      <Card key={i} className="hover:border-primary/50 transition-colors shadow-sm cursor-pointer bg-white border-none">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">{recipe.name}</CardTitle>
                          <CardDescription className="line-clamp-1">{recipe.ingredients}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 pt-0">
                          <Button variant="link" className="p-0 h-auto text-xs text-primary font-bold">
                            View Recipe
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                    <Link href="/recipes">
                      <Card className="h-full border-2 border-dashed flex flex-col items-center justify-center p-6 text-center hover:bg-muted/30 transition-colors">
                        <Heart className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium text-muted-foreground">Add new favorite recipe</p>
                      </Card>
                    </Link>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
