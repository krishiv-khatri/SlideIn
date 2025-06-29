import type { Metadata } from "next"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { inter } from "@/app/fonts"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Authentication - SlideIn",
  description: "Sign in or sign up to SlideIn",
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <div className={`min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100 ${inter.className}`}>
        {/* Simple Header */}
        <header className="w-full py-4 border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/plane-logo.svg"
                alt="SlideIn Logo"
                width={36}
                height={36}
                className="w-9 h-9"
              />
              <Image
                src="/logo-text.svg"
                alt="SlideIn"
                width={100}
                height={36}
                className="h-7 w-auto"
              />
            </Link>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 flex items-center justify-center py-10 px-4 sm:py-12">
          <div className="w-full max-w-xl">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SlideIn. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
} 