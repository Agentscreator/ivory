"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, X } from "lucide-react"

type Service = {
  id: string
  name: string
  price: string
}

export default function TechProfileSetupPage() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [services, setServices] = useState<Service[]>([
    { id: "1", name: "Full Set", price: "60" },
    { id: "2", name: "Gel Manicure", price: "45" },
  ])

  const addService = () => {
    setServices([...services, { id: Date.now().toString(), name: "", price: "" }])
  }

  const removeService = (id: string) => {
    setServices(services.filter((s) => s.id !== id))
  }

  const updateService = (id: string, field: "name" | "price", value: string) => {
    setServices(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const handleSave = () => {
    // Save to localStorage or API
    localStorage.setItem(
      "techProfile",
      JSON.stringify({
        businessName,
        bio,
        location,
        services,
      }),
    )
    router.push("/tech/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-serif text-xl font-bold text-charcoal">Tech Profile</h1>
          </div>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Business Info */}
          <Card className="p-6 bg-white">
            <h2 className="font-serif text-xl font-bold text-charcoal mb-4">Business Information</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-charcoal mb-2 block">Business Name</label>
                <Input
                  placeholder="Your salon or business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-charcoal mb-2 block">Location</label>
                <Input placeholder="City, State" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-semibold text-charcoal mb-2 block">Bio</label>
                <Textarea
                  placeholder="Tell clients about your experience and style..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </Card>

          {/* Services & Prices */}
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold text-charcoal">Services & Prices</h2>
              <Button size="sm" variant="outline" onClick={addService}>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>

            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="flex gap-2 items-start">
                  <Input
                    placeholder="Service name"
                    value={service.name}
                    onChange={(e) => updateService(service.id, "name", e.target.value)}
                    className="flex-1"
                  />
                  <div className="relative w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      placeholder="0"
                      type="number"
                      value={service.price}
                      onChange={(e) => updateService(service.id, "price", e.target.value)}
                      className="pl-7"
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeService(service.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Gallery */}
          <Card className="p-6 bg-white">
            <h2 className="font-serif text-xl font-bold text-charcoal mb-4">Portfolio Gallery</h2>
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">Upload photos of your best work</p>
              <Button variant="outline">Choose Photos</Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
