"use client"

import { LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  comingSoon?: boolean
}

interface NavSecondaryProps {
  items: NavItem[]
  className?: string
}

export function NavSecondary({ items, className }: NavSecondaryProps) {
  const pathname = usePathname()
  const { state, setOpenMobile } = useSidebar()
  const isMobile = useIsMobile()
  
  const handleNavClick = (item: NavItem) => {
    // Don't close sidebar if it's a coming soon item
    if (item.comingSoon) return
    
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setOpenMobile(false)
    }
  }
  
  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel>Tools</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url
            const Icon = item.icon
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive}
                  tooltip={item.comingSoon ? `${item.title} (Coming Soon)` : item.title}
                  className="rounded-lg"
                >
                  <Link 
                    href={item.comingSoon ? "#" : item.url}
                    onClick={(e) => {
                      if (item.comingSoon) {
                        e.preventDefault()
                      } else {
                        handleNavClick(item)
                      }
                    }}
                    className={item.comingSoon ? "cursor-default opacity-70" : ""}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex items-center gap-2">
                      {item.title}
                      {item.comingSoon && state !== "collapsed" && (
                        <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                          Soon
                        </span>
                      )}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
} 