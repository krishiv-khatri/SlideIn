"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { OnboardingFlow, OnboardingSubmission } from "@/components/onboarding-flow"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export default function ContextPage() {
  const [saving, setSaving] = useState(false)

  const handleFinish = async (data: OnboardingSubmission) => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: userRes } = await supabase.auth.getUser()
      const user = userRes?.user
      const metadata = {
        onboarding_purpose: data.purpose,
        onboarding_completed: true,
        onboarding_payload: data,
      }
      if (user) {
        const { error } = await supabase.auth.updateUser({ data: metadata as any })
        if (error) throw error
        toast.success("Context saved to profile")
      } else {
        localStorage.setItem("slidein_onboarding", JSON.stringify(metadata))
        toast.success("Context saved locally")
      }
    } catch (e) {
      toast.error("Failed to save context")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      <Card className="border border-gray-200 rounded-xl">
        <CardContent className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Your Context</h1>
            <p className="text-sm text-gray-500">Update your purpose and context. This guides how emails are generated.</p>
          </div>
          <OnboardingFlow onFinish={handleFinish} />
        </CardContent>
      </Card>
    </div>
  )
}


