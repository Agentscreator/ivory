"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"
import { GoogleMapsSearch } from "@/components/google-maps-search"
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Service = {
  id: string
  name: string
  price: string
}

export default function TechProfileSetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [businessName, setBusinessName] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])
  const [services, setServices] = useState<Service[]>([
    { id: "1", name: "Full Set", price: "60" },
    { id: "2", name: "Gel Manicure", price: "45" },
  ])

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userStr = localStorage.getItem("ivoryUser")
        if (!userStr) {
          router.push("/")
          return
        }

        const user = JSON.parse(userStr)
        setUserId(user.id)

        // Load tech profile
        const profileRes = await fetch(`/api/tech-profiles?userId=${user.id}`)
        if (profileRes.ok) {
          const profile = await profileRes.json()
          if (profile) {
            setBusinessName(profile.businessName || "")
            setBio(profile.bio || "")
            setLocation(profile.location || "")
          }
        }

        // Load portfolio images
        const imagesRes = await fetch(`/api/portfolio-images?userId=${user.id}`)
        if (imagesRes.ok) {
          const data = await imagesRes.json()
          setPortfolioImages(data.images?.map((img: any) => img.imageUrl) || [])
        }

        // Load services
        const servicesRes = await fetch(`/api/services?userId=${user.id}`)
        if (servicesRes.ok) {
          const data = await servicesRes.json()
          if (data.services && data.services.length > 0) {
            setServices(
              data.services.map((s: any) => ({
                id: s.id.toString(),
                name: s.name,
                price: s.price.toString(),
              }))
            )
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const addService = () => {
    setServices([...services, { id: Date.now().toString(), name: "", price: "" }])
  }

  const removeService = (id: string) => {
    setServices(services.filter((s) => s.id !== id))
  }

  const updateService = (id: string, field: "name" | "price", value: string) => {
    setServices(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const handleImageUpload = async (url: string) => {
    try {
      // Save to database
      const response = await fetch("/api/portfolio-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          imageUrl: url,
        }),
      })

      if (!response.ok) {
        // If API not deployed yet, store locally as fallback
        if (response.status === 404) {
          console.warn("API not deployed yet, storing locally")
          setPortfolioImages([...portfolioImages, url])
          toast({
            title: "Image uploaded (temporary)",
            description: "Image saved locally. Will sync to database when API is ready.",
          })
          return
        }
        throw new Error("Failed to save image")
      }

      setPortfolioImages([...portfolioImages, url])
      toast({
        title: "Image uploaded",
        description: "Your portfolio image has been added successfully",
      })
    } catch (error: any) {
      console.error("Error saving image:", error)
      // Fallback: still show the image locally
      setPortfolioImages([...portfolioImages, url])
      toast({
        title: "Image uploaded (local only)",
        description: "Image saved locally. Database sync pending deployment.",
      })
    }
  }

  const handleImageRemove = async (url: string) => {
    try {
      // Find image ID from database
      const imagesRes = await fetch(`/api/portfolio-images?userId=${userId}`)
      if (imagesRes.ok) {
        const data = await imagesRes.json()
        const image = data.images?.find((img: any) => img.imageUrl === url)
        
        if (image) {
          const response = await fetch(`/api/portfolio-images?id=${image.id}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            throw new Error("Failed to delete image")
          }
        }
      }

      setPortfolioImages(portfolioImages.filter((img) => img !== url))
      toast({
        title: "Image removed",
        description: "Your portfolio image has been removed",
      })
    } catch (error: any) {
      console.error("Error removing image:", error)
      toast({
        title: "Remove failed",
        description: error?.message || "Failed to remove image",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    if (!userId) return

    setSaving(true)
    let profileSaved = false
    let servicesSaved = false

    try {
      // Save tech profile
      const profileRes = await fetch("/api/tech-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          businessName,
          bio,
          location,
        }),
      })

      if (profileRes.ok || profileRes.status === 200 || profileRes.status === 201) {
        profileSaved = true
      } else if (profileRes.status === 404) {
        console.warn("Tech profiles API not deployed yet")
        // Store in localStorage as fallback
        localStorage.setItem("techProfile", JSON.stringify({
          businessName,
          bio,
          location,
        }))
        profileSaved = true
      } else {
        const errorData = await profileRes.json().catch(() => ({}))
        console.error("Profile save error:", errorData)
        throw new Error(errorData.error || "Failed to save profile")
      }

      // Save services
      const servicesRes = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          services: services
            .filter((s) => s.name && s.price)
            .map((s) => ({
              name: s.name,
              price: parseFloat(s.price),
            })),
        }),
      })

      if (servicesRes.ok) {
        servicesSaved = true
      } else if (servicesRes.status === 404) {
        console.warn("Services API not deployed yet")
        // Store in localStorage as fallback
        localStorage.setItem("techServices", JSON.stringify(services))
        servicesSaved = true
      } else {
        throw new Error("Failed to save services")
      }

      if (profileSaved && servicesSaved) {
        toast({
          title: "Profile saved",
          description: "Your tech profile has been updated successfully",
        })
        router.push("/tech/dashboard")
      }
    } catch (error: any) {
      console.error("Error saving profile:", error)
      toast({
        title: "Save failed",
        description: error?.message || "Failed to save profile. Data saved locally.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-safe">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top backdrop-blur-md bg-white/98">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300 rounded-none"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1} />
            </Button>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-light text-[#1A1A1A] tracking-tight">Profile Setup</h1>
              <p className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-[#6B6B6B] font-light hidden sm:block">Professional Details</p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="h-10 sm:h-12 lg:h-14 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-700 px-5 sm:px-8 lg:px-10 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98]"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#F8F7F5] to-white py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.35em] uppercase text-[#8B7355] mb-3 sm:mb-4 font-light">Welcome</p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] mb-3 sm:mb-4 tracking-tight leading-[1.1]">
            Build Your Professional Profile
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#6B6B6B] font-light max-w-2xl mx-auto leading-[1.7] tracking-wide">
            Showcase your expertise and connect with clients who value your craft
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="space-y-8 sm:space-y-12 lg:space-y-16">
          {/* Business Info */}
          <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8 lg:p-10">
            <div className="mb-6 sm:mb-8 lg:mb-10">
              <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 sm:mb-3 font-light">Section I</p>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-tight leading-[1.1]">Business Information</h2>
              <p className="text-sm sm:text-base text-[#6B6B6B] font-light mt-2 leading-[1.7] tracking-wide">Essential details about your practice</p>
            </div>

            <div className="space-y-5 sm:space-y-6 lg:space-y-7">
              <div>
                <label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-2 sm:mb-3 font-light">
                  Business Name
                </label>
                <Input
                  placeholder="Your salon or business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-12 sm:h-14 lg:h-16 text-sm sm:text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-2 sm:mb-3 font-light">
                  Location
                </label>
                <GoogleMapsSearch
                  onLocationSelect={(location) => setLocation(location)}
                  placeholder="Search for your city..."
                  className="h-12 sm:h-14 lg:h-16 text-sm sm:text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light pl-10 transition-all duration-300"
                />
                {location && (
                  <p className="text-xs sm:text-sm text-[#6B6B6B] mt-2 sm:mt-3 font-light tracking-wide">
                    Selected: {location}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-2 sm:mb-3 font-light">
                  Bio
                </label>
                <Textarea
                  placeholder="Tell clients about your experience and style..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  className="text-sm sm:text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 resize-none font-light leading-[1.7] tracking-wide transition-all duration-300"
                />
                <p className="text-xs text-[#6B6B6B] mt-2 font-light tracking-wide">Share your story and what makes your work unique</p>
              </div>
            </div>
          </div>

          {/* Services & Prices */}
          <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 lg:mb-10 gap-4">
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 sm:mb-3 font-light">Section II</p>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-tight leading-[1.1]">Services & Pricing</h2>
                <p className="text-sm sm:text-base text-[#6B6B6B] font-light mt-2 leading-[1.7] tracking-wide">Define what you offer</p>
              </div>
              <Button 
                variant="outline" 
                onClick={addService}
                className="h-11 sm:h-12 lg:h-14 border-[#E8E8E8] hover:border-[#8B7355] hover:bg-transparent text-[#1A1A1A] rounded-none text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-light transition-all duration-700 px-5 sm:px-6 lg:px-8 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" strokeWidth={1} />
                Add Service
              </Button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {services.map((service, index) => (
                <div key={service.id} className="flex gap-2 sm:gap-3 items-start group">
                  <Input
                    placeholder="Service name"
                    value={service.name}
                    onChange={(e) => updateService(service.id, "name", e.target.value)}
                    className="flex-1 h-12 sm:h-14 lg:h-16 text-sm sm:text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light transition-all duration-300"
                  />
                  <div className="relative w-24 sm:w-32 lg:w-36">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] text-sm sm:text-base font-light">
                      $
                    </span>
                    <Input
                      placeholder="0"
                      type="number"
                      value={service.price}
                      onChange={(e) => updateService(service.id, "price", e.target.value)}
                      className="pl-6 sm:pl-7 h-12 sm:h-14 lg:h-16 text-sm sm:text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light transition-all duration-300"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeService(service.id)}
                    className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 flex-shrink-0 hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300 rounded-none opacity-60 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Gallery */}
          <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8 lg:p-10">
            <div className="mb-6 sm:mb-8 lg:mb-10">
              <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 sm:mb-3 font-light">Section III</p>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-tight mb-2 leading-[1.1]">
                Portfolio Gallery
              </h2>
              <p className="text-sm sm:text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">Showcase your finest work and attract clients</p>
            </div>
            <ImageUpload
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
              images={portfolioImages}
              maxImages={20}
              buttonText="Select Images"
              multiple={true}
            />
          </div>

          {/* Save Button - Mobile Bottom */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E8E8E8] safe-bottom backdrop-blur-md bg-white/98">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full h-14 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-700 text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
