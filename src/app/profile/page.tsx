'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { User, Save, Loader2, Edit2, X, Calendar, Activity, Utensils, ShieldAlert, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Local state for the form
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    dietaryPreference: '',
    healthGoal: '',
    allergies: '', // We'll handle this as a comma-separated string for editing
  });

  // Stabilize user document ref
  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef);

  useEffect(() => {
    // Check for userId in localStorage or fallback to auth user
    const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('nutrivision_userId') : null;
    if (!isAuthLoading && !user && !storedUserId) {
      router.push('/onboarding');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        age: profile.age?.toString() || '',
        gender: profile.gender || '',
        dietaryPreference: profile.dietaryPreference || '',
        healthGoal: profile.healthGoal || '',
        allergies: Array.isArray(profile.allergies) ? profile.allergies.join(', ') : '',
      });
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    setIsUpdating(true);
    
    // Process allergies back into an array
    const allergiesArray = formData.allergies
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');

    const updateData = {
      name: formData.name,
      age: parseInt(formData.age) || 0,
      gender: formData.gender,
      dietaryPreference: formData.dietaryPreference,
      healthGoal: formData.healthGoal,
      allergies: allergiesArray,
    };

    const docRef = doc(db, 'users', user.uid);

    updateDoc(docRef, updateData)
      .then(() => {
        toast({
          title: "Profile Updated",
          description: "Your changes have been saved successfully.",
        });
        setIsEditing(false);
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

  if (isProfileLoading || isAuthLoading) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const formattedDate = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Not available';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-inner">
                <User className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-headline">{profile?.name}</h1>
                <p className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3" />
                  Joined {formattedDate}
                </p>
              </div>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} className="gap-2 shadow-md">
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdate}>
              <Card className="shadow-xl border-none overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Edit Personal Details</CardTitle>
                      <CardDescription>Update your information to get better AI recommendations.</CardDescription>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender Identity</Label>
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
                    <h3 className="font-bold text-lg font-headline text-primary">Health & Nutrition</h3>
                    
                    <div className="grid gap-6 sm:grid-cols-2">
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
                        <Label htmlFor="goal">Primary Health Goal</Label>
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

                    <div className="space-y-2">
                      <Label htmlFor="allergies">Allergies (comma separated)</Label>
                      <Textarea
                        id="allergies"
                        placeholder="e.g. Peanuts, Shellfish, Gluten"
                        value={formData.allergies}
                        onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                        className="min-h-[100px]"
                      />
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Separate multiple allergies with commas</p>
                    </div>
                  </div>
                </CardContent>
                <div className="p-6 pt-0 flex gap-3 justify-end bg-muted/10 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                    Cancel
                  </Button>
                  <Button type="submit" className="gap-2 px-8" disabled={isUpdating}>
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Profile
                  </Button>
                </div>
              </Card>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-md border-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Personal Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-muted/50">
                      <span className="text-muted-foreground text-sm">Age</span>
                      <span className="font-bold">{profile?.age} years</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground text-sm">Gender</span>
                      <span className="font-bold">{profile?.gender}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Current Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-muted/50">
                      <span className="text-muted-foreground text-sm">Primary Goal</span>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                        {profile?.healthGoal}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground text-sm">Diet Type</span>
                      <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground border-none">
                        {profile?.dietaryPreference}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-md border-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-destructive" />
                    Allergies & Sensitivities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profile?.allergies && profile.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.allergies.map((allergy: string) => (
                        <Badge key={allergy} variant="destructive" className="bg-destructive/10 text-destructive border-none uppercase text-[10px] tracking-widest font-bold">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">No allergies listed in your profile.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-dashed border-primary/30">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <Utensils className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary mb-1">AI Recommendation Insight</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Based on your {profile?.dietaryPreference} diet and {profile?.healthGoal} goal, our AI models prioritize high-nutrient density options while monitoring {profile?.allergies?.length ? profile.allergies.join(', ') : 'no'} sensitivities.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
