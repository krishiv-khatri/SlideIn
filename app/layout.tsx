import type { Metadata } from "next"
import { CustomToaster } from "@/components/ui/toast-config"
import { UserProvider } from "@/components/providers/user-provider"
import "./globals.css"
import { inter } from "./fonts"
import { EmojiProvider } from "@/components/providers/emoji-provider"

export const metadata: Metadata = {
  title: "SlideIn – AI Cold Email Tool for Outreach & Job Applications",
  description:
    "SlideIn is an AI-powered platform to generate, send, and track personalised cold emails. Built for job seekers, founders, and freelancers.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48 32x32 16x16" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.svg", sizes: "16x16", type: "image/svg+xml" },
      { url: "/favicon-192x192.svg", sizes: "192x192", type: "image/svg+xml" }
    ]
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


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" sizes="48x48 32x32 16x16" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-16x16.svg" sizes="16x16" type="image/svg+xml" />
        <link rel="icon" href="/favicon-192x192.svg" sizes="192x192" type="image/svg+xml" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <EmojiProvider>
          <UserProvider>
            {children}
            <CustomToaster />
          </UserProvider>
        </EmojiProvider>
      </body>
    </html>
  )
}
