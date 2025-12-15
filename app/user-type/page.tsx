"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sparkles, Scissors } from "lucide-react"

export default function UserTypePage() {
  const router = useRouter()

  const selectUserType = async (type: "client" | "tech") => {
    try {
      const userStr = localStorage.getItem("ivoryUser")
      if (!userStr) {
        router.push("/")
        return
      }

      const user = JSON.parse(userStr)
      
      // Update user type in database
      const response = await fetch('/api/users/update-type', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userType: type }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        localStorage.setItem("ivoryUser", JSON.stringify(updatedUser))
        
        if (type === 'tech') {
          router.push("/tech/profile-setup")
        } else {
          router.push("/permissions")
        }
      }
    } catch (error) {
      console.error('Error updating user type:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12 sm:mb-16 px-4">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 sm:mb-6 font-light">Welcome</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#1A1A1A] mb-4 sm:mb-6 tracking-tight">
            Choose Your Experience
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] font-light max-w-xl mx-auto leading-relaxed">
            Select how you'd like to experience Ivory's Choice
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {/* Client Option */}
          <div
            className="border border-[#E8E8E8] hover:border-[#8B7355] transition-all duration-500 cursor-pointer group"
            onClick={() => selectUserType("client")}
          >
            <div className="p-8 sm:p-12 text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 border border-[#E8E8E8] group-hover:border-[#8B7355] transition-colors duration-500 flex items-center justify-center">
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-[#1A1A1A] group-hover:text-[#8B7355] transition-colors duration-500" strokeWidth={1} />
              </div>
              <h2 className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] mb-4 font-light">
                For Clients
              </h2>
              <p className="text-sm sm:text-base text-[#6B6B6B] mb-8 font-light leading-relaxed">
                Create bespoke nail designs with AI, curate your collection, and connect with master artisans
              </p>
              <Button className="w-full h-12 sm:h-14 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 text-xs tracking-widest uppercase rounded-none font-light">
                Begin Journey
              </Button>
            </div>
          </div>

          {/* Tech Option */}
          <div
            className="border border-[#E8E8E8] hover:border-[#8B7355] transition-all duration-500 cursor-pointer group"
            onClick={() => selectUserType("tech")}
          >
            <div className="p-8 sm:p-12 text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 border border-[#E8E8E8] group-hover:border-[#8B7355] transition-colors duration-500 flex items-center justify-center">
                <Scissors className="w-10 h-10 sm:w-12 sm:h-12 text-[#1A1A1A] group-hover:text-[#8B7355] transition-colors duration-500" strokeWidth={1} />
              </div>
              <h2 className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] mb-4 font-light">
                For Artisans
              </h2>
              <p className="text-sm sm:text-base text-[#6B6B6B] mb-8 font-light leading-relaxed">
                Receive client designs, curate your portfolio, and showcase your exceptional craftsmanship
              </p>
              <Button className="w-full h-12 sm:h-14 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 text-xs tracking-widest uppercase rounded-none font-light">
                Begin Journey
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
