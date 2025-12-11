"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function NotificationsPage() {
  const router = useRouter()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [designRequests, setDesignRequests] = useState(true)
  const [messages, setMessages] = useState(true)
  const [marketing, setMarketing] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Notifications</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        <Card className="p-6 bg-white rounded-2xl shadow-sm mb-4">
          <h2 className="font-semibold text-base mb-4 text-charcoal">Notification Channels</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Email Notifications</div>
                <div className="text-xs text-muted-foreground">Receive updates via email</div>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Push Notifications</div>
                <div className="text-xs text-muted-foreground">Receive alerts on your device</div>
              </div>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  pushNotifications ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pushNotifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-2xl shadow-sm">
          <h2 className="font-semibold text-base mb-4 text-charcoal">Notification Types</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Design Requests</div>
                <div className="text-xs text-muted-foreground">New requests and responses</div>
              </div>
              <button
                onClick={() => setDesignRequests(!designRequests)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  designRequests ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    designRequests ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Messages</div>
                <div className="text-xs text-muted-foreground">Direct messages from techs</div>
              </div>
              <button
                onClick={() => setMessages(!messages)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  messages ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    messages ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Marketing & Updates</div>
                <div className="text-xs text-muted-foreground">News and promotions</div>
              </div>
              <button
                onClick={() => setMarketing(!marketing)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  marketing ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    marketing ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
