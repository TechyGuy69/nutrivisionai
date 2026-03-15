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

        if (!storedUserId) {
          // Not onboarded: only allow landing page and onboarding page
          if (!isPublicPage && !isOnboarding) {
            router.push('/');
          } else {
            setIsChecking(false);
          }
        } else {
          // Onboarded: skip landing page and onboarding page
          if (isPublicPage || isOnboarding) {
            router.push('/dashboard');
          } else {
            setIsChecking(false);
          }
        }
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
  const isOnboarding = pathname === '/onboarding';
  const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('nutrivision_userId') : null;

  // Show nothing if we are redirecting away from pages we shouldn't be on
  if (storedUserId && (isPublicPage || isOnboarding)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!storedUserId && !isPublicPage && !isOnboarding) {
     return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Show loader if we are still checking auth state on protected pages
  if ((isUserLoading || isChecking) && !isPublicPage && !isOnboarding) {
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
