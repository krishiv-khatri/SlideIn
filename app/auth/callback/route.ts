import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    try {
      // Exchange the auth code for a session
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error('Error exchanging code for session:', sessionError)
        return NextResponse.redirect(
          new URL('/sign-in?error=Failed to authenticate', requestUrl.origin)
        )
      }
      
      // Debug logging
      console.log('Authentication successful, session created:', !!data.session)
      if (data.session?.user) {
        console.log('User provider:', data.session.user.app_metadata.provider)
      }
      
      // Make sure we have a valid session and user
      if (!data.session?.user?.id) {
        console.error('Missing user ID in session')
        return NextResponse.redirect(
          new URL('/sign-in?error=Authentication error: missing user data', requestUrl.origin)
        )
      }
      
      // Check for existing consent records
      const { data: userData, error: userError } = await supabase
        .from('user_usage_agreements')
        .select('*')
        .eq('user_id', data.session.user.id)
        .maybeSingle()

      if (userError) {
        console.error('Error checking user consent:', userError)
      }

      // Explicitly check if the user has agreed to terms
      // If not, redirect to consent page regardless of sign-in method
      if (!userData || !userData.proper_use_accepted) {
        console.log('User needs to accept terms, redirecting to consent page')
        
        // Parse state to get redirect destination
        let finalRedirect = '/email-generator'
        if (state) {
          try {
            const parsedState = JSON.parse(state)
            if (parsedState.redirectedFrom && parsedState.redirectedFrom !== '/') {
              finalRedirect = parsedState.redirectedFrom
            }
          } catch (error) {
            console.error('Error parsing state parameter:', error)
          }
        }
        
        return NextResponse.redirect(
          new URL(`/auth/consent?redirect_to=${encodeURIComponent(finalRedirect)}`, requestUrl.origin)
        )
      }
      
      console.log('User has already accepted terms, proceeding to app')
      
      // Parse state to get redirect destination  
      let redirectTo = '/email-generator'
      if (state) {
        try {
          const parsedState = JSON.parse(state)
          if (parsedState.redirectedFrom && parsedState.redirectedFrom !== '/') {
            redirectTo = parsedState.redirectedFrom
          }
        } catch (error) {
          console.error('Error parsing state parameter:', error)
        }
      }
      
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
      
    } catch (error) {
      console.error('Error in authentication callback:', error)
      return NextResponse.redirect(
        new URL('/sign-in?error=Failed to authenticate', requestUrl.origin)
      )
    }
  }

  // URL to redirect to after sign in process completes (fallback)
  return NextResponse.redirect(new URL('/email-generator', requestUrl.origin))
} 