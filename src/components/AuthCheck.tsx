'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleAuth = async () => {
      // 1. Ensure user is signed in anonymously
      if (!isUserLoading && !user) {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Auth initialization failed", error);
        }
      }

      // 2. Handle redirection based on profile existence
      if (!isUserLoading && user) {
        const storedUserId = localStorage.getItem('nutrivision_userId');
        const isOnboarding = pathname === '/onboarding';
        const isPublicPage = pathname === '/';

        if (!storedUserId && !isOnboarding && !isPublicPage) {
          // If no profile and not on onboarding or landing, go to onboarding
          router.push('/onboarding');
        } else if (storedUserId && isOnboarding) {
          // If profile exists and trying to onboard, go to dashboard
          router.push('/dashboard');
        } else if (storedUserId && isPublicPage) {
          // If onboarded user is on the public landing page, skip it and go to dashboard
          router.push('/dashboard');
        }
        setIsChecking(false);
      }
    };

    handleAuth();
  }, [user, isUserLoading, auth, router, pathname, isMounted]);

  // To prevent hydration mismatch, we MUST render the same content on the server 
  // and during the initial client-side hydration pass. 
  if (!isMounted) {
    return <>{children}</>;
  }

  const isPublicPage = pathname === '/';
  const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('nutrivision_userId') : null;

  // If onboarded user is on public page, hide content while redirecting (only after mount)
  if (storedUserId && isPublicPage) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Show loader if we are on a page that requires profile data but we are still checking
  if ((isUserLoading || isChecking) && !isPublicPage) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Initializing NutriVision AI...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
