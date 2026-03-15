"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Search, Camera, ChefHat, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useState, useEffect } from "react";

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

  // Don't show full nav if on onboarding
  const isOnboarding = pathname === '/onboarding';
  
  // Logic for the logo link destination
  const logoHref = hasUserId ? "/dashboard" : "/";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={logoHref} className="flex items-center gap-2 font-headline text-xl font-bold text-primary">
          <Leaf className="h-6 w-6" />
          <span>NutriVision AI</span>
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
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                  pathname === '/profile' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-primary/10 text-primary hover:bg-primary/20"
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
