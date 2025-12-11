"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ExternalLink } from "lucide-react"

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Privacy & Data</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        <Card className="p-6 bg-white rounded-2xl shadow-sm mb-4">
          <h2 className="font-serif text-xl font-bold text-charcoal mb-4">Your Privacy Matters</h2>
          <p className="text-sm text-muted-foreground mb-6">
            We're committed to protecting your personal information and being transparent about how we use your data.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-2">What We Collect</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Account information (username, email)</li>
                <li>Design images you upload</li>
                <li>AI-generated nail designs</li>
                <li>Communication with nail technicians</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2">How We Use Your Data</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>To provide and improve our services</li>
                <li>To connect you with nail technicians</li>
                <li>To generate AI-enhanced designs</li>
                <li>To send service-related notifications</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2">Your Rights</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Access your personal data</li>
                <li>Request data correction or deletion</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-2xl shadow-sm mb-4">
          <h3 className="font-semibold text-sm mb-3">Data Management</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-between h-12 active:scale-95 transition-transform"
              onClick={() => {
                // TODO: Implement data export
                alert("Data export feature coming soon")
              }}
            >
              <span className="text-sm">Download My Data</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-between h-12 active:scale-95 transition-transform"
              onClick={() => router.push("/settings/delete-account")}
            >
              <span className="text-sm text-destructive">Delete My Account</span>
              <ArrowLeft className="w-4 h-4 rotate-180 text-destructive" />
            </Button>
          </div>
        </Card>

        <Button
          variant="link"
          className="w-full text-sm text-muted-foreground"
          onClick={() => router.push("/privacy-policy")}
        >
          View Full Privacy Policy
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
      </main>
    </div>
  )
}
