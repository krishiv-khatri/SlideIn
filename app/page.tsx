import { satoshi } from "./fonts"
import { LandingPageClient } from "@/components/landing-page-client"
import { Suspense } from "react"
import { LoadingFallback } from "@/components/loading-fallback"

export default function LandingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LandingPageClient satoshiClassName={satoshi.className} />
    </Suspense>
  )
} 