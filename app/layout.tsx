import type { Metadata } from "next"
import { CustomToaster } from "@/components/ui/toast-config"
import { UserProvider } from "@/components/providers/user-provider"
import "./globals.css"
import { inter } from "./fonts"
import { EmojiProvider } from "@/components/providers/emoji-provider"

export const metadata: Metadata = {
  title: "SlideIn - AI-Powered Cold Email Tool",
  description: "Generate, send, and track cold emails with AI",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.svg', sizes: '16x16', type: 'image/svg+xml' },
      { url: '/favicon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-V4JE5M0V1K"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-V4JE5M0V1K');
            `,
          }}
        />
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet" />
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
