
import Link from "next/link";
import Image from "next/image";
import { Search, Camera, ChefHat, MessageSquare, ArrowRight } from "lucide-react";
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
  const logoData = PlaceHolderImages.find(img => img.id === "app-logo");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary/5 py-16 md:py-32">
          <div className="container relative z-10 mx-auto px-4 text-center">
            <h1 className="mb-6 font-headline text-5xl font-extrabold tracking-tight md:text-7xl text-foreground">
              Master Your Nutrition with <span className="text-primary">AI</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
              From visual recognition to personalized coaching, NutriVision AI is your all-in-one companion for a healthier lifestyle.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/onboarding">
                <Button size="lg" className="h-14 px-10 text-lg font-bold shadow-xl rounded-full gap-2 transition-transform hover:scale-105">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <div className="hidden sm:block h-8 w-px bg-border mx-2" />
              <form action="/search" className="flex w-full max-w-md items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    name="q"
                    placeholder="Search food data..." 
                    className="h-14 pl-10 bg-white shadow-lg border-primary/10 rounded-full focus-visible:ring-primary"
                  />
                </div>
                <Button type="submit" variant="outline" className="h-14 px-6 font-semibold rounded-full bg-white hover:bg-primary/5">
                  Explore
                </Button>
              </form>
            </div>
          </div>
          
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-secondary/20 blur-3xl opacity-50" />
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl opacity-50" />
        </section>

        {/* Features Grid */}
        <section className="container mx-auto py-24 px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-headline text-3xl font-bold md:text-4xl">Comprehensive Health Tools</h2>
            <p className="text-muted-foreground text-lg">Everything you need to reach your dietary goals with precision.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Link key={feature.title} href={feature.href} className="group">
                <Card className="h-full border-none shadow-md transition-all hover:-translate-y-2 hover:shadow-2xl">
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <Image 
                      src={feature.image || "https://picsum.photos/seed/default/400/300"} 
                      alt={feature.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                      data-ai-hint={
                        PlaceHolderImages.find(img => img.imageUrl === feature.image)?.imageHint || "food nutrition"
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                    <div className={cn("absolute bottom-4 left-4 rounded-xl p-3 shadow-lg backdrop-blur-md", feature.color)}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm font-bold text-primary">
                      Learn More <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-primary/5 py-24 border-y border-primary/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6 font-headline">Ready to transform your health?</h2>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
              Join thousands of users who are making better nutritional choices every day with NutriVision AI.
            </p>
            <Link href="/onboarding">
              <Button size="lg" className="h-16 px-12 text-xl font-bold shadow-2xl rounded-full gap-2">
                Get Started Now <ArrowRight className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Social Proof / Stats */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4 grid gap-12 md:grid-cols-3 text-center">
            <div className="space-y-3">
              <div className="text-5xl font-extrabold text-primary">98%</div>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Accuracy in Recognition</p>
              <p className="text-sm text-muted-foreground/60 italic px-4">Powered by state-of-the-art vision models</p>
            </div>
            <div className="space-y-3">
              <div className="text-5xl font-extrabold text-primary">10k+</div>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Healthy Recipes Generated</p>
              <p className="text-sm text-muted-foreground/60 italic px-4">Customized to your pantry items</p>
            </div>
            <div className="space-y-3">
              <div className="text-5xl font-extrabold text-primary">24/7</div>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">AI Nutrition Support</p>
              <p className="text-sm text-muted-foreground/60 italic px-4">Expert advice whenever you need it</p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-3 mb-6 font-headline text-2xl font-bold text-primary">
            {logoData && (
              <Image 
                src={logoData.imageUrl} 
                alt="NutriVision AI Logo" 
                width={32} 
                height={32} 
                className="h-8 w-auto object-contain"
              />
            )}
            <span>NutriVision AI</span>
          </div>
          <div className="flex justify-center gap-8 mb-8 text-sm font-medium text-muted-foreground">
            <Link href="/search" className="hover:text-primary">Explorer</Link>
            <Link href="/recognition" className="hover:text-primary">Recognition</Link>
            <Link href="/recipes" className="hover:text-primary">Recipes</Link>
            <Link href="/coach" className="hover:text-primary">AI Coach</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NutriVision AI. Empowering your health journey with artificial intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}
