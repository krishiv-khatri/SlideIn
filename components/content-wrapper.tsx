"use client"

import { ReactNode } from "react"
import { useSidebar } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"

interface ContentWrapperProps {
  children: ReactNode
  className?: string
}

export function ContentWrapper({ children, className = "" }: ContentWrapperProps) {
  const { state } = useSidebar()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  
  // Determine container class based on route
  let containerClass = ""
  if (pathname?.includes("email-generator")) {
    containerClass = "email-generator-container"
  } else if (pathname?.includes("inbox")) {
    containerClass = "inbox-tracker-container"
  }
  
  // Add padding for inbox and analytics pages to match the spacing
  let paddingClass = ""
  if (pathname?.includes("inbox") || pathname?.includes("analytics")) {
    paddingClass = "py-8"
  }
  
  // Determine max-width based on route and mobile state
  let maxWidthClass = "max-w-4xl"
  if (pathname?.includes("email-generator")) {
    maxWidthClass = "max-w-full" // Allow email generator layout to control width
  }
  
  // On mobile, ensure full width
  if (isMobile) {
    maxWidthClass = "max-w-full w-full"
  }
  
  return (
    <div 
      className={`
        w-full flex flex-col items-center transition-all duration-300 
        ${containerClass} 
        ${paddingClass}
        ${isMobile ? 'px-0' : 'px-4'}
        ${className}
      `}
      data-sidebar-state={state}
      data-mobile={isMobile}
    >
      <div className={`w-full ${maxWidthClass} mx-auto transition-none`}>
        {children}
      </div>
    </div>
  )
}