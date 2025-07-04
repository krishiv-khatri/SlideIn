import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, FunnelChart, Funnel, LabelList, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

const gradientColors = {
  pink: ['#FF80B5', '#FF3399'],
  blue: ['#60A5FA', '#2563EB'],
  purple: ['#C084FC', '#7C3AED'],
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200 rounded-xl shadow-xl ring-1 ring-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-pink-600"></div>
          <p className="text-sm font-semibold text-gray-900">{label}</p>
        </div>
        <p className="text-lg font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
          {payload[0].value.toFixed(1)}% open rate
        </p>
      </div>
    )
  }
  return null
}

export function OpenRateChart({ 
  data, 
  onTimePeriodChange,
  selectedPeriod = "7days",
  isLoading = false 
}: { 
  data: any[]
  onTimePeriodChange?: (period: string) => void
  selectedPeriod?: string
  isLoading?: boolean
}) {
  const handleTabChange = (value: string) => {
    onTimePeriodChange?.(value)
  }

  // Configure dots based on time period to reduce visual clutter
  const getDotConfig = () => {
    if (selectedPeriod === "7days") {
      return { 
        dot: { fill: gradientColors.pink[1], strokeWidth: 2, r: 4 },
        activeDot: { r: 6, fill: gradientColors.pink[0], strokeWidth: 2 }
      }
    } else if (selectedPeriod === "30days") {
      return { 
        dot: false, // No dots for 30 days to reduce clutter
        activeDot: { r: 5, fill: gradientColors.pink[0], strokeWidth: 2 }
      }
    } else {
      return { 
        dot: false, // No dots for 90 days to reduce clutter
        activeDot: { r: 5, fill: gradientColors.pink[0], strokeWidth: 1 }
      }
    }
  }

  const dotConfig = getDotConfig()

  const timeOptions = [
    { value: "7days", label: "7 days" },
    { value: "30days", label: "30 days" },
    { value: "90days", label: "90 days" }
  ]

  return (
    <Card className="col-span-2 border border-gray-200 bg-white rounded-xl">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Open Rate Trend
            </CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              Track your email performance over time
            </CardDescription>
          </div>
          
          {/* Minimal Time Period Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTabChange(option.value)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                  ${selectedPeriod === option.value 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[320px] w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-pink-200 border-t-pink-500"></div>
                <p className="text-sm text-gray-500">Loading chart data...</p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">No data available</p>
                  <p className="text-sm text-gray-500 mt-1">Send some emails to see your open rate trends</p>
                </div>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={gradientColors.pink[0]} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={gradientColors.pink[1]} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={gradientColors.pink[1]} />
                    <stop offset="100%" stopColor={gradientColors.pink[0]} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#f0f0f0" 
                  strokeOpacity={0.6}
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  tickLine={{ stroke: '#E5E7EB' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  interval={selectedPeriod === "90days" ? 6 : selectedPeriod === "30days" ? 3 : 0}
                />
                                 <YAxis 
                   stroke="#9CA3AF"
                   tick={{ fill: '#6B7280', fontSize: 11 }}
                   tickLine={{ stroke: '#E5E7EB' }}
                   axisLine={{ stroke: '#E5E7EB' }}
                   tickFormatter={(value) => `${value}%`}
                   domain={[0, 100]}
                 />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ stroke: gradientColors.pink[1], strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="openRate" 
                  stroke="url(#strokeGradient)"
                  strokeWidth={selectedPeriod === "7days" ? 3 : 2}
                  fill="url(#colorOpen)"
                  dot={dotConfig.dot}
                  activeDot={dotConfig.activeDot}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function EmailFunnel({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Email Journey</CardTitle>
            <CardDescription>From send to response</CardDescription>
          </div>
          <Badge variant="outline" className="h-7">
            Last 30 days
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip />
              <Funnel
                dataKey="value"
                data={data}
                isAnimationActive
                labelLine
              >
                <LabelList 
                  position="right" 
                  fill="#374151" 
                  stroke="none" 
                  dataKey="name"
                  fontSize={12}
                />
                {data.map((entry, index) => (
                  <Cell 
                    key={index} 
                    fill={gradientColors.blue[index % 2]}
                    className="hover:opacity-90 transition-opacity"
                  />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function SubjectLineChart({ data }: { data: any[] }) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Top Subject Lines</CardTitle>
            <CardDescription>Best performing email subjects</CardDescription>
          </div>
          <Badge variant="secondary" className="h-7">
            💫 Based on open rates
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical" 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                type="number" 
                stroke="#9CA3AF"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                dataKey="subject" 
                type="category" 
                width={150} 
                stroke="#9CA3AF"
                tick={{ fill: '#374151', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <Bar 
                dataKey="openRate" 
                radius={[0, 4, 4, 0]}
                className="hover:opacity-90 transition-opacity"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={index} 
                    fill={gradientColors.purple[index % 2]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function EngagementHeatmap({ data }: { data: any[] }) {
  const timeSlots = ['9am', '11am', '1pm', '3pm', '5pm']
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Best Send Times</CardTitle>
            <CardDescription>Optimal timing for engagement</CardDescription>
          </div>
          <Badge variant="outline" className="h-7">
            🕒 Updated daily
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-6 gap-2 text-xs font-medium text-gray-500">
            <div className="col-start-2 col-span-5 grid grid-cols-5">
              {timeSlots.map((time) => (
                <div key={time} className="text-center">{time}</div>
              ))}
            </div>
          </div>
          {days.map((day, i) => (
            <div key={day} className="grid grid-cols-6 gap-2">
              <div className="text-xs font-medium text-gray-500">{day}</div>
              {Array.from({ length: 5 }).map((_, j) => {
                const engagement = Math.random() // Replace with actual data
                return (
                  <div
                    key={j}
                    className="aspect-square rounded-md transition-colors"
                    style={{
                      backgroundColor: `rgba(219, 39, 119, ${engagement})`,
                    }}
                    title={`${day} ${timeSlots[j]}: ${Math.round(engagement * 100)}% engagement`}
                  />
                )
              })}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
          <span>Lower engagement</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-pink-100" />
            <div className="w-3 h-3 rounded bg-pink-300" />
            <div className="w-3 h-3 rounded bg-pink-500" />
            <div className="w-3 h-3 rounded bg-pink-700" />
          </div>
          <span>Higher engagement</span>
        </div>
      </CardContent>
    </Card>
  )
} 