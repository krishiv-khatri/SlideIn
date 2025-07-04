"use client"

import { useEffect, useState } from "react"
import { Inbox, Flame, MessageSquare, ArrowRightLeft, Eye } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import { LoadingState } from "@/components/ui/loading-state"
import { StatCard } from "./analytics/stats"
import { OpenRateChart, EmailFunnel, SubjectLineChart, EngagementHeatmap } from "./analytics/charts"
import { TopPerformers, InsightsCard, ContactTable } from "./analytics/stats"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

// Mock data for development - replace with real data from your API
const mockData = {
  openRateData: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    openRate: 20 + Math.random() * 30
  })),
  funnelData: [
    { name: "Sent", value: 1000 },
    { name: "Opened", value: 650 },
    { name: "Replied", value: 240 }
  ],
  subjectLines: [
    { subject: "Quick question about...", openRate: 45 },
    { subject: "Following up on our...", openRate: 38 },
    { subject: "Thought you might be...", openRate: 32 },
    { subject: "Ideas for improving...", openRate: 28 },
    { subject: "Let's connect about...", openRate: 25 }
  ],
  topCampaigns: [
    { name: "Q4 Outreach", subject: "Expanding your sales reach", openRate: 45, replyRate: 28 },
    { name: "Product Launch", subject: "Introducing our new feature", openRate: 42, replyRate: 25 },
    { name: "Follow-up Campaign", subject: "Quick follow-up", openRate: 38, replyRate: 22 }
  ],
  contacts: [
    { name: "Alex Thompson", email: "alex@company.com", company: "Tech Corp", opened: 12, replied: 5, followUps: 3 },
    { name: "Sarah Miller", email: "sarah@startup.io", company: "Startup.io", opened: 8, replied: 4, followUps: 2 },
    { name: "James Wilson", email: "james@enterprise.com", company: "Enterprise Ltd", opened: 15, replied: 7, followUps: 4 }
  ],
  insights: [
    "Emails sent between 9-11 AM have 2x higher open rates",
    "Subject lines with questions get 35% more replies",
    "Follow-ups within 48 hours increase response rate by 65%"
  ],
  engagementData: Array.from({ length: 7 }, () => ({
    name: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][Math.floor(Math.random() * 7)],
    engagement: Math.random()
  }))
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[140px] rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[400px] col-span-2 rounded-2xl" />
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[400px] col-span-2 rounded-2xl" />
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    </div>
  )
}



interface EmailMetrics {
  total_emails: number
  open_rate: number
  recent_opens: number
  avg_opens_per_email: number
}

interface DailyStats {
  date: string
  total: number
  opened: number
}

export function AnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isChartLoading, setIsChartLoading] = useState(false)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("7days")
  const [stats, setStats] = useState<EmailMetrics>({
    total_emails: 0,
    open_rate: 0,
    recent_opens: 0,
    avg_opens_per_email: 0
  })
  const [openRateData, setOpenRateData] = useState<Array<{ date: string; openRate: number }>>([])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchTrendData = async (timePeriod: string) => {
    setIsChartLoading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setOpenRateData([])
        return
      }

      const daysMap = {
        "7days": 7,
        "30days": 30,
        "90days": 90
      }
      
      const days = daysMap[timePeriod as keyof typeof daysMap] || 7

      // Generate the date range based on selected period
      const dateRange = Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (days - 1 - i))
        return date.toISOString().split('T')[0]
      })

      const { data: dailyStats, error: trendError } = await supabase.rpc('get_daily_email_stats', {
        days_ago: days
      }) as { data: DailyStats[] | null, error: any }

      if (trendError) {
        throw trendError
      }

      const trendData = dateRange.map(date => {
        const dayStats = dailyStats?.find((d: DailyStats) => d.date.startsWith(date)) || { total: 0, opened: 0 }
        const openRate = dayStats.total > 0 ? Math.round((dayStats.opened / dayStats.total) * 100) : 0

        // Format date differently based on time period for optimal readability
        let formattedDate: string
        const dateObj = new Date(date)
        
        if (timePeriod === "7days") {
          // Show weekday and date for 7 days (e.g., "Mon 15")
          formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
        } else if (timePeriod === "30days") {
          // Show month and date for 30 days (e.g., "Dec 15")
          formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        } else {
          // Show month and date for 90 days, but we'll use interval in chart to show fewer labels
          formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }

        return {
          date: formattedDate,
          openRate
        }
      })

      setOpenRateData(trendData)

    } catch (error) {
      console.error('Error fetching trend data:', error)
      toast.error('Failed to load chart data')
    } finally {
      setIsChartLoading(false)
    }
  }

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Authentication error:', authError)
        toast.error('You need to be logged in to view your analytics data')
        setStats({
          total_emails: 0,
          open_rate: 0,
          recent_opens: 0,
          avg_opens_per_email: 0
        })
        setIsLoading(false)
        return
      }

      // Query email_events table directly instead of using RPC function
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data: emailEvents, error: emailError } = await supabase
        .from('email_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('sent_at', thirtyDaysAgo.toISOString())

      if (emailError) {
        throw emailError
      }

      // Calculate metrics directly in frontend with false positive logic
      const totalEmails = emailEvents?.length || 0
      const openedEmails = emailEvents?.filter(email => email.opens > 1) || []
      const openedCount = openedEmails.length
      const openRate = totalEmails > 0 ? Math.round((openedCount / totalEmails) * 100 * 10) / 10 : 0
      
      // Calculate recent opens (last 24 hours)
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
      
      const recentOpens = emailEvents?.filter(email => 
        email.opens > 1 && 
        email.last_opened && 
        new Date(email.last_opened) >= twentyFourHoursAgo
      )?.length || 0
      
      // Calculate average legitimate opens per email (excluding false positive first opens)
      const totalLegitimateOpens = emailEvents?.reduce((sum, email) => {
        return sum + (email.opens > 1 ? email.opens - 1 : 0)
      }, 0) || 0
      
      const avgOpensPerEmail = openedCount > 0 ? Math.round((totalLegitimateOpens / openedCount) * 10) / 10 : 0

      setStats({
        total_emails: totalEmails,
        open_rate: openRate,
        recent_opens: recentOpens,
        avg_opens_per_email: avgOpensPerEmail
      })

      // Fetch initial trend data
      await fetchTrendData(selectedTimePeriod)

    } catch (error) {
      console.error('Error fetching email metrics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTimePeriodChange = async (timePeriod: string) => {
    setSelectedTimePeriod(timePeriod)
    await fetchTrendData(timePeriod)
  }

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('email_events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_events'
        },
        async () => {
          console.log('Email events changed, refreshing stats...')
          await fetchStats()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Set up periodic refresh (every 30 seconds)
  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    await fetchStats()
    toast.success('Analytics data refreshed')
  }

  return (
    <div className="analytics-dashboard-container w-full space-y-4 mx-auto pt-8" style={{ maxWidth: "1600px" }}>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <span className="text-gray-900 font-medium">SlideIn</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-pink-500 font-medium">Analytics</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1 font-display">Analytics</h1>
            <p className="text-gray-500">Track your email performance metrics and insights</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingState text="Loading analytics..." variant="minimal" size="lg" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Emails Card */}
            <Card className="overflow-hidden border border-gray-200 bg-white rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Emails</p>
                    <h3 className="mt-2 text-3xl font-bold text-gray-900 font-display">{stats.total_emails}</h3>
                    <p className="mt-1 text-xs text-gray-500">Last 30 days</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Inbox className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Open Rate Card */}
            <Card className="overflow-hidden border border-gray-200 bg-white rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Open Rate</p>
                    <h3 className="mt-2 text-3xl font-bold text-gray-900 font-display">{stats.open_rate}%</h3>
                    <p className="mt-1 text-xs text-gray-500">Avg {stats.avg_opens_per_email} opens per email</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <Eye className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card className="overflow-hidden border border-gray-200 bg-white rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Recent Opens</p>
                    <h3 className="mt-2 text-3xl font-bold text-gray-900 font-display">{stats.recent_opens}</h3>
                    <p className="mt-1 text-xs text-gray-500">Last 24 hours</p>
                  </div>
                  <div className="p-3 bg-pink-50 rounded-xl">
                    <Flame className="w-6 h-6 text-pink-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Open Rate Trend Chart */}
          <div className="mb-8">
            <OpenRateChart 
              data={openRateData}
              selectedPeriod={selectedTimePeriod}
              onTimePeriodChange={handleTimePeriodChange}
              isLoading={isChartLoading}
            />
          </div>

          {/* Coming Soon Section */}
          <div className="flex flex-col items-center justify-center text-center py-12">
            <p className="text-gray-400 text-sm">
              More analytics coming soon...
            </p>
          </div>
        </>
      )}
    </div>
  )
} 
