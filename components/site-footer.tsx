"use client";

import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/plane-logo.svg"
                alt="SlideIn Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <Image
                src="/logo-text.svg"
                alt="SlideIn"
                width={96}
                height={32}
                className="h-6 w-auto"
              />
            </Link>
            <p className="text-gray-500 text-sm">
              Write better cold emails, track responses, and never miss a follow-up.
              Connect with more people, without the busywork.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/pricing" className="text-gray-500 hover:text-pink-500 text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-500 hover:text-pink-500 text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-gray-500 hover:text-pink-500 text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-gray-400 text-sm cursor-not-allowed">
                  Features
                </span>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sign-in" className="text-gray-500 hover:text-pink-500 text-sm transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="text-gray-500 hover:text-pink-500 text-sm transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-gray-500 hover:text-pink-500 text-sm transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
} 