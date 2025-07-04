"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Image from "next/image"
import { 
  BarChart3, 
  Edit3, 
  Inbox, 
  Settings, 
  Menu,
  TrendingUp,
  MailOpen
} from "lucide-react"
import { User as SupabaseUser } from '@supabase/supabase-js'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavLogo } from "./nav-logo"
import { createClient } from "@/utils/supabase/client"
import { Button } from "./ui/button"

interface AppSidebarProps {
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
  className?: string
}

// Helper function to format relative time
const formatTimeAgo = (timestamp: string): string => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  return `${Math.floor(diffInMinutes / 1440)}d ago`
}

export function AppSidebar({ 
  variant = "sidebar", 
  collapsible = "icon", 
  className 
}: AppSidebarProps) {
  const { state, toggleSidebar } = useSidebar()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [emailStats, setEmailStats] = useState({
    totalSent: 0,
    totalOpened: 0,
    recentActivity: [] as Array<{
      type: 'sent' | 'opened',
      timestamp: string,
      subject: string
    }>
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  // Fetch user data and email stats
  useEffect(() => {
    const fetchUserAndStats = async () => {
      setIsLoadingStats(true)
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      
      if (!error && data?.user) {
        setUser(data.user)
        
        try {
          // Fetch email statistics
          const { data: emailEvents, error: emailError } = await supabase
            .from('email_events')
            .select('*')
            .eq('user_id', data.user.id)
            .order('sent_at', { ascending: false })
            .limit(50)
          
          if (!emailError && emailEvents) {
            const totalSent = emailEvents.length
            // Only count legitimate opens (subtract 1 for false positive)
            const totalOpened = emailEvents.filter(e => e.status === 'Opened' && e.opens > 1).length
            
            // Get recent activity (last 5 events) - show all emails, but categorize properly
            const recentActivity = emailEvents
              .slice(0, 5)
              .map(event => ({
                type: event.opens > 1 ? 'opened' as const : 'sent' as const,
                timestamp: event.opens > 1 && event.last_opened ? event.last_opened : event.sent_at,
                subject: event.subject
              }))
            
            setEmailStats({
              totalSent,
              totalOpened,
              recentActivity
            })
          }
        } catch (error) {
          console.error('Error fetching email stats:', error)
        }
      }
      setIsLoadingStats(false)
    }
    
    fetchUserAndStats()
  }, [])
  
  // This effect will add a data attribute to the document body
  // which can be used for styling based on sidebar state
  useEffect(() => {
    document.body.setAttribute('data-sidebar-state', state)
    
    return () => {
      document.body.removeAttribute('data-sidebar-state')
    }
  }, [state])

  // Get user avatar URL - simplify to what worked before
  const getUserAvatar = (): string | undefined => {
    if (!user) return undefined;
    
    // Try to get URL from user_metadata first
    if (user.user_metadata?.picture) {
      return user.user_metadata.picture;
    }
    
    if (user.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    
    return undefined;
  };

  // Get the avatar URL
  const avatarUrl = getUserAvatar();

  // Set up sidebar data with user information
  const sidebarData = {
    user: {
      name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "User",
      email: user?.email || "loading@example.com",
      avatar: avatarUrl
    },
    navMain: [
      {
        title: "Email Generator",
        url: "/email-generator",
        icon: Edit3,
      },
      {
        title: "Inbox Tracker",
        url: "/inbox",
        icon: MailOpen,
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: TrendingUp,
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
    documents: [],
  }
  
  return (
    <Sidebar 
      collapsible={collapsible} 
      variant={variant}
      className={className || ''}
    >
      <SidebarHeader className="border-b border-border">
        <div className="flex h-14 items-center px-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-10 w-10 flex items-center justify-center hover:bg-accent ${state === "collapsed" ? "mx-auto" : ""}`}
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          {state !== "collapsed" && (
            <div className="ml-2 flex-1 flex items-center">
              <Link href="/email-generator">
                <Image
                  src="/plane-logo.svg"
                  alt="SlideIn Logo"
                  width={26}
                  height={26}
                />
              </Link>
              <img 
                src="/logo-text.svg" 
                alt="SlideIn" 
                className="ml-2 h-4"
              />
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <NavMain items={sidebarData.navMain} />
        

        {/* Recent Activity Section */}
        {state !== "collapsed" && (
          <div className="relative flex w-full min-w-0 flex-col p-2">
            <div className="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 mb-2">
              Recent Activity
            </div>
            <div className="space-y-3 px-2">
              {emailStats.recentActivity.length > 0 ? (
                emailStats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${activity.type === 'opened' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <div className="flex flex-col">
                      <span className="text-sidebar-foreground/80 text-xs font-medium leading-tight">
                        {activity.subject.length > 28 ? activity.subject.substring(0, 28) + '...' : activity.subject}
                      </span>
                      <span className="text-sidebar-foreground/50 text-xs">
                        {activity.type === 'opened' ? 'opened' : 'sent'} {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-sidebar-foreground/50 italic px-2">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        )}
        
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className={`border-t border-border ${state === "collapsed" ? "flex items-center justify-center py-4" : ""}`}>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
