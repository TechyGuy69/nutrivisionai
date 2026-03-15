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

  useEffect(() => {
    const handleAuth = async () => {
      // 1. Check if user is already signed in via Firebase
      if (!isUserLoading && !user) {
        // 2. If not, check localStorage for existing "guest" session
        const storedUserId = localStorage.getItem('nutrivision_userId');
        
        try {
          // Firebase Anonymous Auth handles the "guest" identity stably
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Auth initialization failed", error);
        }
      }

      // 3. Handle redirection to onboarding if no profile exists
      if (!isUserLoading && user) {
        const storedUserId = localStorage.getItem('nutrivision_userId');
        const isOnboarding = pathname === '/onboarding';

        if (!storedUserId && !isOnboarding) {
          router.push('/onboarding');
        } else if (storedUserId && isOnboarding) {
          router.push('/dashboard');
        }
        setIsChecking(false);
      }
    };

    handleAuth();
  }, [user, isUserLoading, auth, router, pathname]);

  if (isUserLoading || isChecking) {
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
