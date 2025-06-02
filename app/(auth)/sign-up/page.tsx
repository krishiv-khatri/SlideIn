import { SignUpForm } from "@/components/auth/sign-up-form"
import { Suspense } from "react"
import { LoadingState } from "@/components/ui/loading-state"

export default function SignUpPage() {
  return (
    <div className="w-full max-w-xl px-4">
      <Suspense 
        fallback={<LoadingState text="Loading sign up form..." variant="minimal" />}
        key="sign-up-suspense"
      >
        <SignUpForm />
      </Suspense>
    </div>
  )
} 