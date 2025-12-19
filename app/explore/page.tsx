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
  // French Manicure (10 designs)
  { id: "french-1", imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=800&fit=crop&q=80", title: "Classic French Tips", description: "Timeless white tips on natural nails", style: "French Manicure" },
  { id: "french-2", imageUrl: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&h=800&fit=crop&q=80", title: "Modern French", description: "Contemporary take on the classic", style: "French Manicure" },
  { id: "french-3", imageUrl: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600&h=800&fit=crop&q=80", title: "Nude French", description: "Subtle elegance with nude base", style: "French Manicure" },
  { id: "french-4", imageUrl: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=800&fit=crop&q=80", title: "Pink French", description: "Soft pink with white tips", style: "French Manicure" },
  { id: "french-5", imageUrl: "https://images.unsplash.com/photo-1604654894609-b5c0a2c39a9e?w=600&h=800&fit=crop&q=80", title: "Reverse French", description: "Tips at the base", style: "French Manicure" },
  { id: "french-6", imageUrl: "https://images.unsplash.com/photo-1599948128020-9a44d19e148b?w=600&h=800&fit=crop&q=80", title: "Colored French", description: "Bold colored tips", style: "French Manicure" },
  { id: "french-7", imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=800&fit=crop&q=80", title: "Double French", description: "Two-tone tip design", style: "French Manicure" },
  { id: "french-8", imageUrl: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&h=800&fit=crop&q=80", title: "Diagonal French", description: "Angled tip line", style: "French Manicure" },
  { id: "french-9", imageUrl: "https://images.unsplash.com/photo-1515688594390-b649af70d282?w=600&h=800&fit=crop&q=80", title: "V-Tip French", description: "V-shaped tips", style: "French Manicure" },
  { id: "french-10", imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=800&fit=crop&q=80", title: "Glitter French", description: "Sparkle on the tips", style: "French Manicure" },
  
  // Floral Art (10 designs)
  { id: "floral-1", imageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=800&fit=crop&q=80", title: "Rose Garden", description: "Delicate rose petals", style: "Floral Art" },
  { id: "floral-2", imageUrl: "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=600&h=800&fit=crop&q=80", title: "Cherry Blossoms", description: "Spring sakura flowers", style: "Floral Art" },
  { id: "floral-3", imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=800&fit=crop&q=80&hue=30", title: "Sunflower Bright", description: "Bold yellow blooms", style: "Floral Art" },
  { id: "floral-4", imageUrl: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&h=800&fit=crop&q=80&hue=60", title: "Tropical Hibiscus", description: "Exotic island vibes", style: "Floral Art" },
  { id: "floral-5", imageUrl: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600&h=800&fit=crop&q=80&hue=90", title: "Lavender Fields", description: "Purple floral elegance", style: "Floral Art" },
  { id: "floral-6", imageUrl: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=800&fit=crop&q=80&hue=120", title: "Daisy Chain", description: "White petals and yellow centers", style: "Floral Art" },
  { id: "floral-7", imageUrl: "https://images.unsplash.com/photo-1604654894609-b5c0a2c39a9e?w=600&h=800&fit=crop&q=80&hue=150", title: "Botanical Leaves", description: "Green foliage accents", style: "Floral Art" },
  { id: "floral-8", imageUrl: "https://images.unsplash.com/photo-1599948128020-9a44d19e148b?w=600&h=800&fit=crop&q=80&hue=180", title: "Watercolor Blooms", description: "Soft painted flowers", style: "Floral Art" },
  { id: "floral-9", imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=800&fit=crop&q=80&hue=210", title: "Pressed Flowers", description: "Dried flower art", style: "Floral Art" },
  { id: "floral-10", imageUrl: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&h=800&fit=crop&q=80&hue=240", title: "3D Floral", description: "Raised petal details", style: "Floral Art" },
  
  // Geometric (10 designs)
  { id: "geo-1", imageUrl: "https://images.unsplash.com/photo-1515688594390-b649af70d282?w=600&h=800&fit=crop&q=80", title: "Striped Lines", description: "Clean parallel stripes", style: "Geometric" },
  { id: "geo-2", imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=800&fit=crop&q=80", title: "Triangle Pattern", description: "Sharp angular design", style: "Geometric" },
  { id: "geo-3", imageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=800&fit=crop&q=80&sat=-50", title: "Chevron Chic", description: "Zigzag patterns", style: "Geometric" },
  { id: "geo-4", imageUrl: "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=600&h=800&fit=crop&q=80&sat=-50", title: "Color Blocking", description: "Bold color sections", style: "Geometric" },
  { id: "geo-5", imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=800&fit=crop&q=80&contrast=20", title: "Negative Space", description: "Strategic bare nail", style: "Geometric" },
  { id: "geo-6", imageUrl: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&h=800&fit=crop&q=80&contrast=20", title: "Dot Matrix", description: "Polka dot precision", style: "Geometric" },
  { id: "geo-7", imageUrl: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600&h=800&fit=crop&q=80&contrast=20", title: "Grid Lines", description: "Intersecting lines", style: "Geometric" },
  { id: "geo-8", imageUrl: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=800&fit=crop&q=80&contrast=20", title: "Abstract Art", description: "Modern shapes", style: "Geometric" },
  { id: "geo-9", imageUrl: "https://images.unsplash.com/photo-1604654894609-b5c0a2c39a9e?w=600&h=800&fit=crop&q=80&contrast=20", title: "Half Moon", description: "Curved geometric design", style: "Geometric" },
  { id: "geo-10", imageUrl: "https://images.unsplash.com/photo-1599948128020-9a44d19e148b?w=600&h=800&fit=crop&q=80&contrast=20", title: "Metallic Lines", description: "Gold and silver accents", style: "Geometric" },
  
  // Minimalist (10 designs)
  { id: "min-1", imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=800&fit=crop&q=80", title: "Bare Nude", description: "Natural nail perfection", style: "Minimalist" },
  { id: "min-2", imageUrl: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&h=800&fit=crop&q=80", title: "Single Accent", description: "One nail, one detail", style: "Minimalist" },
  { id: "min-3", imageUrl: "https://images.unsplash.com/photo-1515688594390-b649af70d282?w=600&h=800&fit=crop&q=80&sat=-80", title: "Matte Nude", description: "Soft matte finish", style: "Minimalist" },
  { id: "min-4", imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=800&fit=crop&q=80&sat=-80", title: "Sheer Pink", description: "Barely-there color", style: "Minimalist" },
  { id: "min-5", imageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=800&fit=crop&q=80&sat=-80", title: "Thin Line", description: "Delicate single stripe", style: "Minimalist" },
  { id: "min-6", imageUrl: "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=600&h=800&fit=crop&q=80&sat=-80", title: "Tiny Dot", description: "Minimal dot accent", style: "Minimalist" },
  { id: "min-7", imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=800&fit=crop&q=80&sat=-80", title: "Clear Gloss", description: "High shine natural", style: "Minimalist" },
  { id: "min-8", imageUrl: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&h=800&fit=crop&q=80&sat=-80", title: "Soft Beige", description: "Neutral elegance", style: "Minimalist" },
  { id: "min-9", imageUrl: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600&h=800&fit=crop&q=80&sat=-80", title: "Milky White", description: "Opaque white simplicity", style: "Minimalist" },
  { id: "min-10", imageUrl: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=800&fit=crop&q=80&sat=-80", title: "Subtle Shimmer", description: "Hint of pearl", style: "Minimalist" },
  
  // Glitter (10 designs)
  { id: "glitter-1", imageUrl: "https://images.unsplash.com/photo-1604654894609-b5c0a2c39a9e?w=600&h=800&fit=crop&q=80&brightness=10", title: "Full Sparkle", description: "All-over glitter", style: "Glitter" },
  { id: "glitter-2", imageUrl: "https://images.unsplash.com/photo-1599948128020-9a44d19e148b?w=600&h=800&fit=crop&q=80&brightness=10", title: "Glitter Gradient", description: "Fading sparkle", style: "Glitter" },
  { id: "glitter-3", imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=800&fit=crop&q=80&brightness=10", title: "Accent Glitter", description: "One sparkly nail", style: "Glitter" },
  { id: "glitter-4", imageUrl: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&h=800&fit=crop&q=80&brightness=10", title: "Chunky Glitter", description: "Large glitter pieces", style: "Glitter" },
  { id: "glitter-5", imageUrl: "https://images.unsplash.com/photo-1515688594390-b649af70d282?w=600&h=800&fit=crop&q=80&brightness=10", title: "Fine Shimmer", description: "Micro glitter dust", style: "Glitter" },
  { id: "glitter-6", imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=800&fit=crop&q=80&brightness=10", title: "Holographic", description: "Rainbow sparkle", style: "Glitter" },
  { id: "glitter-7", imageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=800&fit=crop&q=80&brightness=10", title: "Gold Glitter", description: "Luxe gold sparkle", style: "Glitter" },
  { id: "glitter-8", imageUrl: "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=600&h=800&fit=crop&q=80&brightness=10", title: "Silver Shine", description: "Metallic silver", style: "Glitter" },
  { id: "glitter-9", imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=800&fit=crop&q=80&brightness=10", title: "Rose Gold", description: "Pink metallic glow", style: "Glitter" },
  { id: "glitter-10", imageUrl: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&h=800&fit=crop&q=80&brightness=10", title: "Mixed Glitter", description: "Multi-color sparkle", style: "Glitter" },
  
  // Ombre (10 designs)
  { id: "ombre-1", imageUrl: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600&h=800&fit=crop&q=80&hue=330", title: "Pink Fade", description: "Light to dark pink", style: "Ombre" },
  { id: "ombre-2", imageUrl: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=800&fit=crop&q=80&hue=330", title: "Sunset Ombre", description: "Orange to pink blend", style: "Ombre" },
  { id: "ombre-3", imageUrl: "https://images.unsplash.com/photo-1604654894609-b5c0a2c39a9e?w=600&h=800&fit=crop&q=80&hue=200", title: "Ocean Blue", description: "Blue gradient waves", style: "Ombre" },
  { id: "ombre-4", imageUrl: "https://images.unsplash.com/photo-1599948128020-9a44d19e148b?w=600&h=800&fit=crop&q=80&hue=270", title: "Purple Dream", description: "Lavender to violet", style: "Ombre" },
  { id: "ombre-5", imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=800&fit=crop&q=80&hue=90", title: "Mint Green", description: "Fresh green fade", style: "Ombre" },
  { id: "ombre-6", imageUrl: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&h=800&fit=crop&q=80&hue=30", title: "Peach Gradient", description: "Soft peach blend", style: "Ombre" },
  { id: "ombre-7", imageUrl: "https://images.unsplash.com/photo-1515688594390-b649af70d282?w=600&h=800&fit=crop&q=80&hue=0", title: "Red to Black", description: "Dramatic dark fade", style: "Ombre" },
  { id: "ombre-8", imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=800&fit=crop&q=80&hue=180", title: "Nude to White", description: "Natural gradient", style: "Ombre" },
  { id: "ombre-9", imageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=800&fit=crop&q=80&hue=60", title: "Yellow Sunshine", description: "Bright yellow fade", style: "Ombre" },
  { id: "ombre-10", imageUrl: "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=600&h=800&fit=crop&q=80&hue=300", title: "Rainbow Ombre", description: "Multi-color gradient", style: "Ombre" }
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
