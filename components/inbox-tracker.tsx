"use client"

import { useEffect, useState } from "react"
import { Archive, Edit, RefreshCcw, Search, AlertCircle, CheckCircle2, Clock, Star, MoreHorizontal, Filter, ChevronRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createBrowserClient } from "@supabase/ssr"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { LoadingState } from "@/components/ui/loading-state"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface EmailEvent {
  id: string
  email_id: string
  recipient_email: string
  subject: string
  status: 'Sent' | 'Opened'
  opens: number
  last_opened: string | null
  sent_at: string
  starred?: boolean
  false_positive_logs?: Array<{timestamp: string, seconds_after_send: number}>
}

const statusMap = {
  "Sent": { label: "Sent", color: "slate", icon: <Clock className="w-3.5 h-3.5 mr-1.5" /> },
  "Opened": { label: "Opened", color: "green", icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> },
}

// Minimum time in seconds after email is sent to consider an open legitimate
const MIN_TIME_AFTER_SEND_SECONDS = 5;

export function InboxTracker() {
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [emails, setEmails] = useState<EmailEvent[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [starredEmails, setStarredEmails] = useState<Record<string, boolean>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Only count opens after the first (ignore the first open)
  const hasLegitimateOpens = (email: EmailEvent): boolean => {
    return email.opens > 1;
  };
  
  // Function to get filtered/corrected opens count
  const getLegitimateOpensCount = (email: EmailEvent): number => {
    return email.opens > 1 ? email.opens - 1 : 0;
  };
  
  // Function to get effective status considering false positives
  const getEffectiveStatus = (email: EmailEvent): 'Sent' | 'Opened' => {
    return email.opens > 1 ? 'Opened' : 'Sent';
  };

  const fetchEmails = async () => {
    setIsLoading(true)
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Authentication error:', authError)
        toast.error('You need to be logged in to view your email tracking data')
        setEmails([])
        setIsLoading(false)
        return
      }
      
      // Fetch emails from email_events table - RLS will automatically filter by user_id
      const { data: emailEvents, error } = await supabase
        .from('email_events')
        .select('*')
        .order('sent_at', { ascending: false })

      if (error) {
        throw error
      }

      // Load starred status from localStorage
      const savedStarred = localStorage.getItem('starredEmails')
      if (savedStarred) {
        try {
          setStarredEmails(JSON.parse(savedStarred))
        } catch (e) {
          console.error('Error parsing starred emails', e)
        }
      }

      setEmails(emailEvents || [])
    } catch (error) {
      console.error('Error fetching email events:', error)
      toast.error('Failed to load email tracking data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEmails()
  }, [])

  const toggleStar = (emailId: string) => {
    const newStarredEmails = { ...starredEmails }
    newStarredEmails[emailId] = !newStarredEmails[emailId]
    setStarredEmails(newStarredEmails)
    
    // Save to localStorage
    localStorage.setItem('starredEmails', JSON.stringify(newStarredEmails))
    
    // Show toast feedback
    if (newStarredEmails[emailId]) {
      toast.success('Email marked as important')
    } else {
      toast.success('Removed from important')
    }
  }

  const handleArchiveEmail = async (emailId: string) => {
    if (!supabase) {
      toast.error('Database connection not available');
      return;
    }

    try {
      // Get current session for user ID
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user?.id) {
        console.error('Session error:', sessionError);
        toast.error('Authentication error. Please try signing in again.');
        return;
      }

      // Show loading toast
      toast.info('Archiving email...');

      // Delete from email_events table
      const { error: deleteError } = await supabase
        .from('email_events')
        .delete()
        .eq('id', emailId);

      if (deleteError) {
        console.error('Error deleting email:', deleteError);
        throw deleteError;
      }

      // Update local state
      setEmails(prevEmails => prevEmails.filter(email => email.id !== emailId));
      
      toast.success('Email archived successfully');
    } catch (error) {
      console.error('Error archiving email:', error);
      toast.error('Failed to archive email');
    }
  };

  const filteredEmails = emails.filter((email) => {
    // First apply tab filtering
    let passesTabFilter = true;
    if (activeTab === "opened") passesTabFilter = getEffectiveStatus(email) === "Opened";
    if (activeTab === "not-opened") passesTabFilter = getEffectiveStatus(email) === "Sent";
    
    // Then apply search filtering
    let passesSearchFilter = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      passesSearchFilter = 
        email.recipient_email.toLowerCase().includes(query) || 
        email.subject.toLowerCase().includes(query);
    }
    
    return passesTabFilter && passesSearchFilter;
  })

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery])

  // Calculate pagination values
  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEmails = filteredEmails.slice(startIndex, endIndex)

  const formatSentDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const exportToCSV = () => {
    // Convert the filtered emails to CSV format
    const headers = ['Recipient', 'Subject', 'Status', 'Opens', 'Last Opened', 'Sent']
    const csvData = filteredEmails.map(email => [
      email.recipient_email,
      email.subject,
      getEffectiveStatus(email),
      getLegitimateOpensCount(email),
      hasLegitimateOpens(email) ? email.last_opened : 'Not opened',
      email.sent_at
    ])
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `slidein-inbox-tracker-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Exported successfully')
  }

  return (
    <div className="inbox-tracker-container w-full space-y-4 mx-auto" style={{ maxWidth: "1600px" }}>
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <span className="text-gray-900 font-medium">SlideIn</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-pink-500 font-medium">Inbox Tracker</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 font-display">Inbox Tracker</h1>
          <p className="text-gray-500">Monitor your email campaigns and engagement</p>
        </div>
      </div>
      
      {/* Toolbar with filters, search, and refresh */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-2">
        <div className="min-w-60">
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-gray-100 p-1 rounded-full w-full">
              <TabsTrigger value="all" className="flex-1 rounded-full px-5 font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">All</TabsTrigger>
              <TabsTrigger value="opened" className="flex-1 rounded-full px-5 font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Opened</TabsTrigger>
              <TabsTrigger value="not-opened" className="flex-1 rounded-full px-5 font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Not Opened</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              className="pl-9 h-10 w-full text-sm rounded-full border-gray-200 focus:ring-pink-500 focus:border-pink-500" 
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-sm h-10 font-medium rounded-full border-gray-200 hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap" 
            onClick={exportToCSV}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-sm h-10 font-medium rounded-full border-gray-200 hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap" 
            onClick={fetchEmails}
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Email table container */}
      <Card className="border border-gray-100 shadow-sm bg-white rounded-xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingState text="Loading inbox data..." variant="minimal" size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="py-4 px-6 font-medium text-gray-500">To</TableHead>
                    <TableHead className="py-4 px-6 font-medium text-gray-500">Subject</TableHead>
                    <TableHead className="py-4 px-6 font-medium text-gray-500">Status</TableHead>
                    <TableHead className="py-4 px-6 font-medium text-gray-500 text-center">Opens</TableHead>
                    <TableHead className="py-4 px-6 font-medium text-gray-500">Last Opened</TableHead>
                    <TableHead className="py-4 px-6 font-medium text-gray-500">Sent</TableHead>
                    <TableHead className="py-4 px-6 font-medium text-gray-500 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentEmails.length > 0 ? (
                    currentEmails.map((email) => (
                      <TableRow key={email.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                        <TableCell className="py-4 px-6 font-medium text-gray-900">{email.recipient_email}</TableCell>
                        <TableCell className="py-4 px-6 text-gray-700 max-w-xs truncate">{email.subject}</TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge 
                            variant="outline" 
                            className={`flex items-center py-1 px-2.5 text-xs font-medium rounded-full ${
                              getEffectiveStatus(email) === "Opened" 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            {statusMap[getEffectiveStatus(email)]?.icon}
                            {statusMap[getEffectiveStatus(email)]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-semibold ${
                            getLegitimateOpensCount(email) > 0 ? "bg-pink-50 text-pink-600" : "bg-gray-50 text-gray-500"
                          }`}>
                            {getLegitimateOpensCount(email)}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-gray-500 text-sm">
                          {hasLegitimateOpens(email) ? formatSentDate(email.last_opened!) : 'Not opened'}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-gray-500 text-sm">{formatSentDate(email.sent_at)}</TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span 
                              className="cursor-pointer p-1"
                              onClick={() => toggleStar(email.id)}
                            >
                              <Star 
                                className={`h-4 w-4 ${starredEmails[email.id] ? 'fill-pink-500 text-pink-500' : 'text-gray-400 hover:text-pink-300'}`} 
                              />
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl border border-gray-200 shadow-lg p-1.5">
                                <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-2 py-1.5">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="my-1 bg-gray-100" />
                                <DropdownMenuItem className="text-sm flex items-center gap-2 cursor-not-allowed opacity-60 rounded-lg px-2 py-1.5 hover:bg-gray-50">
                                  <RefreshCcw className="h-4 w-4 text-gray-500" />
                                  <span className="flex-1">Follow-Up</span>
                                  <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">Soon</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-sm flex items-center gap-2 cursor-not-allowed opacity-60 rounded-lg px-2 py-1.5 hover:bg-gray-50">
                                  <Edit className="h-4 w-4 text-gray-500" />
                                  <span className="flex-1">View Details</span>
                                  <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">Soon</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 bg-gray-100" />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-sm flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-pink-50 hover:text-pink-600 group" onSelect={(e) => e.preventDefault()}>
                                      <Archive className="h-4 w-4 text-gray-500 group-hover:text-pink-600" />
                                      Archive
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Archive Email</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to archive this email? This action cannot be undone and the email will be permanently removed from your tracking list.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleArchiveEmail(email.id)} className="bg-pink-600 text-white hover:bg-pink-700">
                                        Archive
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <div className="bg-gray-50 p-4 rounded-full mb-4">
                            <AlertCircle className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 font-display">No emails found</h3>
                          <p className="mt-2 text-sm text-gray-500 max-w-md">
                            {activeTab !== "all" 
                              ? "No emails match your current filter." 
                              : "You haven't sent any tracked emails yet."}
                          </p>
                          {activeTab !== "all" && (
                            <Button 
                              onClick={() => setActiveTab("all")} 
                              variant="outline" 
                              size="sm" 
                              className="mt-4 rounded-full font-medium text-sm hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
                            >
                              View all emails
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-sm text-gray-500 flex items-center justify-between">
            <div>
              {filteredEmails.length > 0 ? (
                <>
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredEmails.length)} of {filteredEmails.length} emails
                  {totalPages > 1 && (
                    <span className="ml-2 text-gray-400">
                      (Page {currentPage} of {totalPages})
                    </span>
                  )}
                </>
              ) : (
                'No emails found'
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-4">
                {/* Previous/Next Navigation */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-3 rounded-full border-gray-200 hover:bg-gray-50"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3 rounded-full border-gray-200 hover:bg-gray-50"
                  >
                    Next
                  </Button>
                </div>

                {/* Page Info & Quick Navigation */}
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500">Page</span>
                  <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {Array.from({ length: totalPages }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-500">of {totalPages}</span>
                </div>

                {/* Quick Jump Options */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-xs text-gray-500 hover:text-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-xs text-gray-500 hover:text-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
