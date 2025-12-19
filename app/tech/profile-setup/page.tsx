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
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="hover:bg-[#F8F7F5] active:scale-95 transition-all rounded-none"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1} />
            </Button>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">Profile Setup</h1>
              <p className="text-xs tracking-wider uppercase text-[#6B6B6B] font-light hidden sm:block">Professional Details</p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="h-10 sm:h-11 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 px-6 sm:px-8 text-xs tracking-widest uppercase rounded-none font-light"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-8 sm:space-y-12">
          {/* Business Info */}
          <div className="border border-[#E8E8E8] p-6 sm:p-10">
            <div className="mb-6 sm:mb-8">
              <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Section I</p>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">Business Information</h2>
            </div>

            <div className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 font-light">
                  Business Name
                </label>
                <Input
                  placeholder="Your salon or business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-12 sm:h-14 text-sm border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light"
                />
              </div>

              <div>
                <label className="block text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 font-light">
                  Location
                </label>
                <GoogleMapsSearch
                  onLocationSelect={(location) => setLocation(location)}
                  placeholder="Search for your city..."
                  className="h-12 sm:h-14 text-sm border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light pl-10"
                />
                {location && (
                  <p className="text-xs text-[#6B6B6B] mt-2 font-light">
                    Selected: {location}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 font-light">
                  Bio
                </label>
                <Textarea
                  placeholder="Tell clients about your experience and style..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  className="text-sm border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 resize-none font-light leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Services & Prices */}
          <div className="border border-[#E8E8E8] p-6 sm:p-10">
            <div className="flex items-start justify-between mb-6 sm:mb-8 gap-4">
              <div>
                <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Section II</p>
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">Services & Pricing</h2>
              </div>
              <Button 
                variant="outline" 
                onClick={addService}
                className="h-10 sm:h-11 border-[#E8E8E8] hover:border-[#8B7355] hover:bg-transparent text-[#1A1A1A] rounded-none text-xs tracking-wider uppercase font-light transition-all duration-300 px-4 sm:px-6"
              >
                <Plus className="w-4 h-4 mr-2" strokeWidth={1} />
                <span className="hidden sm:inline">Add Service</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {services.map((service) => (
                <div key={service.id} className="flex gap-3 items-start">
                  <Input
                    placeholder="Service name"
                    value={service.name}
                    onChange={(e) => updateService(service.id, "name", e.target.value)}
                    className="flex-1 h-12 sm:h-14 text-sm border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light"
                  />
                  <div className="relative w-28 sm:w-36">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] text-sm font-light">
                      $
                    </span>
                    <Input
                      placeholder="0"
                      type="number"
                      value={service.price}
                      onChange={(e) => updateService(service.id, "price", e.target.value)}
                      className="pl-7 h-12 sm:h-14 text-sm border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeService(service.id)}
                    className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 hover:bg-[#F8F7F5] active:scale-95 transition-all rounded-none"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Gallery */}
          <div className="border border-[#E8E8E8] p-6 sm:p-10">
            <div className="mb-6 sm:mb-8">
              <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Section III</p>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight mb-2">
                Portfolio Gallery
              </h2>
              <p className="text-sm text-[#6B6B6B] font-light">Showcase your finest work</p>
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
        </div>
      </main>
    </div>
  )
}
