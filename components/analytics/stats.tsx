import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Inbox, Flame, MessageSquare, ArrowRightLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: number | string
  description: string
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
  }
  color: 'pink' | 'orange' | 'blue' | 'purple'
}

const colorMap = {
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-950',
    text: 'text-pink-500',
    border: 'border-pink-100 dark:border-pink-900',
    hover: 'hover:border-pink-200 dark:hover:border-pink-800'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950',
    text: 'text-orange-500',
    border: 'border-orange-100 dark:border-orange-900',
    hover: 'hover:border-orange-200 dark:hover:border-orange-800'
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    text: 'text-blue-500',
    border: 'border-blue-100 dark:border-blue-900',
    hover: 'hover:border-blue-200 dark:hover:border-blue-800'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950',
    text: 'text-purple-500',
    border: 'border-purple-100 dark:border-purple-900',
    hover: 'hover:border-purple-200 dark:hover:border-purple-800'
  }
}

export function StatCard({ title, value, description, icon, trend, color }: StatCardProps) {
  const colors = colorMap[color]
  
  return (
    <Card className={`overflow-hidden border ${colors.border} shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-900 rounded-2xl ${colors.hover}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-display tracking-tight">{value}</h3>
              {trend && (
                <div className={`flex items-center text-sm font-medium ${trend.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trend.value >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="ml-1">{Math.abs(trend.value)}%</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          </div>
          <div className={`${colors.bg} p-3 rounded-xl`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TopPerformers({ campaigns }: { campaigns: any[] }) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Top Performing Campaigns</CardTitle>
            <CardDescription>Your most successful email campaigns</CardDescription>
          </div>
          <Badge variant="secondary" className="h-7">
            Last 30 days
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {campaigns.map((campaign, index) => (
            <div 
              key={index} 
              className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold
                ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 
                  index === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : 
                  'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'}
              `}>
                #{index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{campaign.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{campaign.subject}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Badge variant="secondary" className="h-6">
                    {campaign.openRate}% opens
                  </Badge>
                  <Badge variant="outline" className="h-6">
                    {campaign.replyRate}% replies
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function InsightsCard({ insights }: { insights: string[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">AI-Powered Insights</CardTitle>
            <CardDescription>Smart recommendations to improve performance</CardDescription>
          </div>
          <Badge variant="outline" className="h-7">
            Updated daily
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
            >
              <div className="mt-1 p-1.5 rounded-full bg-blue-100 dark:bg-blue-900">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ContactTable({ contacts }: { contacts: any[] }) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Contact Performance</CardTitle>
            <CardDescription>Individual engagement metrics</CardDescription>
          </div>
          <Badge variant="outline" className="h-7">
            Real-time data
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {contacts.map((contact, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://avatar.vercel.sh/${contact.email}`} />
                  <AvatarFallback>{contact.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {contact.name}
                    </h4>
                    <Badge variant="secondary" className="h-5">
                      {contact.company}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{contact.opened}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Opened</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{contact.replied}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Replied</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{contact.followUps}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Follow-ups</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 