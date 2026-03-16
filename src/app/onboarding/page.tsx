
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function OnboardingPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Prefer not to say',
    dietaryPreference: 'Balanced',
    healthGoal: 'Balanced Diet',
  });

  const logoData = PlaceHolderImages.find(img => img.id === "app-logo");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    setIsLoading(true);
    const profileData = {
      id: user.uid,
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      dietaryPreference: formData.dietaryPreference,
      healthGoal: formData.healthGoal,
      createdAt: new Date().toISOString(),
    };

    const docRef = doc(db, 'users', user.uid);

    setDoc(docRef, profileData)
      .then(() => {
        // Save ID to local storage to mark user as onboarded
        localStorage.setItem('nutrivision_userId', user.uid);
        router.push('/dashboard');
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: profileData,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsLoading(false);
      });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="mb-8 flex flex-col items-center gap-4 font-headline text-3xl font-bold text-primary animate-in fade-in slide-in-from-top-4 duration-700">
        {logoData && (
          <div className="relative h-20 w-20">
            <Image 
              src={logoData.imageUrl} 
              alt="NutriVision AI Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
        )}
        <span>NutriVision AI</span>
      </div>

      <Card className="w-full max-w-lg shadow-2xl border-none animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold font-headline">Welcome to your health journey!</CardTitle>
          <CardDescription>Enter your details to generate your personalized health profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  required
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  required
                  min="1"
                  max="120"
                  placeholder="Years"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                onValueChange={(val) => setFormData({ ...formData, gender: val })}
                defaultValue={formData.gender}
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

            <div className="space-y-2">
              <Label htmlFor="diet">Dietary Preference</Label>
              <Select 
                onValueChange={(val) => setFormData({ ...formData, dietaryPreference: val })}
                defaultValue={formData.dietaryPreference}
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
              <Label htmlFor="goal">Primary Health Goal</Label>
              <Select 
                onValueChange={(val) => setFormData({ ...formData, healthGoal: val })}
                defaultValue={formData.healthGoal}
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

            <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Create Profile <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 bg-muted/30 rounded-b-lg py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-tighter">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>AI powered nutrition insights waiting for you</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
