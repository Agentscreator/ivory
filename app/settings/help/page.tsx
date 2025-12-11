"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send } from "lucide-react"

export default function HelpPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")

  useEffect(() => {
    const user = localStorage.getItem("ivoryUser")
    if (user) {
      const userData = JSON.parse(user)
      setUsername(userData.username)
      setEmail(userData.email || "")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject.trim() || !message.trim()) {
      setStatusMessage("Please fill in all fields")
      return
    }

    setIsSending(true)
    setStatusMessage("")

    try {
      const response = await fetch("/api/support/help-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          subject,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send help request")
      }

      setStatusMessage("Your help request has been sent successfully! We'll get back to you soon.")
      setSubject("")
      setMessage("")
      
      // Redirect back to settings after 2 seconds
      setTimeout(() => {
        router.push("/settings")
      }, 2000)
    } catch (error) {
      setStatusMessage("Failed to send help request. Please try again or email us directly at mirrosocial@gmail.com")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Help & Support</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        <Card className="p-6 bg-white rounded-2xl shadow-sm mb-4">
          <h2 className="font-serif text-xl font-bold text-charcoal mb-2">How can we help?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Send us a message and we'll get back to you as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isSending}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What do you need help with?"
                required
                disabled={isSending}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your issue or question in detail..."
                required
                disabled={isSending}
                rows={6}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {statusMessage && (
              <p className={`text-sm ${statusMessage.includes("success") ? "text-green-600" : "text-destructive"}`}>
                {statusMessage}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-12"
              disabled={isSending}
            >
              {isSending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Help Request
                </>
              )}
            </Button>
          </form>
        </Card>

        <Card className="p-6 bg-white rounded-2xl shadow-sm">
          <h3 className="font-semibold text-base mb-3 text-charcoal">Other Ways to Reach Us</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <strong className="text-charcoal">Email:</strong>{" "}
              <a href="mailto:mirrosocial@gmail.com" className="text-primary hover:underline">
                mirrosocial@gmail.com
              </a>
            </div>
            <div>
              <strong className="text-charcoal">Response Time:</strong> We typically respond within 24-48 hours
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
