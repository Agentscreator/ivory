'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Home, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  onCenterAction?: () => void
  centerActionLabel?: string
}

export function BottomNav({ onCenterAction, centerActionLabel = 'Create' }: BottomNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 safe-bottom">
      {/* Elegant backdrop */}
      <div className="absolute inset-0 bg-white/98 backdrop-blur-sm border-t border-[#E8E8E8]" />
      
      <div className="relative max-w-screen-xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-around h-16 sm:h-18">
          {/* Home Button */}
          <button
            onClick={() => router.push('/home')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 transition-all duration-300',
              'active:scale-95',
              isActive('/home') 
                ? 'text-[#1A1A1A]' 
                : 'text-[#6B6B6B] hover:text-[#8B7355]'
            )}
          >
            <Home className="w-5 h-5" strokeWidth={1} />
            <span className="text-[10px] tracking-wider uppercase font-light">Home</span>
          </button>

          {/* Center Action Button */}
          <button
            onClick={onCenterAction}
            className="relative flex items-center justify-center w-12 h-12 -mt-2 bg-[#1A1A1A] hover:bg-[#8B7355] active:scale-95 transition-all duration-300"
          >
            <Plus className="w-6 h-6 text-white" strokeWidth={1.5} />
          </button>

          {/* Profile Button */}
          <button
            onClick={() => router.push('/profile')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 transition-all duration-300',
              'active:scale-95',
              isActive('/profile') 
                ? 'text-[#1A1A1A]' 
                : 'text-[#6B6B6B] hover:text-[#8B7355]'
            )}
          >
            <User className="w-5 h-5" strokeWidth={1} />
            <span className="text-[10px] tracking-wider uppercase font-light">Profile</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
