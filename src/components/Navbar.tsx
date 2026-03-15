
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Search, Camera, ChefHat, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Explore", href: "/search", icon: Search },
  { name: "Recognition", href: "/recognition", icon: Camera },
  { name: "Recipes", href: "/recipes", icon: ChefHat },
  { name: "AI Coach", href: "/coach", icon: MessageSquare },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold text-primary">
          <Leaf className="h-6 w-6" />
          <span>NutriVision AI</span>
        </Link>

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
          <Link href="/dashboard">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <User className="h-5 w-5" />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
