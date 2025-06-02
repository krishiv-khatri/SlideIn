import { Suspense } from "react"
import { SignInForm } from "@/components/auth/sign-in-form"
import { LoadingState } from "@/components/ui/loading-state"

export default function SignInPage() {
  return (
    <div className="w-full max-w-xl px-4">
      <Suspense 
        fallback={<LoadingState text="Loading sign in form..." variant="minimal" />}
        key="sign-in-suspense"
      >
        <SignInForm />
      </Suspense>
    </div>
  )
} 