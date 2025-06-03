"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard } from "lucide-react";
import { ContentWrapper } from "@/components/content-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SubscriptionDetails {
  plan: string;
  status: string;
  renewalDate?: string;
  cancelAtPeriodEnd: boolean;
}

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [creatingPortalSession, setCreatingPortalSession] = useState(false);
  
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (!user) {
          router.push('/sign-in');
          return;
        }

        setUser(user);
        
        const { data: sub, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (!subError && sub) {
          setSubscription({
            plan: sub.plan,
            status: sub.status,
            renewalDate: sub.current_period_end,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          });
        } else {
          setSubscription({
            plan: 'Free',
            status: 'active',
            cancelAtPeriodEnd: false,
          });
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/sign-in');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [supabase, router]);

  const handleManageBilling = async () => {
    try {
      setCreatingPortalSession(true);
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCreatingPortalSession(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-start pt-12">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = user.email
    .split('@')[0]
    .split(/[._-]/)
    .map((part: string) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const displayName = user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     user.email.split('@')[0];

  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-12">
      <div className="mb-8 w-full max-w-3xl px-4">
        <h1 className="text-3xl font-bold tracking-tight text-left">Account Settings</h1>
        <p className="text-muted-foreground text-left">
          Manage your account preferences and subscription
        </p>
      </div>

      <div className="w-full max-w-3xl px-4 pb-24">
        <div className="grid gap-6">
          <Card className="shadow-sm overflow-hidden border rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16 rounded-full">
                  {user.user_metadata?.avatar_url ? (
                    <AvatarImage 
                      src={user.user_metadata.avatar_url} 
                      alt={displayName} 
                    />
                  ) : (
                    <AvatarFallback className="bg-gray-700 text-white text-lg">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{displayName}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Full Name</div>
                  <div className="mt-1 font-medium">
                    {user.user_metadata?.full_name || 'Not set'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Email</div>
                  <div className="mt-1 font-medium">{user.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Account Created</div>
                  <div className="mt-1 font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Last Sign In</div>
                  <div className="mt-1 font-medium">
                    {new Date(user.last_sign_in_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm overflow-hidden border rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Subscription</h2>
                  <p className="text-sm text-gray-500">Your current plan and billing details</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-black text-white border-0">
                    {subscription?.plan || 'Free'} Plan
                  </Badge>
                  {subscription?.status === 'active' && (
                    <Badge variant="outline" className="text-emerald-500 bg-emerald-50 border-emerald-200">
                      Active
                    </Badge>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleManageBilling}
                    disabled={creatingPortalSession || subscription?.plan === 'Free'}
                    className="flex-1 sm:flex-none"
                  >
                    {creatingPortalSession ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Manage Billing
                      </>
                    )}
                  </Button>

                  {subscription?.plan === 'Free' && (
                    <Button
                      variant="default"
                      className="flex-1 sm:flex-none bg-pink-500 hover:bg-pink-600"
                      onClick={() => router.push('/pricing')}
                    >
                      Upgrade Plan
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 