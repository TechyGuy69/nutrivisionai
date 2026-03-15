"use client";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Apple, History, Heart, Target, ChevronRight, Activity, Loader2, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef);

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
                Welcome back, {profile?.name}!
              </h1>
              <p className="text-muted-foreground">
                {profile?.healthGoal 
                  ? `Your current focus: ${profile.healthGoal}.` 
                  : "Start your journey by setting a health goal in your profile."}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="bg-white px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">Ready to scan</span>
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
                <CardContent className="space-y-6 text-center py-10">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <PlusCircle className="h-10 w-10 opacity-20" />
                    <p className="text-sm">Log your first meal to see progress</p>
                  </div>
                  <Link href="/recognition" className="block">
                    <Button variant="outline" className="w-full">Start Visual Scan</Button>
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
                    As a <span className="font-bold underline">{profile?.dietaryPreference}</span> eater, 
                    I can help you find meals that fit your {profile?.healthGoal} goal."
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
                  <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border-2 border-dashed">
                    <History className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">No recent activity</h3>
                    <p className="text-sm text-muted-foreground">Your scanned meals will appear here.</p>
                  </div>
                </TabsContent>

                <TabsContent value="favorites">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Link href="/recipes" className="md:col-span-2">
                      <Card className="h-full border-2 border-dashed flex flex-col items-center justify-center p-12 text-center hover:bg-muted/30 transition-colors">
                        <Heart className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground">Your favorites are empty</h3>
                        <p className="text-sm text-muted-foreground mb-4">Save recipes or food items to see them here.</p>
                        <Button variant="outline" size="sm">Explore Recipes</Button>
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
