"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
                  The Art of
                  <br />
                  <span className="italic">Perfection</span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-[#6B6B6B] leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
                  Where artificial intelligence meets artisanal craftsmanship. 
                  Discover bespoke nail designs, curated for the discerning individual.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={() => router.push('/auth?signup=true')}
                  className="bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 px-8 sm:px-12 h-12 sm:h-14 text-xs tracking-widest uppercase rounded-none font-light"
                >
                  Explore Collection
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/auth')}
                  className="border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 px-8 sm:px-12 h-12 sm:h-14 text-xs tracking-widest uppercase rounded-none font-light"
                >
                  Discover More
                </Button>
              </div>
            </div>
            
            {/* Image */}
            <div className="relative order-1 lg:order-2">
              <div className="aspect-[3/4] sm:aspect-[4/5] overflow-hidden relative group">
                <Image 
                  src="/elegant-french-manicure-nails.jpg" 
                  alt="Elegant nail design showcasing artisanal craftsmanship"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                />
                {/* Subtle overlay for sophistication */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
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
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 sm:mb-6 font-light">The Experience</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] tracking-tight">
              Unparalleled Excellence
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
                <h3 className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] font-light">Intelligent Design</h3>
                <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed font-light max-w-xs mx-auto">
                  Precision-crafted designs powered by advanced artificial intelligence
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
                <h3 className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] font-light">Master Artisans</h3>
                <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed font-light max-w-xs mx-auto">
                  Curated network of exceptional nail technicians
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
                <h3 className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] font-light">Effortless Service</h3>
                <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed font-light max-w-xs mx-auto">
                  Seamless booking and personalized attention
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Craft Section */}
      <section id="craft" className="py-16 sm:py-24 lg:py-32 bg-[#F8F7F5]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-12 sm:mb-20">
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 sm:mb-6 font-light">The Process</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] tracking-tight mb-4 sm:mb-6">
              A Journey of Refinement
            </h2>
            <p className="text-sm sm:text-base text-[#6B6B6B] max-w-2xl mx-auto font-light leading-relaxed">
              Four meticulously crafted steps to perfection
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            {[
              { step: "I", title: "Envision", desc: "Capture your inspiration through imagery" },
              { step: "II", title: "Create", desc: "AI interprets and refines your vision" },
              { step: "III", title: "Connect", desc: "Matched with master artisans" },
              { step: "IV", title: "Experience", desc: "Bespoke service, flawless execution" }
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
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 sm:mb-6 font-light">Membership</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] tracking-tight">
              Select Your Experience
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* Essential */}
            <div className="border border-[#E8E8E8] p-6 sm:p-10 hover:border-[#8B7355] transition-all duration-500 group">
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] mb-3 sm:mb-4 font-light">Essential</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-light text-[#1A1A1A]">$9</span>
                    <span className="text-xs tracking-wider text-[#6B6B6B] uppercase font-light">Monthly</span>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4 text-sm font-light">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">10 curated designs monthly</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">Standard service</span>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/auth?signup=true')}
                  className="w-full bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 h-12 text-xs tracking-widest uppercase rounded-none font-light"
                >
                  Begin
                </Button>
              </div>
            </div>

            {/* Signature */}
            <div className="border-2 border-[#8B7355] p-6 sm:p-10 relative group bg-[#FAFAF8]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8B7355] text-white px-4 py-1 text-[10px] tracking-widest uppercase font-light">
                Recommended
              </div>
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] mb-3 sm:mb-4 font-light">Signature</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-light text-[#1A1A1A]">$29</span>
                    <span className="text-xs tracking-wider text-[#6B6B6B] uppercase font-light">Monthly</span>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4 text-sm font-light">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#8B7355] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">Unlimited designs</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#8B7355] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">Priority artisan matching</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#8B7355] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">Advanced personalization</span>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/auth?signup=true')}
                  className="w-full bg-[#8B7355] text-white hover:bg-[#1A1A1A] transition-all duration-500 h-12 text-xs tracking-widest uppercase rounded-none font-light"
                >
                  Begin
                </Button>
              </div>
            </div>

            {/* Atelier */}
            <div className="border border-[#E8E8E8] p-6 sm:p-10 hover:border-[#8B7355] transition-all duration-500 group sm:col-span-2 lg:col-span-1">
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] mb-3 sm:mb-4 font-light">Atelier</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-light text-[#1A1A1A]">Bespoke</span>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4 text-sm font-light">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">Signature benefits included</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#1A1A1A] mt-2 flex-shrink-0" />
                    <span className="text-[#6B6B6B]">Dedicated concierge</span>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/auth')}
                  className="w-full bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 h-12 text-xs tracking-widest uppercase rounded-none font-light"
                >
                  Inquire
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-[#1A1A1A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-6 sm:mb-8 font-light">Begin Your Journey</p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-6 sm:mb-8 tracking-tight">
            Discover Perfection
          </h2>
          <p className="text-sm sm:text-base text-white/70 mb-8 sm:mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Join a distinguished community of individuals who appreciate the finest in nail artistry
          </p>
          <Button 
            onClick={() => router.push('/auth?signup=true')}
            className="bg-white text-[#1A1A1A] hover:bg-[#8B7355] hover:text-white transition-all duration-500 px-8 sm:px-16 h-12 sm:h-14 text-xs tracking-widest uppercase rounded-none font-light"
          >
            Explore Now
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
