"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import { Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export function GoogleButton() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      
      // Get the redirect destination if any
      const redirectedFrom = searchParams.get('redirectedFrom')
      const state = redirectedFrom ? JSON.stringify({ redirectedFrom }) : undefined
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            ...(state && { state })
          }
        }
      })

      if (error) {
        console.error("Google sign in error:", error.message)
        throw error
      }
    } catch (error) {
      console.error('Error signing in with Google:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      suppressHydrationWarning
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <FcGoogle className="h-5 w-5" />
      )}
      Continue with Google
    </Button>
  )
} 