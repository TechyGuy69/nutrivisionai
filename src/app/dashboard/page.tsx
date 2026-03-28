"use client";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Apple, History, Heart, Target, Activity, Loader2, PlusCircle, ChevronRight, Camera, ChefHat } from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const activitiesRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, 'users', user.uid, 'activities'), orderBy('timestamp', 'desc'), limit(10));
  }, [user, db]);

  const favoritesRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, 'users', user.uid, 'favorites'), orderBy('timestamp', 'desc'));
  }, [user, db]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef);
  const { data: activities, isLoading: isActivitiesLoading } = useCollection(activitiesRef);
  const { data: favorites, isLoading: isFavoritesLoading } = useCollection(favoritesRef);

  if (isProfileLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-headline">
                Welcome back, {profile?.name || 'Explorer'}!
              </h1>
              <p className="text-muted-foreground">
                {profile?.healthGoal 
                  ? `Your goal: ${profile.healthGoal}` 
                  : "Track your nutrition journey with AI insights."}
              </p>
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-md border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/recognition" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Camera className="h-4 w-4" /> Visual Scan
                    </Button>
                  </Link>
                  <Link href="/recipes" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <ChefHat className="h-4 w-4" /> Recipe Crafter
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-primary text-primary-foreground border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">AI Coach Insight</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed opacity-90">
                    "Great to see you, <span className="font-bold">{profile?.name}</span>! 
                    Based on your profile, I recommend focusing on {profile?.dietaryPreference || 'balanced'} options today."
                  </p>
                  <Link href="/coach">
                    <Button variant="secondary" className="w-full mt-4 text-xs h-8">Ask for advice</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Tabs defaultValue="history" className="w-full">
                <TabsList className="w-full h-12 mb-6">
                  <TabsTrigger value="history" className="flex-1 text-base">
                    <History className="h-4 w-4 mr-2" />
                    History
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="flex-1 text-base">
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="history">
                  {isActivitiesLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                  ) : activities && activities.length > 0 ? (
                    <div className="space-y-3">
                      {activities.map((act) => (
                        <Card key={act.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-muted rounded-full">
                                {act.type === 'scan' ? <Camera className="h-4 w-4" /> : <ChefHat className="h-4 w-4" />}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{act.title}</p>
                                <p className="text-xs text-muted-foreground">{new Date(act.timestamp).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <Link href={act.type === 'scan' ? `/food/${encodeURIComponent(act.title)}` : '/recipes'}>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border-2 border-dashed">
                      <History className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground">No recent activity</h3>
                      <p className="text-sm text-muted-foreground">Scanned meals and recipes will appear here.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="favorites">
                  {isFavoritesLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                  ) : favorites && favorites.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {favorites.map((fav) => (
                        <Card key={fav.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Heart className="h-4 w-4 text-red-500 fill-current" />
                              <p className="font-bold text-sm">{fav.title}</p>
                            </div>
                            <Link href={fav.type === 'food' ? `/food/${encodeURIComponent(fav.title)}` : '/recipes'}>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border-2 border-dashed">
                      <Heart className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground">Your favorites are empty</h3>
                      <p className="text-sm text-muted-foreground mb-4">Save recipes or food items to see them here.</p>
                      <Link href="/search"><Button variant="outline" size="sm">Explore Foods</Button></Link>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}