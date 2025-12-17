"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft, ExternalLink, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function PrivacyPage() {
  const router = useRouter()
  const [downloading, setDownloading] = useState(false)

  const handleDownloadData = async () => {
    try {
      setDownloading(true)
      const response = await fetch('/api/user/export-data')
      
      if (!response.ok) {
        throw new Error('Failed to download data')
      }

      // Get the blob from response
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ivory-data-export-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Your data has been downloaded successfully')
    } catch (error) {
      console.error('Error downloading data:', error)
      toast.error('Failed to download data. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

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
            Privacy & Data
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-white mb-6">
          <h2 className="font-serif text-2xl font-light text-[#1A1A1A] tracking-tight mb-2">Your Privacy Matters</h2>
          <p className="text-sm text-[#6B6B6B] font-light mb-8">
            We're committed to protecting your personal information and being transparent about how we use your data.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-lg font-light text-[#1A1A1A] tracking-tight mb-3">What We Collect</h3>
              <ul className="text-sm text-[#6B6B6B] space-y-2 list-disc list-inside font-light">
                <li>Account information (username, email)</li>
                <li>Design images you upload</li>
                <li>AI-generated nail designs</li>
                <li>Communication with nail technicians</li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-lg font-light text-[#1A1A1A] tracking-tight mb-3">How We Use Your Data</h3>
              <ul className="text-sm text-[#6B6B6B] space-y-2 list-disc list-inside font-light">
                <li>To provide and improve our services</li>
                <li>To connect you with nail technicians</li>
                <li>To generate AI-enhanced designs</li>
                <li>To send service-related notifications</li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-lg font-light text-[#1A1A1A] tracking-tight mb-3">Your Rights</h3>
              <ul className="text-sm text-[#6B6B6B] space-y-2 list-disc list-inside font-light">
                <li>Access your personal data</li>
                <li>Request data correction or deletion</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-white mb-6">
          <h3 className="font-serif text-xl font-light text-[#1A1A1A] tracking-tight mb-6">Data Management</h3>
          <div className="space-y-3">
            <button
              onClick={handleDownloadData}
              disabled={downloading}
              className="w-full h-12 border border-[#E8E8E8] text-[#1A1A1A] font-light text-sm tracking-wider uppercase hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300 flex items-center justify-between px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{downloading ? 'Preparing Download...' : 'Download My Data'}</span>
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1} />
              ) : (
                <Download className="w-4 h-4" strokeWidth={1} />
              )}
            </button>
            
            <button
              onClick={() => router.push("/settings/delete-account")}
              className="w-full h-12 border border-red-200 text-red-600 font-light text-sm tracking-wider uppercase hover:bg-red-50 active:scale-95 transition-all duration-300 flex items-center justify-between px-4"
            >
              <span>Delete My Account</span>
              <ArrowLeft className="w-4 h-4 rotate-180" strokeWidth={1} />
            </button>
          </div>
        </div>

        <button
          onClick={() => router.push("/privacy-policy")}
          className="w-full text-sm text-[#6B6B6B] font-light hover:text-[#8B7355] transition-colors flex items-center justify-center gap-2"
        >
          View Full Privacy Policy
          <ExternalLink className="w-3 h-3" strokeWidth={1} />
        </button>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} />
    </div>
  )
}
