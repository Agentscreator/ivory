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
      {/* Simple backdrop */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-xl border-t border-border/30" />
      
      <div className="relative max-w-screen-xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-around h-16 sm:h-18">
          {/* Home Button */}
          <button
            onClick={() => router.push('/home')}
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200',
              'active:scale-90',
              isActive('/home') 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:bg-muted/30'
            )}
          >
            <Home className="w-6 h-6" />
          </button>

          {/* Center Action Button */}
          <button
            onClick={onCenterAction}
            className="relative flex items-center justify-center w-14 h-14 -mt-2 rounded-2xl bg-gradient-to-br from-terracotta to-rose shadow-lg hover:shadow-xl active:scale-90 transition-all duration-200"
          >
            <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
          </button>

          {/* Profile Button */}
          <button
            onClick={() => router.push('/profile')}
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200',
              'active:scale-90',
              isActive('/profile') 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:bg-muted/30'
            )}
          >
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  )
}
