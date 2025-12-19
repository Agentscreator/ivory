"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GoogleMapsSearch } from "@/components/google-maps-search"
import { Search } from "lucide-react"

// Sample designs for browsing without authentication
const sampleDesigns = [
  {
    id: "sample-1",
    imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=800&fit=crop&q=80",
    title: "Classic French Tips",
    description: "Timeless white tips on natural nails",
    style: "French Manicure"
  },
  {
    id: "sample-2",
    imageUrl: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&h=800&fit=crop&q=80",
    title: "Modern French",
    description: "Contemporary take on the classic",
    style: "French Manicure"
  },
  {
    id: "sample-3",
    imageUrl: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600&h=800&fit=crop&q=80",
    title: "Delicate Florals",
    description: "Hand-painted flower details",
    style: "Floral Art"
  },
  {
    id: "sample-4",
    imageUrl: "https://images.unsplash.com/photo-1604654894609-b5c0a2c39a9e?w=600&h=800&fit=crop&q=80",
    title: "Spring Garden",
    description: "Blooming petals and leaves",
    style: "Floral Art"
  },
  {
    id: "sample-5",
    imageUrl: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=800&fit=crop&q=80",
    title: "Clean Lines",
    description: "Bold geometric patterns",
    style: "Geometric"
  },
  {
    id: "sample-6",
    imageUrl: "https://images.unsplash.com/photo-1515688594390-b649af70d282?w=600&h=800&fit=crop&q=80",
    title: "Abstract Shapes",
    description: "Modern geometric art",
    style: "Geometric"
  },
  {
    id: "sample-7",
    imageUrl: "https://images.unsplash.com/photo-1599948128020-9a44d19e148b?w=600&h=800&fit=crop&q=80",
    title: "Nude Perfection",
    description: "Barely-there elegance",
    style: "Minimalist"
  },
  {
    id: "sample-8",
    imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=800&fit=crop&q=80",
    title: "Simple Chic",
    description: "Less is more",
    style: "Minimalist"
  },
  {
    id: "sample-9",
    imageUrl: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&h=800&fit=crop&q=80",
    title: "Sparkle & Shine",
    description: "Glitter accent nails",
    style: "Glitter"
  },
  {
    id: "sample-10",
    imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=800&fit=crop&q=80",
    title: "Full Glam",
    description: "All-over shimmer",
    style: "Glitter"
  },
  {
    id: "sample-11",
    imageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=800&fit=crop&q=80",
    title: "Sunset Fade",
    description: "Warm gradient blend",
    style: "Ombre"
  },
  {
    id: "sample-12",
    imageUrl: "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=600&h=800&fit=crop&q=80",
    title: "Pink to White",
    description: "Soft color transition",
    style: "Ombre"
  }
]

export default function ExplorePage() {
  const router = useRouter()
  const [selectedStyle, setSelectedStyle] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [techs, setTechs] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const styles = ["all", "French Manicure", "Floral Art", "Geometric", "Minimalist", "Glitter", "Ombre"]

  const filteredDesigns = selectedStyle === "all" 
    ? sampleDesigns 
    : sampleDesigns.filter(design => design.style === selectedStyle)

  const handleSearch = async () => {
    if (!searchQuery && !location) return
    
    setIsSearching(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)
      if (location) params.append('location', location)
      
      const response = await fetch(`/api/tech/search?${params}`)
      const data = await response.json()
      
      if (data.techs) {
        setTechs(data.techs)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-sm border-b border-[#E8E8E8]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <button 
              onClick={() => router.push('/')}
              className="font-serif text-xl sm:text-2xl tracking-tight text-[#1A1A1A] font-light"
            >
              IVORY'S CHOICE
            </button>
            
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
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 bg-gradient-to-b from-[#F8F7F5] to-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 sm:mb-6 font-light">
            Inspiration Gallery
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] mb-4 sm:mb-6 tracking-tight">
            Explore Our Collection
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] max-w-2xl mx-auto font-light leading-relaxed mb-8">
            Browse curated nail designs created by our AI and master artisans. 
            Sign up to create your own custom designs.
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" />
                <Input
                  type="text"
                  placeholder="Search nail techs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-12 border-[#E8E8E8] focus:border-[#8B7355]"
                />
              </div>
              <GoogleMapsSearch
                onLocationSelect={handleLocationSelect}
                placeholder="Location..."
                className="flex-1 h-12 pl-10 border-[#E8E8E8] focus:border-[#8B7355]"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-[#1A1A1A] text-white hover:bg-[#8B7355] h-12 px-8 text-xs tracking-widest uppercase"
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {techs.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-light text-[#1A1A1A] mb-4">
                Found {techs.length} nail tech{techs.length !== 1 ? 's' : ''}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {techs.map((tech) => (
                  <div
                    key={tech.id}
                    onClick={() => router.push(`/tech/${tech.userId}`)}
                    className="bg-white border border-[#E8E8E8] p-6 cursor-pointer hover:border-[#8B7355] transition-all"
                  >
                    <h3 className="text-lg font-light text-[#1A1A1A] mb-2">
                      {tech.businessName || tech.user?.username}
                    </h3>
                    <p className="text-sm text-[#6B6B6B] mb-2">{tech.location}</p>
                    {tech.rating && (
                      <p className="text-sm text-[#8B7355]">
                        ⭐ {tech.rating} ({tech.totalReviews} reviews)
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Style Filter */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {styles.map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`px-4 sm:px-6 py-2 text-xs tracking-wider uppercase transition-all duration-300 ${
                  selectedStyle === style
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-white border border-[#E8E8E8] text-[#6B6B6B] hover:border-[#8B7355]"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredDesigns.map((design) => (
              <div key={design.id} className="group cursor-pointer" onClick={() => {
                // Prompt to sign up to create custom designs
                if (confirm("Sign up to create your own custom nail designs!")) {
                  router.push('/auth?signup=true')
                }
              }}>
                <div className="aspect-[3/4] overflow-hidden relative mb-4 bg-[#F8F7F5]">
                  <Image
                    src={design.imageUrl}
                    alt={design.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm tracking-wider uppercase text-[#1A1A1A] font-light">
                    {design.title}
                  </h3>
                  <p className="text-xs text-[#6B6B6B] font-light">
                    {design.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-[#1A1A1A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-white mb-6 tracking-tight">
            Ready to Create Your Own?
          </h2>
          <p className="text-sm sm:text-base text-white/70 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Sign up to generate custom nail designs with AI, connect with master artisans, 
            and book appointments.
          </p>
          <Button 
            onClick={() => router.push('/auth?signup=true')}
            className="bg-white text-[#1A1A1A] hover:bg-[#8B7355] hover:text-white transition-all duration-500 px-12 h-14 text-xs tracking-widest uppercase rounded-none font-light"
          >
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  )
}
