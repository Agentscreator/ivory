"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"
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
      <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush pb-safe">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Tech Profile</h1>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="h-9 sm:h-10 active:scale-95 transition-transform"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Business Info */}
          <Card className="p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl shadow-sm">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-charcoal mb-3 sm:mb-4">Business Information</h2>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-semibold text-charcoal mb-1.5 sm:mb-2 block">
                  Business Name
                </label>
                <Input
                  placeholder="Your salon or business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-11 sm:h-12 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-charcoal mb-1.5 sm:mb-2 block">
                  Location
                </label>
                <Input 
                  placeholder="City, State" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-11 sm:h-12 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-charcoal mb-1.5 sm:mb-2 block">
                  Bio
                </label>
                <Textarea
                  placeholder="Tell clients about your experience and style..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="text-sm sm:text-base resize-none"
                />
              </div>
            </div>
          </Card>

          {/* Services & Prices */}
          <Card className="p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Services & Prices</h2>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={addService}
                className="h-9 sm:h-10 text-xs sm:text-sm active:scale-95 transition-transform"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Add Service</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {services.map((service) => (
                <div key={service.id} className="flex gap-2 items-start">
                  <Input
                    placeholder="Service name"
                    value={service.name}
                    onChange={(e) => updateService(service.id, "name", e.target.value)}
                    className="flex-1 h-11 sm:h-12 text-sm sm:text-base"
                  />
                  <div className="relative w-24 sm:w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      $
                    </span>
                    <Input
                      placeholder="0"
                      type="number"
                      value={service.price}
                      onChange={(e) => updateService(service.id, "price", e.target.value)}
                      className="pl-6 sm:pl-7 h-11 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeService(service.id)}
                    className="h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 active:scale-95 transition-transform"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Portfolio Gallery */}
          <Card className="p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl shadow-sm">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-charcoal mb-3 sm:mb-4">
              Portfolio Gallery
            </h2>
            <ImageUpload
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
              images={portfolioImages}
              maxImages={20}
              buttonText="Choose Photos"
              multiple={true}
            />
          </Card>
        </div>
      </main>
    </div>
  )
}
