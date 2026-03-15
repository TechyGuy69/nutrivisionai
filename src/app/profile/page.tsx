'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { User, Save, Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  // Memoize ref for useDoc
  const userRef = user && db ? doc(db, 'users', user.uid) : null;
  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef);

  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    dietaryPreference: '',
    healthGoal: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        age: profile.age?.toString() || '',
        gender: profile.gender || '',
        dietaryPreference: profile.dietaryPreference || '',
        healthGoal: profile.healthGoal || '',
      });
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    setIsUpdating(true);
    const updateData = {
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      dietaryPreference: formData.dietaryPreference,
      healthGoal: formData.healthGoal,
    };

    const docRef = doc(db, 'users', user.uid);

    updateDoc(docRef, updateData)
      .then(() => {
        toast({
          title: "Profile Updated",
          description: "Your health preferences have been saved.",
        });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsUpdating(false);
      });
  };

  if (isProfileLoading) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-headline">{profile?.name}'s Profile</h1>
              <p className="text-muted-foreground">Manage your personal details and dietary goals.</p>
            </div>
          </div>

          <form onSubmit={handleUpdate}>
            <Card className="shadow-lg border-none overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>This information helps us tailor our AI recommendations to you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={formData.gender}
                    onValueChange={(val) => setFormData({ ...formData, gender: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Non-binary">Non-binary</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-bold text-lg font-headline text-primary flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Health & Diet
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="diet">Dietary Preference</Label>
                    <Select 
                      value={formData.dietaryPreference}
                      onValueChange={(val) => setFormData({ ...formData, dietaryPreference: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select diet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                        <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="Vegan">Vegan</SelectItem>
                        <SelectItem value="Pescetarian">Pescetarian</SelectItem>
                        <SelectItem value="Keto">Keto</SelectItem>
                        <SelectItem value="Balanced">Balanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Health Goal</Label>
                    <Select 
                      value={formData.healthGoal}
                      onValueChange={(val) => setFormData({ ...formData, healthGoal: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                        <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                        <SelectItem value="Balanced Diet">Balanced Diet</SelectItem>
                        <SelectItem value="Diabetic Friendly">Diabetic Friendly</SelectItem>
                        <SelectItem value="Heart Healthy">Heart Healthy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <div className="p-6 pt-0 flex justify-end">
                <Button type="submit" className="gap-2 px-8" disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          </form>

          <Card className="mt-8 bg-muted/50 border-dashed">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground italic">
                Your data is stored securely and used only to personalize your NutriVision AI experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
