import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  // Get the needs_consent_check parameter from the URL
  const needsConsentCheck = requestUrl.searchParams.get('needs_consent_check')

  if (error) {
    console.error('Auth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(errorDescription || 'Authentication failed')}`, requestUrl.origin)
    )
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = await createClient()(cookieStore)
    
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
        return NextResponse.redirect(
          new URL(`/auth/consent?redirect_to=${encodeURIComponent('/email-generator')}`, requestUrl.origin)
        )
      }
      
      console.log('User has already accepted terms, proceeding to app')
    } catch (error) {
      console.error('Error in authentication callback:', error)
      return NextResponse.redirect(
        new URL('/sign-in?error=Failed to authenticate', requestUrl.origin)
      )
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/email-generator', requestUrl.origin))
} 