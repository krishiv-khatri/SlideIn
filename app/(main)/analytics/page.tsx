"use client"

import { ContentWrapper } from "@/components/content-wrapper"
import { BarChart3, ChevronRight } from "lucide-react"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <ContentWrapper>
      <div className="w-full">
        <AnalyticsDashboard />
      </div>
    </ContentWrapper>
  )
} 