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

export const maxDuration = 60; // Increase Vercel timeout

export default function RecognitionPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyFoodFromImageOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Adjusted limit: Vercel has a 4.5MB payload limit. 
      // Base64 encoding adds ~33% overhead, so we limit to 3MB original file size.
      if (file.size > 3 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 3MB for processing.",
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
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: response.error,
        });
      } else if (response.data) {
        setResult(response.data);
      }
    } catch (err: any) {
      console.error("Critical Scanner Error:", err);
      setError("An unexpected error occurred. Please refresh and try again.");
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
            <p className="text-muted-foreground max-w-xl mx-auto">
              Snap a photo of your meal to instantly discover its nutritional value and health benefits.
            </p>
          </header>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <Card 
                className={`relative overflow-hidden border-2 border-dashed h-80 flex flex-col items-center justify-center transition-all cursor-pointer ${image ? 'border-primary/50' : 'hover:border-primary/50 bg-muted/30'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {image ? (
                  <div className="absolute inset-0">
                    <Image src={image} alt="Uploaded food" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-8 w-8 text-primary" />
                    </div>
                    <p className="font-semibold">Click to capture or upload</p>
                    <p className="text-sm text-muted-foreground mt-1">Maximum file size: 3MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </Card>

              {image && (
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={resetScanner}
                    variant="outline"
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button 
                    className="flex-1" 
                    disabled={isAnalyzing}
                    onClick={() => image && analyzeImage(image)}
                  >
                    {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
                    Scan Again
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {isAnalyzing ? (
                <Card className="h-full flex flex-col items-center justify-center p-12 text-center bg-primary/5 border-primary/20">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Analyzing your meal...</h3>
                  <p className="text-muted-foreground text-sm">Identifying ingredients and calculating nutrition via Gemini 2.5 Flash.</p>
                </Card>
              ) : error ? (
                <Card className="h-full flex flex-col items-center justify-center p-12 text-center border-destructive/20 bg-destructive/5">
                  <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-xl font-semibold text-destructive mb-2">Analysis Error</h3>
                  <p className="text-muted-foreground text-sm mb-6">{error}</p>
                  <Button onClick={() => image && analyzeImage(image)} variant="outline">
                    Retry Scan
                  </Button>
                </Card>
              ) : result ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <Card className="shadow-lg border-primary/20">
                    <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <Apple className="h-6 w-6" />
                        {result.identification}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4 text-center mb-6">
                        <div className="p-3 bg-muted rounded-lg">
                          <Flame className="h-5 w-5 text-primary mx-auto mb-1" />
                          <div className="text-lg font-bold">{result.nutritionalInfo.calories}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">Kcal</div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <Zap className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                          <div className="text-lg font-bold">{result.nutritionalInfo.protein}g</div>
                          <div className="text-[10px] text-muted-foreground uppercase">Protein</div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <Zap className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                          <div className="text-lg font-bold">{result.nutritionalInfo.carbohydrates}g</div>
                          <div className="text-[10px] text-muted-foreground uppercase">Carbs</div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <Zap className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                          <div className="text-lg font-bold">{result.nutritionalInfo.fat}g</div>
                          <div className="text-[10px] text-muted-foreground uppercase">Fat</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <section>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            Health Benefits
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {result.nutritionalInfo.healthBenefits.slice(0, 3).map((b, i) => (
                              <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-100">
                                {b}
                              </span>
                            ))}
                          </div>
                        </section>
                      </div>

                      <Button asChild className="w-full mt-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                        <Link href="/dashboard">Back to Dashboard</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-muted/20 border-2 border-dashed rounded-xl">
                  <Camera className="h-10 w-10 text-muted-foreground opacity-20 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">Results will appear here</h3>
                  <p className="text-xs text-muted-foreground mt-2">Upload a photo to see nutritional details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
