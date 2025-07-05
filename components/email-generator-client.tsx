'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { EmailGenerator } from '@/components/email-generator';
import { LoadingState } from '@/components/ui/loading-state';

export function EmailGeneratorClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Session check error:', error);
          setHasSession(false);
          setIsInitializing(false);
          return;
        }

        if (session) {
          setHasSession(true);
          setIsInitializing(false);
        } else {
          setHasSession(false);
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (mounted) {
          setHasSession(false);
          setIsInitializing(false);
        }
      }
    };

    // Set up auth state change listener first - this is more reliable for sign-in detection
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log('Auth state change:', event, !!session);
      
      if (event === 'SIGNED_IN' && session) {
        setHasSession(true);
        setIsInitializing(false);
      } else if (event === 'SIGNED_OUT' || !session) {
        setHasSession(false);
        setIsInitializing(false);
      }
    });

    // Check initial session immediately
    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  // Redirect to sign-in if no session after initialization
  useEffect(() => {
    if (!isInitializing && !hasSession) {
      console.log('No session found, redirecting to sign-in');
      router.push('/sign-in');
    }
  }, [isInitializing, hasSession, router]);

  // Show loading state while initializing
  if (isInitializing) {
    return <LoadingState text="Checking authentication..." />;
  }

  // Show loading state while redirecting
  if (!hasSession) {
    return <LoadingState text="Redirecting to sign-in..." />;
  }

  // Render EmailGenerator only when we have a confirmed session
  return <EmailGenerator />;
} 