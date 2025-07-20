"use client"

import Link from "next/link"
import Image from "next/image"
import { TypingAnimation } from "@/components/typing-animation"
import { 
  motion, 
  AnimatePresence,
  Variants
} from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, ArrowRight, Mail, Zap, Shield, Users, TrendingUp, MessageSquare, Target, Award, Globe } from "lucide-react"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const itemFade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}



// University logos ordered for maximum exposure and color contrast
const universityLogos = [
  { name: "Stanford", src: "/university-logos/Stanford_logo.png" }, // Red - high prestige, great exposure
  { name: "NYU", src: "/university-logos/NYU_logo.png" }, // Purple - contrasts with red
  { name: "UC Berkeley", src: "/university-logos/Berkeley_logo.png" }, // Blue/Gold - top tier
  { name: "Texas", src: "/university-logos/Texas_logo.png" }, // Orange - contrasts with blue
  { name: "UCLA", src: "/university-logos/UCLA__logo.png" }, // Blue/Gold - high prestige
  { name: "UMich", src: "/university-logos/UMich_logo.png" }, // Blue/Yellow - contrasts well
  { name: "Georgia Tech", src: "/university-logos/Georgia_Tech_logo.png" }, // Gold/Navy - good contrast
  { name: "OSU", src: "/university-logos/OSU_logo.png" }, // Red/Gray - contrasts with gold
  { name: "Boston University", src: "/university-logos/Boston_logo.png" }, // Red/White - good visibility
  { name: "UCSD", src: "/university-logos/UCSD_logo.png" }, // Blue/Gold - contrasts with red
  { name: "UIUC", src: "/university-logos/UIUC_logo.png" }, // Orange/Blue - good contrast
  { name: "Purdue", src: "/university-logos/Purdue_logo.png" }, // Gold/Black - contrasts well
  { name: "Rutgers", src: "/university-logos/Rutgers_logo.png" }, // Red/Black - good contrast
  { name: "HKU", src: "/university-logos/HKU_logo.png" }, // Green/Gold - unique color ending
];

export function LandingPageClient({ satoshiClassName }: { satoshiClassName: string }) {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6"
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/plane-logo.svg"
              alt="SlideIn Logo"
              width={isMobile ? 28 : 40}
              height={isMobile ? 28 : 40}
              className={isMobile ? "w-7 h-7" : "w-10 h-10"}
            />
            <Image
              src="/logo-text.svg"
              alt="SlideIn"
              width={isMobile ? 90 : 120}
              height={isMobile ? 28 : 40}
              className={isMobile ? "h-5 w-auto" : "h-8 w-auto"}
            />
          </Link>
          
          <div className="flex items-center space-x-3 md:space-x-6">
            <Link
              href="/sign-in"
              className={`text-gray-600 hover:text-pink-500 transition-colors ${isMobile ? 'text-sm' : ''}`}
            >
              Sign In
            </Link>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/sign-up"
                className={`bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors ${isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'}`}
              >
                Sign Up
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="container mx-auto px-6 sm:px-8 lg:px-8 pt-12 pb-16 md:pt-16 md:pb-20"
      >
        <div className="text-center space-y-8 md:space-y-10">
          <TypingAnimation />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <h1 className={`text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 md:mb-8 tracking-tight ${satoshiClassName}`}>
              Your AI Cold Outreach Assistant
            </h1>
            <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto px-1">
              Get faster responses with automated, personalized cold outreach. Perfect for sales, networking, business development, freelancing, and building meaningful professional connections.
            </p>
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-8"
          >
            <div className="flex items-center">
              <span className="text-pink-500 font-semibold">1,000+</span>
              <span className="ml-1">professionals trust SlideIn</span>
            </div>
            <div className="flex items-center ml-4">
              <span className="text-green-500">⭐⭐⭐⭐⭐</span>
              <span className="ml-1 text-gray-500">(4.9/5)</span>
            </div>
          </motion.div>

          <motion.div 
            className="flex flex-col md:flex-row justify-center md:gap-4 space-y-4 md:space-y-0 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.div 
              whileHover={{ scale: isMobile ? 1.02 : 1.05 }} 
              whileTap={{ scale: 0.98 }}
              className="w-full md:w-auto"
            >
              <Link
                href="/sign-up"
                className="bg-pink-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-pink-600 transition-colors block text-center w-full md:w-auto"
              >
                Try It Free
              </Link>
            </motion.div>
            <motion.div 
              whileHover={{ scale: isMobile ? 1.02 : 1.05 }} 
              whileTap={{ scale: 0.98 }}
              className="w-full md:w-auto"
            >
              <Link
                href="/sign-in"
                className="bg-white text-pink-500 px-8 py-4 rounded-lg font-semibold border border-pink-500 hover:bg-pink-50 transition-colors block text-center w-full md:w-auto"
              >
                Login
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

              {/* Trusted by Universities */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="py-16 md:py-20 bg-gradient-to-b from-gray-50/50 to-white"
        >
          <div className="container mx-auto px-4">
            <h2 className={`${satoshiClassName} text-lg md:text-xl font-medium text-center text-gray-600 mb-16`}>
              Trusted by students and professionals at
            </h2>
            
            <div 
              className="relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
              style={{ height: '240px', paddingTop: '30px', paddingBottom: '30px' }}
              onMouseDown={(e) => {
                e.preventDefault();
                const container = e.currentTarget.querySelector('.carousel-track') as HTMLElement;
                if (!container) return;
                
                const startX = e.pageX;
                let isDragging = false;
                
                // Get current transform value
                const computedStyle = window.getComputedStyle(container);
                const matrix = computedStyle.transform;
                let currentTranslate = 0;
                
                if (matrix !== 'none') {
                  const matrixValues = matrix.split('(')[1].split(')')[0].split(',');
                  currentTranslate = parseFloat(matrixValues[4]) || 0;
                }
                
                // Pause animation
                container.style.animationPlayState = 'paused';
                
                const handleMouseMove = (moveEvent: MouseEvent) => {
                  moveEvent.preventDefault();
                  isDragging = true;
                  const x = moveEvent.pageX - startX;
                  const newTranslate = currentTranslate + x;
                  container.style.transform = `translateX(${newTranslate}px)`;
                };
                
                const handleMouseUp = () => {
                  if (!isDragging) {
                    // Resume animation immediately if no dragging occurred
                    container.style.animationPlayState = 'running';
                  } else {
                    // Resume animation after a short delay
                    setTimeout(() => {
                      container.style.animationPlayState = 'running';
                    }, 1000);
                  }
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
              onDragStart={(e) => e.preventDefault()}
            >
              <div 
                className="flex animate-scroll-faster hover:animation-play-state-paused carousel-track"
                style={{ 
                  width: `${universityLogos.length * (180 + 8) * 2}px`,
                  willChange: 'transform'
                }}
              >
                {/* First set of logos */}
                {universityLogos.map((logo, index) => (
                  <motion.div
                    key={`first-${index}`}
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{ 
                      width: '180px', 
                      height: '100px',
                      marginRight: index === universityLogos.length - 1 ? '0px' : '8px'
                    }}
                    whileHover={{ 
                      scale: 1.1,
                      y: -8,
                      transition: { 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 20 
                      }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={logo.src}
                      alt={`${logo.name} logo`}
                      width={180}
                      height={100}
                      className="w-full h-full object-contain select-none"
                      style={{ filter: 'none', userSelect: 'none' }}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </motion.div>
                ))}
                
                {/* Duplicate set for seamless loop */}
                {universityLogos.map((logo, index) => (
                  <motion.div
                    key={`second-${index}`}
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{ 
                      width: '180px', 
                      height: '100px',
                      marginLeft: index === 0 ? '8px' : '0px',
                      marginRight: index === universityLogos.length - 1 ? '0px' : '8px'
                    }}
                    whileHover={{ 
                      scale: 1.1,
                      y: -8,
                      transition: { 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 20 
                      }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={logo.src}
                      alt={`${logo.name} logo`}
                      width={180}
                      height={100}
                      className="w-full h-full object-contain select-none"
                      style={{ filter: 'none', userSelect: 'none' }}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

      {/* Features Section */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20"
      >
        <div className="text-center mb-12">
          <h2 className={`${satoshiClassName} text-3xl md:text-4xl font-bold text-gray-900 mb-4`}>
            Everything you need for successful outreach
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Whether you're in sales, freelancing, or building your network, SlideIn provides the tools you need to get responses.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <motion.div 
            variants={itemFade}
            className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100"
            whileHover={{ y: isMobile ? -2 : -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-3xl mb-4">📈</div>
            <h3 className={`${satoshiClassName} text-xl font-bold mb-2 md:mb-3`}>Real-Time Tracking</h3>
            <p className="text-gray-600 mb-2 font-medium">Know exactly when prospects engage.</p>
            <p className="text-gray-500 text-sm md:text-base">
              Get instant notifications on email opens and replies. Never wonder if your message was seen again.
            </p>
          </motion.div>
          <motion.div 
            variants={itemFade}
            className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100"
            whileHover={{ y: isMobile ? -2 : -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-3xl mb-4">🤖</div>
            <h3 className={`${satoshiClassName} text-xl font-bold mb-2 md:mb-3`}>AI-Powered Personalization</h3>
            <p className="text-gray-600 mb-2 font-medium">Write compelling emails in seconds.</p>
            <p className="text-gray-500 text-sm md:text-base">
              Our AI analyzes your prospect and suggests personalized messages that get responses, not spam folders.
            </p>
          </motion.div>
          <motion.div 
            variants={itemFade}
            className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100"
            whileHover={{ y: isMobile ? -2 : -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-3xl mb-4">🔁</div>
            <h3 className={`${satoshiClassName} text-xl font-bold mb-2 md:mb-3`}>Smart Follow-Ups</h3>
            <p className="text-gray-600 mb-2 font-medium">Never let opportunities slip away.</p>
            <p className="text-gray-500 text-sm md:text-base">
              Automated, perfectly timed follow-ups that feel personal. Stay top-of-mind without being pushy.
            </p>
          </motion.div>
        </div>
      </motion.div>



      {/* How It Works Section */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 bg-gray-50"
      >
        <h2 className={`${satoshiClassName} text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12`}>How It Works</h2>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {[
            { number: 1, title: "Connect", description: "Link your email in seconds" },
            { number: 2, title: "Personalize", description: "AI crafts your message" },
            { number: 3, title: "Send & Track", description: "Monitor engagement live" },
            { number: 4, title: "Follow Up", description: "Automated smart sequences" },
          ].map((step, index) => (
            <motion.div 
              key={index}
              variants={itemFade}
              className="text-center"
              whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3 md:mb-4">
                {step.number}
              </div>
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">{step.title}</h3>
              <p className="text-gray-600 text-xs md:text-sm">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
        className="py-16 md:py-20 bg-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`${satoshiClassName} text-3xl md:text-4xl font-bold text-gray-900 mb-4`}>
              Proven Results
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Join thousands of professionals who've transformed their outreach with SlideIn
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <motion.div 
              variants={staggerContainer}
              className="flex flex-wrap justify-center items-center gap-8 md:gap-12"
            >
              <motion.div 
                variants={itemFade} 
                className="flex flex-col items-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl min-w-[180px]"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-pink-500 mb-2">1,000+</div>
                <div className="text-gray-700 font-medium text-center">Active Users</div>
                <div className="text-gray-500 text-sm mt-1">Growing daily</div>
              </motion.div>

              <motion.div 
                variants={itemFade} 
                className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl min-w-[180px]"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-green-500 mb-2">40%</div>
                <div className="text-gray-700 font-medium text-center">Higher Response Rate</div>
                <div className="text-gray-500 text-sm mt-1">vs. traditional methods</div>
              </motion.div>

              <motion.div 
                variants={itemFade} 
                className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl min-w-[180px]"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-blue-500 mb-2">50K+</div>
                <div className="text-gray-700 font-medium text-center">Emails Sent</div>
                <div className="text-gray-500 text-sm mt-1">This month</div>
              </motion.div>

              <motion.div 
                variants={itemFade} 
                className="flex flex-col items-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl min-w-[180px]"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-yellow-500 mb-2">4.9/5</div>
                <div className="text-gray-700 font-medium text-center">User Rating</div>
                <div className="text-gray-500 text-sm mt-1">⭐⭐⭐⭐⭐</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Use Cases Section */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20"
      >
        <div className="text-center mb-12">
          <h2 className={`${satoshiClassName} text-3xl md:text-4xl font-bold text-gray-900 mb-4`}>
            Perfect for every professional
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Whether you're growing your business, finding opportunities, or building relationships, SlideIn adapts to your needs.
          </p>
        </div>
        
        <motion.div 
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            {
              icon: "💼",
              title: "Sales Professionals",
              description: "Close more deals with personalized prospecting and smart follow-ups that convert."
            },
            {
              icon: "🎯",
              title: "Business Development",
              description: "Build strategic partnerships and expand your network with targeted outreach."
            },
            {
              icon: "🚀",
              title: "Freelancers & Consultants",
              description: "Land more clients by standing out in crowded inboxes with personalized proposals."
            },
            {
              icon: "🎓",
              title: "Career Advancement",
              description: "Connect with mentors, recruiters, and industry leaders to accelerate your career."
            },
            {
              icon: "🤝",
              title: "Networking",
              description: "Build meaningful professional relationships with authentic, personalized outreach."
            },
            {
              icon: "📈",
              title: "Entrepreneurs",
              description: "Raise funding, find partners, and grow your business through strategic connections."
            }
          ].map((useCase, index) => (
            <motion.div
              key={index}
              variants={itemFade}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="text-2xl mb-4">{useCase.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{useCase.title}</h3>
              <p className="text-gray-600 text-sm">{useCase.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Subtle Usage Info */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-600 text-xs md:text-sm">
            SlideIn is designed for personal, one-to-one professional communication — helping you build authentic relationships through thoughtful outreach. 
            <span className="opacity-75"> Not intended for bulk email or marketing campaigns.</span>
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
        className="container mx-auto px-6 sm:px-8 lg:px-8 py-16 md:py-20"
      >
        <motion.div 
          className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-8 md:p-12 text-center"
          whileHover={{ scale: isMobile ? 1.005 : 1.01 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <h2 className={`${satoshiClassName} text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6`}>
            Ready to Transform Your Outreach?
          </h2>
          <p className="text-white/90 mb-8 md:mb-10 max-w-2xl mx-auto text-sm md:text-base">
            Join 1,000+ professionals who've increased their response rates by 40% with personalized, intelligent cold outreach.
          </p>
          <motion.div 
            whileHover={{ scale: isMobile ? 1.02 : 1.05 }} 
            whileTap={{ scale: 0.98 }}
            className="w-full md:w-auto inline-block"
          >
            <Link
              href="/sign-up"
              className="bg-white text-pink-500 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block w-full md:w-auto"
            >
              Try It Free
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {/* Logo and Description - Full width on mobile */}
            <motion.div 
              variants={itemFade}
              className="col-span-2"
            >
              <Link href="/" className="flex items-center space-x-2 mb-3 md:mb-4">
                <Image
                  src="/plane-logo.svg"
                  alt="SlideIn Logo"
                  width={28}
                  height={28}
                  className="w-7 h-7 md:w-8 md:h-8"
                />
                <Image
                  src="/logo-text.svg"
                  alt="SlideIn"
                  width={84}
                  height={28}
                  className="h-5 md:h-6 w-auto"
                />
              </Link>
              <p className="text-gray-500 text-xs md:text-sm">
                Transform your cold outreach with AI-powered personalization and smart tracking.
                Connect with more people, build better relationships.
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemFade}>
              <h3 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Product</h3>
              <ul className="space-y-1 md:space-y-2">
                <li>
                  <span className="text-gray-400 text-xs md:text-sm cursor-not-allowed">
                    Features
                  </span>
                </li>
                <li>
                  <span className="text-gray-400 text-xs md:text-sm cursor-not-allowed">
                    Pricing
                  </span>
                </li>
                <li>
                  <span className="text-gray-400 text-xs md:text-sm cursor-not-allowed">
                    Get Started
                  </span>
                </li>
              </ul>
            </motion.div>

            {/* Legal Links */}
            <motion.div variants={itemFade}>
              <h3 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Legal</h3>
              <ul className="space-y-1 md:space-y-2">
                <li>
                  <Link href="/privacy-policy" className="text-gray-500 hover:text-pink-500 text-xs md:text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400 text-xs md:text-sm cursor-not-allowed">
                    Terms of Service
                  </span>
                </li>
              </ul>
            </motion.div>

            {/* Contact Information - Full width on mobile */}
            <motion.div 
              variants={itemFade}
              className="col-span-2 md:col-span-1"
            >
              <h3 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Contact Us</h3>
              <ul className="space-y-1 md:space-y-2">
                <li>
                  <motion.a 
                    whileHover={{ x: 2 }}
                    href="mailto:contact@slidein.now" 
                    className="text-gray-500 hover:text-pink-500 text-xs md:text-sm"
                  >
                    contact@slidein.now
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    whileHover={{ x: 2 }}
                    href="mailto:khatrikrishiv@gmail.com" 
                    className="text-gray-500 hover:text-pink-500 text-xs md:text-sm"
                  >
                    khatrikrishiv@gmail.com
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    whileHover={{ x: 2 }}
                    href="mailto:aditya.jain2702@gmail.com" 
                    className="text-gray-500 hover:text-pink-500 text-xs md:text-sm"
                  >
                    aditya.jain2702@gmail.com
                  </motion.a>
                </li>
              </ul>
            </motion.div>
          </motion.div>

          {/* Bottom Section */}
          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-xs md:text-sm">© {new Date().getFullYear()} SlideIn. All rights reserved.</p>
              
              {/* Social Links */}
              <div className="flex space-x-6 mt-4 md:mt-0">
                <span className="text-gray-400 cursor-not-allowed">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </span>

                <span className="text-gray-400 cursor-not-allowed">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </span>

                <span className="text-gray-400 cursor-not-allowed">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 