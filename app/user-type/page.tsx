"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Paintbrush } from "lucide-react"

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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 px-2 sm:px-4">
          <p className="text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.35em] uppercase text-[#8B7355] mb-3 sm:mb-4 lg:mb-6 font-light">Welcome</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-[#1A1A1A] mb-3 sm:mb-4 lg:mb-6 tracking-tight leading-[1.1]">
            Choose Your Experience
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-[#6B6B6B] font-light max-w-2xl mx-auto leading-[1.7] tracking-wide">
            Select how you'd like to experience Ivory's Choice
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 lg:gap-10">
          {/* Client Option */}
          <div
            className="border border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-xl hover:shadow-[#8B7355]/5 transition-all duration-700 cursor-pointer group active:scale-[0.98]"
            onClick={() => selectUserType("client")}
          >
            <div className="p-6 sm:p-8 lg:p-10 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-5 lg:mb-6 border border-[#E8E8E8] group-hover:border-[#8B7355] group-hover:scale-105 transition-all duration-700 flex items-center justify-center">
                <Paintbrush className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#1A1A1A] group-hover:text-[#8B7355] transition-colors duration-700" strokeWidth={1} />
              </div>
              <h2 className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] mb-3 sm:mb-4 font-light">
                For Clients
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-[#6B6B6B] mb-5 sm:mb-6 lg:mb-8 font-light leading-[1.7] tracking-wide px-2">
                Design it once. Get it right. Connect with nail techs who bring your vision to life.
              </p>
              <Button className="w-full h-12 sm:h-14 lg:h-16 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-700 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98]">
                Begin Journey
              </Button>
            </div>
          </div>

          {/* Tech Option */}
          <div
            className="border border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-xl hover:shadow-[#8B7355]/5 transition-all duration-700 cursor-pointer group active:scale-[0.98]"
            onClick={() => selectUserType("tech")}
          >
            <div className="p-6 sm:p-8 lg:p-10 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-5 lg:mb-6 border border-[#E8E8E8] group-hover:border-[#8B7355] group-hover:scale-105 transition-all duration-700 flex items-center justify-center relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 relative">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    {/* Nail/Foot shape (left side) */}
                    <path d="M 20 30 Q 18 35 18 42 L 18 60 Q 18 68 24 72 Q 28 75 35 75 L 40 75 Q 45 75 48 72 Q 52 68 52 62 L 52 42 Q 52 35 50 30 Z" className="fill-[#1A1A1A] group-hover:fill-[#8B7355] transition-colors duration-700"/>
                    
                    {/* Nail polish bottle (right side) */}
                    {/* Bottle cap */}
                    <rect x="58" y="22" width="18" height="8" rx="2" className="fill-[#1A1A1A] group-hover:fill-[#8B7355] transition-colors duration-700"/>
                    
                    {/* Bottle neck */}
                    <rect x="60" y="30" width="14" height="6" className="fill-[#1A1A1A] group-hover:fill-[#8B7355] transition-colors duration-700"/>
                    
                    {/* Bottle body */}
                    <path d="M 58 36 L 58 58 Q 58 62 62 64 L 72 64 Q 76 62 76 58 L 76 36 Z" className="fill-[#1A1A1A] group-hover:fill-[#8B7355] transition-colors duration-700"/>
                    
                    {/* Brush handle */}
                    <rect x="65" y="30" width="4" height="18" className="fill-[#1A1A1A] group-hover:fill-[#8B7355] transition-colors duration-700"/>
                    
                    {/* Brush bristles */}
                    <ellipse cx="67" cy="49" rx="3" ry="5" className="fill-[#1A1A1A] group-hover:fill-[#8B7355] transition-colors duration-700"/>
                  </svg>
                </div>
              </div>
              <h2 className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] mb-3 sm:mb-4 font-light">
                For Nail Techs
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-[#6B6B6B] mb-5 sm:mb-6 lg:mb-8 font-light leading-[1.7] tracking-wide px-2">
                Receive client designs, curate your portfolio, and showcase your exceptional work
              </p>
              <Button className="w-full h-12 sm:h-14 lg:h-16 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-700 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98]">
                Begin Journey
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
