"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"

export default function ConsentPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [properUseConsent, setProperUseConsent] = useState(false)
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect_to') || '/email-generator'
  const supabase = createClient()

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      
      if (!data.session) {
        router.push('/sign-in')
      }
    }
    
    checkAuth()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!privacyConsent || !properUseConsent) {
      setError("You must agree to all terms to continue")
      setIsLoading(false)
      return
    }

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error(userError?.message || "User not authenticated")
      }

      console.log('Saving consent for user:', user.id)

      // First check if a record already exists
      const { data: existingRecord } = await supabase
        .from('user_usage_agreements')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      let dbError = null

      if (existingRecord) {
        // Update existing record
        console.log('Updating existing consent record')
        const { error } = await supabase
          .from('user_usage_agreements')
          .update({ 
            privacy_accepted: privacyConsent,
            proper_use_accepted: properUseConsent,
          })
          .eq('user_id', user.id)
        dbError = error
      } else {
        // Insert new record
        console.log('Creating new consent record')
        const { error } = await supabase
          .from('user_usage_agreements')
          .insert([
            { 
              user_id: user.id, 
              privacy_accepted: privacyConsent,
              proper_use_accepted: properUseConsent,
            }
          ])
        dbError = error
      }

      if (dbError) {
        throw dbError
      }

      console.log('Consent saved successfully, redirecting to:', redirectTo)
      // Redirect to the original destination
      router.push(redirectTo)
    } catch (error: any) {
      console.error('Error saving consent:', error)
      setError(error.message || 'Failed to save consent')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-xl shadow-lg border-gray-200 rounded-xl overflow-hidden animate-slide-up">
      <CardHeader className="flex flex-col items-center pt-8 pb-6">
        <Image 
          src="/plane-logo.svg" 
          alt="SlideIn Logo" 
          width={90} 
          height={90} 
          className="mb-2"
        />
        <div className="text-center w-full">
          <h1 className="text-3xl font-bold">Just one more step</h1>
          <p className="text-muted-foreground text-base">Please review and agree to our terms</p>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="px-8 pb-6 space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-800 mb-2">Important - Please Read</h2>
            <p className="text-sm text-gray-700 mb-2">
              SlideIn is designed for <span className="font-medium">personal, one-to-one communication</span> — primarily for students, 
              early-career professionals, and job seekers looking to reach out to mentors, professors, recruiters, 
              or hiring managers for professional advice, networking, and career opportunities.
            </p>
            <p className="text-sm text-gray-700 font-medium">
              SlideIn is <span className="text-red-600">not to be used</span> for sending unsolicited commercial 
              bulk email, spam, or mass marketing outreach.
            </p>
          </div>
          
          <div className="flex items-center space-x-3 pt-2">
            <Checkbox 
              id="privacy" 
              checked={privacyConsent}
              onCheckedChange={(checked) => setPrivacyConsent(checked as boolean)}
              className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500" 
            />
            <Label htmlFor="privacy" className="text-sm font-normal leading-tight cursor-pointer">
              I agree to the{" "}
              <a href="/privacy-policy" className="text-pink-500 hover:text-pink-600 transition-colors" target="_blank">
                Privacy Policy
              </a>
              {" "}and consent to the processing of my data
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 pt-2">
            <Checkbox 
              id="proper-use" 
              checked={properUseConsent}
              onCheckedChange={(checked) => setProperUseConsent(checked as boolean)}
              className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500" 
            />
            <Label htmlFor="proper-use" className="text-sm font-normal leading-tight cursor-pointer">
              I confirm I will only use SlideIn for personal, one-to-one communication with contacts I have a legitimate reason to reach out to. I will not use SlideIn for unsolicited commercial bulk emails or spam.
            </Label>
          </div>
        </CardContent>
        <CardFooter className="px-8 pb-8">
          <Button 
            type="submit" 
            className="w-full h-11 bg-pink-500 hover:bg-pink-600 transition-all duration-200 shadow-sm text-base font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              "I Agree & Continue"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 