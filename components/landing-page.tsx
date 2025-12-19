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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-white/98 backdrop-blur-sm border-b border-[#E8E8E8]" : "bg-white"
      }`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <span className="font-serif text-xl sm:text-2xl tracking-tight text-[#1A1A1A] font-light">
                IVORY'S CHOICE
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-10">
              <button onClick={() => router.push('/explore')} className="text-xs tracking-widest uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-300">Explore</button>
              <a href="#experience" className="text-xs tracking-widest uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-300">Experience</a>
              <a href="#craft" className="text-xs tracking-widest uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-300">The Craft</a>
              <a href="#collection" className="text-xs tracking-widest uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-300">Collection</a>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button 
                onClick={() => router.push('/auth')}
                className="text-xs tracking-widest uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-300 hidden sm:block"
              >
                Sign In
              </button>
              <Button 
                onClick={() => router.push('/auth?signup=true')}
                className="bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-300 px-4 sm:px-8 h-9 sm:h-11 text-xs tracking-widest uppercase rounded-none"
              >
                Begin
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Screen Minimal */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 sm:pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8F7F5] via-white to-white" />
        
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Text Content */}
            <div className="space-y-6 sm:space-y-10 text-center lg:text-left order-2 lg:order-1">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-light text-[#1A1A1A] leading-[1.1] tracking-tight">
                  See It Before
                  <br />
                  <span className="italic">You Book</span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-[#6B6B6B] leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
                  Design it once. Get it right. Connect with nail techs who bring your vision to life.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={() => router.push('/explore')}
                  className="bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 px-8 sm:px-12 h-12 sm:h-14 text-xs tracking-widest uppercase rounded-none font-light"
                >
                  Browse Designs
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/auth?signup=true')}
                  className="border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 px-8 sm:px-12 h-12 sm:h-14 text-xs tracking-widest uppercase rounded-none font-light"
                >
                  Get Started
                </Button>
              </div>
            </div>
            
            {/* Image */}
            <div className="relative order-1 lg:order-2 flex items-center justify-center">
              <div className="relative w-full max-w-[280px] sm:max-w-[400px] lg:max-w-[500px] aspect-[16/9] mx-auto">
                <Image 
                  src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=450&fit=crop&q=80" 
                  alt="Elegant line art of hands with nail polish"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 400px, 500px"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block">
          <div className="w-px h-16 bg-gradient-to-b from-[#1A1A1A] to-transparent" />
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-12 sm:mb-20">
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 sm:mb-6 font-light">Features</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] tracking-tight">
              What You Get
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
            <div className="text-center space-y-4 sm:space-y-6 group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto border border-[#E8E8E8] flex items-center justify-center group-hover:border-[#8B7355] transition-colors duration-500">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#1A1A1A] group-hover:text-[#8B7355] transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] font-light">Design It Once</h3>
                <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed font-light max-w-xs mx-auto">
                  Show us a photo or describe your vision. Get custom designs instantly.
                </p>
              </div>
            </div>

            <div className="text-center space-y-4 sm:space-y-6 group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto border border-[#E8E8E8] flex items-center justify-center group-hover:border-[#8B7355] transition-colors duration-500">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#1A1A1A] group-hover:text-[#8B7355] transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] font-light">Find Your Tech</h3>
                <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed font-light max-w-xs mx-auto">
                  Browse local techs. See their work, ratings, and open slots.
                </p>
              </div>
            </div>

            <div className="text-center space-y-4 sm:space-y-6 group sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto border border-[#E8E8E8] flex items-center justify-center group-hover:border-[#8B7355] transition-colors duration-500">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#1A1A1A] group-hover:text-[#8B7355] transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] font-light">Less Explaining. Better Nails.</h3>
                <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed font-light max-w-xs mx-auto">
                  Book directly. Pay securely. Show up knowing exactly what you're getting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-12 sm:mb-20">
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 sm:mb-6 font-light">Inspiration</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] tracking-tight">
              Real Designs. Real Results.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=500&fit=crop&q=80",
              "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400&h=500&fit=crop&q=80",
              "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&h=500&fit=crop&q=80",
              "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=500&fit=crop&q=80",
              "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=500&fit=crop&q=80",
              "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=500&fit=crop&q=80",
              "https://images.unsplash.com/photo-1604654894609-b5c0a2c39a9e?w=400&h=500&fit=crop&q=80",
              "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=500&fit=crop&q=80&sat=-100"
            ].map((src, idx) => (
              <div key={idx} className="relative aspect-[4/5] overflow-hidden group cursor-pointer" onClick={() => router.push('/explore')}>
                <Image
                  src={src}
                  alt={`Nail design inspiration ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>

          <div className="text-center mt-12 sm:mt-16">
            <Button 
              onClick={() => router.push('/explore')}
              className="bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 px-8 sm:px-12 h-12 sm:h-14 text-xs tracking-widest uppercase rounded-none font-light"
            >
              View More Designs
            </Button>
          </div>
        </div>
      </section>

      {/* The Craft Section */}
      <section id="craft" className="py-16 sm:py-24 lg:py-32 bg-[#F8F7F5]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-12 sm:mb-20">
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 sm:mb-6 font-light">How It Works</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] tracking-tight mb-4 sm:mb-6">
              Four Simple Steps
            </h2>
            <p className="text-sm sm:text-base text-[#6B6B6B] max-w-2xl mx-auto font-light leading-relaxed">
              From idea to appointment in minutes
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            {[
              { step: "1", title: "Show Us", desc: "Upload a photo or describe your idea" },
              { step: "2", title: "See Options", desc: "Get custom designs in seconds" },
              { step: "3", title: "Pick Your Tech", desc: "Find someone near you who gets it" },
              { step: "4", title: "Book It", desc: "Schedule and pay. Done." }
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="text-5xl sm:text-6xl font-serif font-light text-[#8B7355]/20 mb-4 sm:mb-6 group-hover:text-[#8B7355]/40 transition-colors duration-500">{item.step}</div>
                <h3 className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] mb-2 sm:mb-3 font-light">{item.title}</h3>
                <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed font-light">{item.desc}</p>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-12 -right-6 w-12 h-px bg-gradient-to-r from-[#E8E8E8] to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collection Section */}
      <section id="collection" className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-12 sm:mb-20">
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 sm:mb-6 font-light">Pricing</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] tracking-tight">
              Choose Your Plan
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* Free */}
            <div className="border border-[#E8E8E8] p-6 sm:p-10 hover:border-[#8B7355] transition-all duration-500 group">
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] mb-3 sm:mb-4 font-light">Free</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-light text-[#1A1A1A]">$0</span>
                    <span className="text-xs tracking-wider text-[#6B6B6B] uppercase font-light">Forever</span>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4 text-sm font-light">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">5 credits on signup</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">Browse all designs</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">Book appointments</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">Buy credits as needed</span>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/auth?signup=true')}
                  className="w-full bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 h-12 text-xs tracking-widest uppercase rounded-none font-light"
                >
                  Get Started
                </Button>
              </div>
            </div>

            {/* Pro */}
            <div className="border-2 border-[#8B7355] p-6 sm:p-10 relative group bg-[#FAFAF8]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8B7355] text-white px-4 py-1 text-[10px] tracking-widest uppercase font-light">
                Popular
              </div>
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] mb-3 sm:mb-4 font-light">Pro</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-light text-[#1A1A1A]">$20</span>
                    <span className="text-xs tracking-wider text-[#6B6B6B] uppercase font-light">Monthly</span>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4 text-sm font-light">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#8B7355] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">20 designs per month</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#8B7355] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">Buy more credits anytime</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#8B7355] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">Credits never expire</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#8B7355] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">Priority support</span>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/auth?signup=true')}
                  className="w-full bg-[#8B7355] text-white hover:bg-[#1A1A1A] transition-all duration-500 h-12 text-xs tracking-widest uppercase rounded-none font-light"
                >
                  Get Started
                </Button>
              </div>
            </div>

            {/* Business */}
            <div className="border border-[#E8E8E8] p-6 sm:p-10 hover:border-[#8B7355] transition-all duration-500 group sm:col-span-2 lg:col-span-1">
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] mb-3 sm:mb-4 font-light">Business</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-light text-[#1A1A1A]">$60</span>
                    <span className="text-xs tracking-wider text-[#6B6B6B] uppercase font-light">Monthly</span>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4 text-sm font-light">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">60 designs per month</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">Everything in Pro</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">Advanced analytics</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">Team collaboration</span>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/auth?signup=true')}
                  className="w-full bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 h-12 text-xs tracking-widest uppercase rounded-none font-light"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-[#1A1A1A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-6 sm:mb-8 font-light">Ready to Start?</p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-6 sm:mb-8 tracking-tight">
            Stop Explaining. Start Showing.
          </h2>
          <p className="text-sm sm:text-base text-white/70 mb-8 sm:mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Sign up free and create your first design in seconds
          </p>
          <Button 
            onClick={() => router.push('/auth?signup=true')}
            className="bg-white text-[#1A1A1A] hover:bg-[#8B7355] hover:text-white transition-all duration-500 px-8 sm:px-16 h-12 sm:h-14 text-xs tracking-widest uppercase rounded-none font-light"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F8F7F5] py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
            <div className="col-span-2 sm:col-span-1">
              <h3 className="font-serif text-lg sm:text-xl font-light mb-4 sm:mb-6 text-[#1A1A1A] tracking-tight">IVORY'S CHOICE</h3>
              <p className="text-xs sm:text-sm text-[#6B6B6B] font-light leading-relaxed">
                Where artistry meets innovation
              </p>
            </div>
            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase mb-4 sm:mb-6 text-[#1A1A1A] font-light">Discover</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-[#6B6B6B] font-light">
                <li><a href="#experience" className="hover:text-[#8B7355] transition-colors duration-300">Experience</a></li>
                <li><a href="#craft" className="hover:text-[#8B7355] transition-colors duration-300">The Craft</a></li>
                <li><a href="#collection" className="hover:text-[#8B7355] transition-colors duration-300">Collection</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase mb-4 sm:mb-6 text-[#1A1A1A] font-light">Company</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-[#6B6B6B] font-light">
                <li><a href="/about" className="hover:text-[#8B7355] transition-colors duration-300">About</a></li>
                <li><a href="/contact" className="hover:text-[#8B7355] transition-colors duration-300">Contact</a></li>
                <li><a href="/careers" className="hover:text-[#8B7355] transition-colors duration-300">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase mb-4 sm:mb-6 text-[#1A1A1A] font-light">Legal</h4>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-[#6B6B6B] font-light">
                <li><a href="/privacy-policy" className="hover:text-[#8B7355] transition-colors duration-300">Privacy</a></li>
                <li><a href="/terms" className="hover:text-[#8B7355] transition-colors duration-300">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#E8E8E8] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#6B6B6B] font-light">
            <p>&copy; 2024 Ivory's Choice. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#8B7355] transition-colors duration-300">Instagram</a>
              <a href="#" className="hover:text-[#8B7355] transition-colors duration-300">Pinterest</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
