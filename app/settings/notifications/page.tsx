"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft } from "lucide-react"

export default function NotificationsPage() {
  const router = useRouter()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [designRequests, setDesignRequests] = useState(true)
  const [messages, setMessages] = useState(true)
  const [marketing, setMarketing] = useState(false)

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-6 py-4 sm:py-5 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="hover:bg-[#F8F7F5] active:scale-95 transition-all rounded-none"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1} />
          </Button>
          <h1 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">
            Notifications
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-white mb-6">
          <h2 className="font-serif text-xl font-light text-[#1A1A1A] tracking-tight mb-6">Notification Channels</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-serif text-base font-light text-[#1A1A1A]">Email Notifications</div>
                <div className="text-xs text-[#6B6B6B] font-light tracking-wider uppercase">Receive updates via email</div>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-7 w-12 items-center border transition-all duration-300 ${
                  emailNotifications 
                    ? "bg-[#8B7355] border-[#8B7355]" 
                    : "bg-white border-[#E8E8E8]"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 border border-[#E8E8E8] bg-white transition-all duration-300 ${
                    emailNotifications ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-serif text-base font-light text-[#1A1A1A]">Push Notifications</div>
                <div className="text-xs text-[#6B6B6B] font-light tracking-wider uppercase">Receive alerts on your device</div>
              </div>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`relative inline-flex h-7 w-12 items-center border transition-all duration-300 ${
                  pushNotifications 
                    ? "bg-[#8B7355] border-[#8B7355]" 
                    : "bg-white border-[#E8E8E8]"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 border border-[#E8E8E8] bg-white transition-all duration-300 ${
                    pushNotifications ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-white">
          <h2 className="font-serif text-xl font-light text-[#1A1A1A] tracking-tight mb-6">Notification Types</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-serif text-base font-light text-[#1A1A1A]">Design Requests</div>
                <div className="text-xs text-[#6B6B6B] font-light tracking-wider uppercase">New requests and responses</div>
              </div>
              <button
                onClick={() => setDesignRequests(!designRequests)}
                className={`relative inline-flex h-7 w-12 items-center border transition-all duration-300 ${
                  designRequests 
                    ? "bg-[#8B7355] border-[#8B7355]" 
                    : "bg-white border-[#E8E8E8]"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 border border-[#E8E8E8] bg-white transition-all duration-300 ${
                    designRequests ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-serif text-base font-light text-[#1A1A1A]">Messages</div>
                <div className="text-xs text-[#6B6B6B] font-light tracking-wider uppercase">Direct messages from techs</div>
              </div>
              <button
                onClick={() => setMessages(!messages)}
                className={`relative inline-flex h-7 w-12 items-center border transition-all duration-300 ${
                  messages 
                    ? "bg-[#8B7355] border-[#8B7355]" 
                    : "bg-white border-[#E8E8E8]"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 border border-[#E8E8E8] bg-white transition-all duration-300 ${
                    messages ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-serif text-base font-light text-[#1A1A1A]">Marketing & Updates</div>
                <div className="text-xs text-[#6B6B6B] font-light tracking-wider uppercase">News and promotions</div>
              </div>
              <button
                onClick={() => setMarketing(!marketing)}
                className={`relative inline-flex h-7 w-12 items-center border transition-all duration-300 ${
                  marketing 
                    ? "bg-[#8B7355] border-[#8B7355]" 
                    : "bg-white border-[#E8E8E8]"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 border border-[#E8E8E8] bg-white transition-all duration-300 ${
                    marketing ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} />
    </div>
  )
}
