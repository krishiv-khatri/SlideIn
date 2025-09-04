"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { OnboardingFlow, OnboardingSubmission } from "@/components/onboarding-flow"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export default function OnboardingGate() {
  const [open, setOpen] = useState(false)
  const [initial, setInitial] = useState<any>(undefined)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        const user = data?.user
        if (user) {
          const completed = user.user_metadata?.onboarding_completed
          if (!completed) {
            setInitial({
              purpose: user.user_metadata?.onboarding_purpose ?? undefined,
            })
            setOpen(true)
          }
        } else {
          // fallback to local storage
          const raw = localStorage.getItem("slidein_onboarding")
          if (!raw) {
            setOpen(true)
          }
        }
      } catch (e) {
        // Non-blocking
      }
    }
    check()
    // also re-check on focus to catch fresh sign-ins
    const onFocus = () => check()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [supabase])

  const handleFinish = async (payload: OnboardingSubmission) => {
    try {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      const metadata = {
        onboarding_purpose: payload.purpose,
        onboarding_completed: true,
        onboarding_payload: payload,
      }
      if (user) {
        const { error } = await supabase.auth.updateUser({ data: metadata as any })
        if (error) throw error
      } else {
        localStorage.setItem("slidein_onboarding", JSON.stringify(metadata))
      }
      setOpen(false)
      toast.success("Onboarding completed")
    } catch (e) {
      toast.error("Failed to save onboarding")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[95vw] md:max-w-[90vw] lg:max-w-[80vw] h-[90vh] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-white to-pink-50 border-b border-gray-200 px-6 py-5">
          <DialogTitle className="text-xl font-bold text-gray-900">Let’s set up your context</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">We’ll tailor generation and tracking to your goals.</DialogDescription>
        </div>
        <div className="p-4 md:p-6 overflow-auto h-[calc(90vh-88px)]">
          <OnboardingFlow initial={initial} onFinish={handleFinish} />
        </div>
      </DialogContent>
    </Dialog>
  )
}


