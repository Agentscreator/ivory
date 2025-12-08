"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Scissors } from "lucide-react"

export default function UserTypePage() {
  const router = useRouter()

  const selectUserType = (type: "client" | "tech") => {
    localStorage.setItem("ivoryUserType", type)
    router.push("/permissions")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl font-bold text-charcoal mb-3">Welcome to Ivory</h1>
          <p className="text-lg text-foreground/70">How would you like to use the app?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card
            className="border-2 border-border hover:border-primary hover:shadow-xl transition-all cursor-pointer bg-white/95 backdrop-blur"
            onClick={() => selectUserType("client")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-terracotta to-rose flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-charcoal mb-3">Design My Nails</h2>
              <p className="text-muted-foreground mb-6">
                Create stunning nail designs with AI, share with friends, and connect with nail techs
              </p>
              <Button className="w-full" size="lg">
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card
            className="border-2 border-border hover:border-primary hover:shadow-xl transition-all cursor-pointer bg-white/95 backdrop-blur"
            onClick={() => selectUserType("tech")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-charcoal to-primary flex items-center justify-center">
                <Scissors className="w-10 h-10 text-white" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-charcoal mb-3">I'm a Nail Tech</h2>
              <p className="text-muted-foreground mb-6">
                Receive client designs, manage appointments, and showcase your portfolio
              </p>
              <Button className="w-full bg-transparent" size="lg" variant="outline">
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
