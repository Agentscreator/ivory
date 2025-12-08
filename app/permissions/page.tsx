"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, ImageIcon, Bell, Check } from "lucide-react"

type Permission = "camera" | "photos" | "notifications"

export default function PermissionsPage() {
  const router = useRouter()
  const [granted, setGranted] = useState<Set<Permission>>(new Set())

  const requestPermission = (permission: Permission) => {
    setGranted((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(permission)) {
        newSet.delete(permission)
      } else {
        newSet.add(permission)
      }
      return newSet
    })
  }

  const handleContinue = () => {
    router.push("/home")
  }

  const permissions = [
    {
      id: "camera" as Permission,
      icon: Camera,
      title: "Camera",
      description: "Take photos of your hands to design nail art in real-time",
    },
    {
      id: "photos" as Permission,
      icon: ImageIcon,
      title: "Photos",
      description: "Upload existing photos to apply nail designs",
    },
    {
      id: "notifications" as Permission,
      icon: Bell,
      title: "Push Notifications",
      description: "Get updates when your nail tech responds or approves designs",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-bold text-charcoal mb-3">Enable Permissions</h1>
          <p className="text-lg text-foreground/70">To get the best experience, we need a few permissions</p>
        </div>

        <div className="space-y-4 mb-8">
          {permissions.map((permission) => (
            <Card
              key={permission.id}
              className={`border-2 transition-all cursor-pointer bg-white/95 backdrop-blur ${
                granted.has(permission.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => requestPermission(permission.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta to-rose flex items-center justify-center flex-shrink-0">
                    <permission.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-charcoal mb-1">{permission.title}</h3>
                    <p className="text-sm text-muted-foreground">{permission.description}</p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      granted.has(permission.id) ? "bg-primary border-primary" : "border-muted-foreground/30"
                    }`}
                  >
                    {granted.has(permission.id) && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4">
          <Button variant="outline" size="lg" className="flex-1 bg-transparent" onClick={handleContinue}>
            Skip for Now
          </Button>
          <Button size="lg" className="flex-1" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
