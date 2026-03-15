
import Link from "next/link";
import Image from "next/image";
import { Search, Camera, ChefHat, MessageSquare, ArrowRight, Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Food Data Explorer",
    description: "Search and discover detailed nutritional information for thousands of foods.",
    icon: Search,
    href: "/search",
    color: "bg-blue-500/10 text-blue-500",
    image: PlaceHolderImages.find(img => img.id === "feature-explorer")?.imageUrl
  },
  {
    title: "Visual Food Recognition",
    description: "Upload a photo of your meal and let AI identify ingredients and nutritional value.",
    icon: Camera,
    href: "/recognition",
    color: "bg-green-500/10 text-green-500",
    image: PlaceHolderImages.find(img => img.id === "feature-recognition")?.imageUrl
  },
  {
    title: "Recipe Crafter",
    description: "Input what's in your fridge and get healthy, personalized recipes instantly.",
    icon: ChefHat,
    href: "/recipes",
    color: "bg-orange-500/10 text-orange-500",
    image: PlaceHolderImages.find(img => img.id === "feature-recipes")?.imageUrl
  },
  {
    title: "AI Healthy Meal Coach",
    description: "Chat with our expert AI to get personalized nutrition advice and meal plans.",
    icon: MessageSquare,
    href: "/coach",
    color: "bg-purple-500/10 text-purple-500",
    image: PlaceHolderImages.find(img => img.id === "feature-coach")?.imageUrl
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary/5 py-16 md:py-24">
          <div className="container relative z-10 mx-auto px-4 text-center">
            <h1 className="mb-6 font-headline text-4xl font-extrabold tracking-tight md:text-6xl text-foreground">
              Master Your Nutrition with <span className="text-primary">AI</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
              From visual recognition to personalized coaching, NutriVision AI is your all-in-one companion for a healthier lifestyle.
            </p>
            
            <form action="/search" className="mx-auto flex max-w-2xl items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  name="q"
                  placeholder="Search for any food item... (e.g., Avocado Toast)" 
                  className="h-14 pl-10 text-lg shadow-lg border-primary/20 focus-visible:ring-primary"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 text-lg font-semibold shadow-lg">
                Explore
              </Button>
            </form>
          </div>
          
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        </section>

        {/* Features Grid */}
        <section className="container mx-auto py-16 px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-headline text-3xl font-bold">Comprehensive Health Tools</h2>
            <p className="text-muted-foreground">Everything you need to reach your dietary goals.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Link key={feature.title} href={feature.href} className="group">
                <Card className="h-full border-none shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                    <Image 
                      src={feature.image || "https://picsum.photos/seed/default/400/300"} 
                      alt={feature.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      data-ai-hint={
                        PlaceHolderImages.find(img => img.imageUrl === feature.image)?.imageHint || "food nutrition"
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className={cn("absolute bottom-3 left-3 rounded-md p-2 shadow-sm", feature.color)}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm font-semibold text-primary">
                      Get Started <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Social Proof / Stats */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 grid gap-8 md:grid-cols-3 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">98%</div>
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Accuracy in Recognition</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">10k+</div>
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Healthy Recipes Generated</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">24/7</div>
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-xs">AI Nutrition Support</p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4 font-headline text-xl font-bold text-primary">
            <Leaf className="h-6 w-6" />
            <span>NutriVision AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NutriVision AI. Empowering your health journey with artificial intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}
