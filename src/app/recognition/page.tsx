"use client";

import { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { identifyFoodFromImage, type IdentifyFoodFromImageOutput } from "@/ai/flows/identify-food-from-image-flow";
import { Camera, Loader2, Apple, Flame, Zap, ShieldCheck, AlertTriangle, RefreshCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";

export const maxDuration = 60;

export default function RecognitionPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyFoodFromImageOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 3MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        setError(null);
        analyzeImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    try {
      const response = await identifyFoodFromImage({ foodImage: base64Image });
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setResult(response.data);
        // Save activity to Firestore
        if (user && db) {
          addDoc(collection(db, 'users', user.uid, 'activities'), {
            type: 'scan',
            title: response.data.identification,
            timestamp: new Date().toISOString(),
            details: response.data.nutritionalInfo
          }).catch(err => console.error("Failed to log activity", err));
        }
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-3xl font-bold font-headline mb-4">Visual Food Recognition</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Snap a photo to discover nutritional insights with Gemini 2.5 Flash.</p>
          </header>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <Card 
                className={`relative overflow-hidden border-2 border-dashed h-80 flex flex-col items-center justify-center transition-all cursor-pointer ${image ? 'border-primary/50' : 'hover:border-primary/50 bg-muted/30'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {image ? (
                  <Image src={image} alt="Uploaded food" fill className="object-cover" />
                ) : (
                  <div className="text-center p-6">
                    <Camera className="h-8 w-8 text-primary mx-auto mb-4" />
                    <p className="font-semibold">Capture or upload food photo</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </Card>
              {image && (
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={resetScanner} variant="outline">Reset</Button>
                  <Button className="flex-1" disabled={isAnalyzing} onClick={() => analyzeImage(image!)}>Scan Again</Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {isAnalyzing ? (
                <Card className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  <h3 className="text-xl font-semibold">Analyzing...</h3>
                </Card>
              ) : result ? (
                <Card className="shadow-lg animate-in fade-in slide-in-from-right-4">
                  <CardHeader className="bg-primary text-primary-foreground">
                    <CardTitle className="flex items-center gap-2"><Apple className="h-6 w-6" />{result.identification}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 text-center mb-6">
                      <div className="p-3 bg-muted rounded-lg"><Flame className="h-5 w-5 text-primary mx-auto mb-1" /><div className="text-lg font-bold">{result.nutritionalInfo.calories}</div><div className="text-[10px] text-muted-foreground uppercase">Kcal</div></div>
                      <div className="p-3 bg-muted rounded-lg"><Zap className="h-5 w-5 text-blue-500 mx-auto mb-1" /><div className="text-lg font-bold">{result.nutritionalInfo.protein}g</div><div className="text-[10px] text-muted-foreground uppercase">Protein</div></div>
                    </div>
                    <Button asChild className="w-full mt-6"><Link href="/dashboard">Back to Dashboard</Link></Button>
                  </CardContent>
                </Card>
              ) : error ? (
                <Card className="h-full flex flex-col items-center justify-center p-12 text-center bg-destructive/5">
                  <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                  <p className="text-sm text-destructive">{error}</p>
                </Card>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-muted/20 border-2 border-dashed rounded-xl">
                  <Camera className="h-10 w-10 text-muted-foreground opacity-20 mb-4" />
                  <p className="text-muted-foreground">Results will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}