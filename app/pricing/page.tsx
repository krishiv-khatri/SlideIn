"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { satoshi } from "@/app/fonts";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";

const plans = [
  {
    name: "🔓 Free",
    price: "$0",
    period: "month",
    description: "Try before you commit",
    features: [
      "5 emails/month",
      "Basic tracking",
      "AI-written messages",
    ],
    cta: "Get Started",
    href: "/sign-up",
    popular: false,
  },
  {
    name: "🚀 Pro",
    price: "$9.99",
    period: "month",
    description: "No risk. Cancel anytime.",
    features: [
      "Unlimited emails",
      "Full open/reply tracking",
      "Auto follow-ups",
      "Priority feature access",
    ],
    cta: "Upgrade to Pro",
    href: "/sign-up?plan=pro",
    popular: true,
  },
  {
    name: "🧑‍🎓 Student",
    price: "$4.99",
    period: "month",
    description: "Launching July 2025",
    features: [
      "Affordable access",
      "Verified university emails",
      "All Pro features",
    ],
    cta: "Join Waitlist",
    href: "#",
    popular: false,
    disabled: true,
  },
  {
    name: "👥 Teams",
    price: "Coming Soon",
    period: "",
    description: "Launching Q3 2025",
    features: [
      "Shared credits",
      "Team dashboards",
      "Custom domains",
    ],
    cta: "Join Waitlist",
    href: "#",
    popular: false,
    disabled: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <div className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={`text-5xl font-extrabold text-gray-900 mb-4 tracking-tight ${satoshi.className}`}>
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for students, job seekers, and founders.
            </p>
          </motion.div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex"
              >
                <Card className={`relative flex flex-col w-full p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow ${plan.popular ? 'border-pink-500 border-2' : ''}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-2 -right-2 bg-pink-500">
                      Most Popular
                    </Badge>
                  )}
                  
                  <div className="mb-6">
                    <h3 className={`text-2xl font-bold mb-2 ${satoshi.className}`}>{plan.name}</h3>
                    <div className="mt-2">
                      <span className={`text-4xl font-bold ${satoshi.className}`}>{plan.price}</span>
                      {plan.period && (
                        <span className="text-gray-600">/{plan.period}</span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-2">
                      {plan.description}
                    </p>
                  </div>

                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-pink-500 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div>
                    <Link href={plan.href} className="block">
                      <Button 
                        className={`w-full ${plan.popular ? 'bg-pink-500 hover:bg-pink-600 text-white' : ''}`}
                        variant={plan.popular ? "default" : "outline"}
                        disabled={plan.disabled}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="max-w-7xl mx-auto bg-pink-500 rounded-2xl p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className={`text-3xl font-bold text-white mb-4 ${satoshi.className}`}>
              Ready to Write Better Cold Emails?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Join people who are already getting more responses with SlideIn's smart email assistant.
            </p>
            <Link href="/sign-up">
              <Button 
                className="bg-white text-pink-500 hover:bg-gray-100"
                size="lg"
              >
                Try It Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
} 