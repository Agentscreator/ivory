"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Ultra-Minimal Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled ? "bg-white/98 backdrop-blur-md border-b border-[#E8E8E8]" : "bg-white"
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <div className="flex items-center justify-between h-20 sm:h-24 lg:h-28">
            {/* Logo */}
            <div className="flex items-center">
              <span className="font-serif text-xl sm:text-2xl lg:text-3xl tracking-tight text-[#1A1A1A] font-light">
                IVORY'S CHOICE
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-12 lg:space-x-14">
              <a href="#experience" className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-500 font-light">Experience</a>
              <a href="#craft" className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-500 font-light">The Craft</a>
              <a href="#collection" className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-500 font-light">Collection</a>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex items-center space-x-4 sm:space-x-5">
              <button 
                onClick={() => router.push('/auth')}
                className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-500 hidden sm:block font-light"
              >
                Sign In
              </button>
              <Button 
                onClick={() => router.push('/auth?signup=true')}
                className="bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-700 ease-out px-6 sm:px-10 h-11 sm:h-12 text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98]"
              >
                Begin
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Screen Minimal */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 sm:pt-24 lg:pt-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8F7F5] via-white to-white" />
        
        <div className="relative max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-center">
            {/* Text Content */}
            <div className="space-y-10 sm:space-y-14 lg:space-y-16 text-center lg:text-left order-2 lg:order-1 animate-fade-in">
              <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light text-[#1A1A1A] leading-[1.05] tracking-[-0.02em]">
                  See It Before
                  <br />
                  <span className="italic">You Book</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-[#6B6B6B] leading-[1.7] max-w-xl mx-auto lg:mx-0 font-light tracking-wide">
                  Design it once. Get it right. Connect with nail techs who bring your vision to life.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center lg:justify-start pt-4">
                <Button 
                  onClick={() => router.push('/auth?signup=true')}
                  className="bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-700 ease-out px-10 sm:px-14 h-14 sm:h-16 text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started
                </Button>
              </div>
            </div>
            
            {/* Image */}
            <div className="relative order-1 lg:order-2 flex items-center justify-center animate-fade-in-delayed">
              <div className="relative w-full max-w-[300px] sm:max-w-[420px] lg:max-w-[540px] aspect-[16/9] mx-auto">
                <Image 
                  src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=450&fit=crop&q=80" 
                  alt="Elegant line art of hands with nail polish"
                  fill
                  className="object-contain transition-transform duration-1000 hover:scale-[1.02]"
                  priority
                  sizes="(max-width: 640px) 300px, (max-width: 1024px) 420px, 540px"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 hidden sm:block animate-bounce-slow">
          <div className="w-px h-20 bg-gradient-to-b from-[#1A1A1A] to-transparent opacity-40" />
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-20 sm:py-32 lg:py-40 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <div className="text-center mb-16 sm:mb-24 lg:mb-32 animate-fade-in-up">
            <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#8B7355] mb-6 sm:mb-8 font-light">Features</p>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-[#1A1A1A] tracking-[-0.01em] leading-[1.1]">
              What You Get
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 sm:gap-16 lg:gap-20">
            <div className="text-center space-y-6 sm:space-y-8 group animate-fade-in-up">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto border border-[#E8E8E8] flex items-center justify-center group-hover:border-[#8B7355] group-hover:scale-105 transition-all duration-700">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[#1A1A1A] group-hover:text-[#8B7355] transition-colors duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] font-light">Design It Once</h3>
                <p className="text-base sm:text-lg text-[#6B6B6B] leading-[1.7] font-light max-w-xs mx-auto tracking-wide">
                  Show us a photo or describe your vision. Get custom designs instantly.
                </p>
              </div>
            </div>

            <div className="text-center space-y-6 sm:space-y-8 group animate-fade-in-up animation-delay-200">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto border border-[#E8E8E8] flex items-center justify-center group-hover:border-[#8B7355] group-hover:scale-105 transition-all duration-700">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[#1A1A1A] group-hover:text-[#8B7355] transition-colors duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] font-light">Find Your Tech</h3>
                <p className="text-base sm:text-lg text-[#6B6B6B] leading-[1.7] font-light max-w-xs mx-auto tracking-wide">
                  Browse local techs. See their work, ratings, and open slots.
                </p>
              </div>
            </div>

            <div className="text-center space-y-6 sm:space-y-8 group sm:col-span-2 lg:col-span-1 animate-fade-in-up animation-delay-400">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto border border-[#E8E8E8] flex items-center justify-center group-hover:border-[#8B7355] group-hover:scale-105 transition-all duration-700">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[#1A1A1A] group-hover:text-[#8B7355] transition-colors duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] font-light">Less Explaining. Better Nails.</h3>
                <p className="text-base sm:text-lg text-[#6B6B6B] leading-[1.7] font-light max-w-xs mx-auto tracking-wide">
                  Book directly. Pay securely. Show up knowing exactly what you're getting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Craft Section */}
      <section id="craft" className="py-20 sm:py-32 lg:py-40 bg-[#F8F7F5]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <div className="text-center mb-16 sm:mb-24 lg:mb-32">
            <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#8B7355] mb-6 sm:mb-8 font-light">How It Works</p>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-[#1A1A1A] tracking-[-0.01em] mb-6 sm:mb-8 leading-[1.1]">
              Four Simple Steps
            </h2>
            <p className="text-base sm:text-lg text-[#6B6B6B] max-w-2xl mx-auto font-light leading-[1.7] tracking-wide">
              From idea to appointment in minutes
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16 lg:gap-20">
            {[
              { step: "1", title: "Show Us", desc: "Upload a photo or describe your idea" },
              { step: "2", title: "See Options", desc: "Get custom designs in seconds" },
              { step: "3", title: "Pick Your Tech", desc: "Find someone near you who gets it" },
              { step: "4", title: "Book It", desc: "Schedule and pay. Done." }
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="text-6xl sm:text-7xl lg:text-8xl font-serif font-light text-[#8B7355]/20 mb-6 sm:mb-8 group-hover:text-[#8B7355]/40 transition-all duration-700 group-hover:scale-110 origin-left">{item.step}</div>
                <h3 className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] mb-3 sm:mb-4 font-light">{item.title}</h3>
                <p className="text-base sm:text-lg text-[#6B6B6B] leading-[1.7] font-light tracking-wide">{item.desc}</p>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-16 -right-10 w-16 h-px bg-gradient-to-r from-[#E8E8E8] to-transparent opacity-50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collection Section */}
      <section id="collection" className="py-20 sm:py-32 lg:py-40 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <div className="text-center mb-16 sm:mb-24 lg:mb-32">
            <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#8B7355] mb-6 sm:mb-8 font-light">Pricing</p>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-[#1A1A1A] tracking-[-0.01em] leading-[1.1]">
              Choose Your Plan
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 max-w-6xl mx-auto">
            {/* Free */}
            <div className="border border-[#E8E8E8] p-8 sm:p-12 hover:border-[#8B7355] hover:shadow-2xl hover:shadow-[#8B7355]/5 transition-all duration-700 group">
              <div className="space-y-8 sm:space-y-10">
                <div>
                  <h3 className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] mb-4 sm:mb-5 font-light">Free</h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl lg:text-6xl font-light text-[#1A1A1A]">$0</span>
                    <span className="text-xs tracking-[0.2em] text-[#6B6B6B] uppercase font-light">Forever</span>
                  </div>
                </div>
                <div className="space-y-4 sm:space-y-5 text-base font-light">
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2.5 flex-shrink-0" />
                    <span className="text-[#6B6B6B] leading-[1.7] tracking-wide">5 credits on signup</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2.5 flex-shrink-0" />
                    <span className="text-[#6B6B6B] leading-[1.7] tracking-wide">Browse all designs</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2.5 flex-shrink-0" />
                    <span className="text-[#6B6B6B] leading-[1.7] tracking-wide">Book appointments</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2.5 flex-shrink-0" />
                    <span className="text-[#6B6B6B] leading-[1.7] tracking-wide">Buy credits as needed</span>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/auth?signup=true')}
                  className="w-full bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-700 ease-out h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started
                </Button>
              </div>
            </div>

            {/* Pro */}
            <div className="border-2 border-[#8B7355] p-8 sm:p-12 relative group bg-[#FAFAF8] shadow-xl shadow-[#8B7355]/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8B7355] text-white px-5 py-1.5 text-[10px] tracking-[0.3em] uppercase font-light">
                Popular
              </div>
              <div className="space-y-8 sm:space-y-10">
                <div>
                  <h3 className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] mb-4 sm:mb-5 font-light">Pro</h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl lg:text-6xl font-light text-[#1A1A1A]">$20</span>
                    <span className="text-xs tracking-[0.2em] text-[#6B6B6B] uppercase font-light">Monthly</span>
                  </div>
                </div>
                <div className="space-y-4 sm:space-y-5 text-base font-light">
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-1 bg-[#8B7355] mt-2.5 flex-shrink-0" />
                    <span className="text-[#6B6B6B] leading-[1.7] tracking-wide">20 designs per month</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-1 bg-[#8B7355] mt-2.5 flex-shrink-0" />
                    <span className="text-[#6B6B6B] leading-[1.7] tracking-wide">Buy more credits anytime</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-1 bg-[#8B7355] mt-2.5 flex-shrink-0" />
                    <span className="text-[#6B6B6B] leading-[1.7] tracking-wide">Credits never expire</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-1 bg-[#8B7355] mt-2.5 flex-shrink-0" />
                    <span className="text-[#6B6B6B] leading-[1.7] tracking-wide">Priority support</span>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/auth?signup=true')}
                  className="w-full bg-[#8B7355] text-white hover:bg-[#1A1A1A] transition-all duration-700 ease-out h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started
                </Button>
              </div>
            </div>

            {/* Business */}
            <div className="border border-[#E8E8E8] p-8 sm:p-12 hover:border-[#8B7355] hover:shadow-2xl hover:shadow-[#8B7355]/5 transition-all duration-700 group sm:col-span-2 lg:col-span-1">
              <div className="space-y-8 sm:space-y-10">
                <div>
                  <h3 className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] mb-4 sm:mb-5 font-light">Business</h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl lg:text-6xl font-light text-[#1A1A1A]">$60</span>
                    <span className="text-xs tracking-[0.2em] text-[#6B6B6B] uppercase font-light">Monthly</span>
                  </div>
                </div>
                <div className="space-y-4 sm:space-y-5 text-base font-light">
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2.5 flex-shrink-0" />
                    <span className="text-[#6B6B6B] leading-[1.7] tracking-wide">60 designs per month</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2.5 flex-shrink-0" />
                    <span className="text-[#6B6B6B] leading-[1.7] tracking-wide">Everything in Pro</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2.5 flex-shrink-0" />
                    <span className="text-[#6B6B6B] leading-[1.7] tracking-wide">Advanced analytics</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2.5 flex-shrink-0" />
                    <span className="text-[#6B6B6B] leading-[1.7] tracking-wide">Team collaboration</span>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/auth?signup=true')}
                  className="w-full bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-700 ease-out h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 sm:py-32 lg:py-40 bg-[#1A1A1A] text-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#8B7355] mb-8 sm:mb-10 font-light">Ready to Start?</p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-white mb-8 sm:mb-10 tracking-[-0.01em] leading-[1.1]">
            Stop Explaining. Start Showing.
          </h2>
          <p className="text-base sm:text-lg text-white/70 mb-12 sm:mb-16 max-w-2xl mx-auto font-light leading-[1.7] tracking-wide">
            Sign up free and create your first design in seconds
          </p>
          <Button 
            onClick={() => router.push('/auth?signup=true')}
            className="bg-white text-[#1A1A1A] hover:bg-[#8B7355] hover:text-white transition-all duration-700 ease-out px-10 sm:px-20 h-14 sm:h-16 text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F8F7F5] py-16 sm:py-20 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 sm:gap-14 lg:gap-16 mb-16 sm:mb-20">
            <div className="col-span-2 sm:col-span-1">
              <h3 className="font-serif text-xl sm:text-2xl font-light mb-5 sm:mb-7 text-[#1A1A1A] tracking-tight">IVORY'S CHOICE</h3>
              <p className="text-sm sm:text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                Where artistry meets innovation
              </p>
            </div>
            <div>
              <h4 className="text-[11px] tracking-[0.25em] uppercase mb-5 sm:mb-7 text-[#1A1A1A] font-light">Discover</h4>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-[#6B6B6B] font-light">
                <li><a href="#experience" className="hover:text-[#8B7355] transition-colors duration-500 tracking-wide">Experience</a></li>
                <li><a href="#craft" className="hover:text-[#8B7355] transition-colors duration-500 tracking-wide">The Craft</a></li>
                <li><a href="#collection" className="hover:text-[#8B7355] transition-colors duration-500 tracking-wide">Collection</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] tracking-[0.25em] uppercase mb-5 sm:mb-7 text-[#1A1A1A] font-light">Company</h4>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-[#6B6B6B] font-light">
                <li><a href="/about" className="hover:text-[#8B7355] transition-colors duration-500 tracking-wide">About</a></li>
                <li><a href="/contact" className="hover:text-[#8B7355] transition-colors duration-500 tracking-wide">Contact</a></li>
                <li><a href="/careers" className="hover:text-[#8B7355] transition-colors duration-500 tracking-wide">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] tracking-[0.25em] uppercase mb-5 sm:mb-7 text-[#1A1A1A] font-light">Legal</h4>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-[#6B6B6B] font-light">
                <li><a href="/privacy-policy" className="hover:text-[#8B7355] transition-colors duration-500 tracking-wide">Privacy</a></li>
                <li><a href="/terms" className="hover:text-[#8B7355] transition-colors duration-500 tracking-wide">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#E8E8E8] pt-10 flex flex-col sm:flex-row justify-between items-center gap-5 text-xs sm:text-sm text-[#6B6B6B] font-light tracking-wide">
            <p>&copy; 2024 Ivory's Choice. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-[#8B7355] transition-colors duration-500">Instagram</a>
              <a href="#" className="hover:text-[#8B7355] transition-colors duration-500">Pinterest</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
