"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Camera, ChefHat, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useState, useEffect } from "react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const navItems = [
  { name: "Explore", href: "/search", icon: Search },
  { name: "Recognition", href: "/recognition", icon: Camera },
  { name: "Recipes", href: "/recipes", icon: ChefHat },
  { name: "AI Coach", href: "/coach", icon: MessageSquare },
];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [hasUserId, setHasUserId] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem('nutrivision_userId');
    setHasUserId(!!storedUserId);
  }, []);

  const logoData = PlaceHolderImages.find(img => img.id === "app-logo");

  // Don't show full nav if on onboarding
  const isOnboarding = pathname === '/onboarding';
  
  // Logic for the logo link destination: Dashboard if onboarded, else Home
  const logoHref = hasUserId ? "/dashboard" : "/";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={logoHref} className="flex items-center gap-3 font-headline text-xl font-bold text-primary group">
          {logoData ? (
            <div className="relative h-10 w-10 transition-transform group-hover:scale-110">
              <Image 
                src={logoData.imageUrl} 
                alt="NutriVision AI Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <ChefHat className="text-primary h-6 w-6" />
            </div>
          )}
          <span className="hidden sm:inline tracking-tight">NutriVision AI</span>
        </Link>

        {!isOnboarding && (
          <>
            <div className="hidden md:flex md:items-center md:gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                    pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link href="/profile">
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors border shadow-sm",
                  pathname === '/profile' 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-white text-primary hover:bg-primary/5 border-primary/20"
                )}>
                  <User className="h-5 w-5" />
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
