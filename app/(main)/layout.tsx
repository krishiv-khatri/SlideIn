import type React from "react"
import type { Metadata } from "next"
import "@/app/globals.css"
import { ThemeWrapper } from "@/components/theme-wrapper"
import { inter } from "@/app/fonts"

export const metadata: Metadata = {
  title: "SlideIn – AI Cold Email Tool for Outreach & Job Applications",
  description:
    "SlideIn is an AI-powered platform to generate, send, and track personalised cold emails. Built for job seekers, founders, and freelancers.",
  icons: {
    icon: "/favicon.ico"
  },
  openGraph: {
    title: "SlideIn – AI Cold Email Tool for Outreach & Job Applications",
    description:
      "Send personalised cold emails with AI. Track opens, replies, and automate follow-ups – all in one tool.",
    url: "https://www.slidein.now",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SlideIn - AI Cold Email Tool"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "SlideIn – AI Cold Email Tool for Outreach & Job Applications",
    description:
      "SlideIn uses AI to write and send cold emails, track responses, and follow up automatically. Perfect for job seekers and founders.",
    images: ["/og-image.png"],
    creator: "@krishivkhatri"
  }
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeWrapper>
      {children}
    </ThemeWrapper>
  )
} 