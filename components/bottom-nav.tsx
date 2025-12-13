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
      {/* Elegant backdrop with gradient border */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white to-white/80 backdrop-blur-xl" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      
      <div className="relative max-w-screen-xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-around h-20 sm:h-24">
          {/* Home Button */}
          <button
            onClick={() => router.push('/home')}
            className={cn(
              'group flex flex-col items-center justify-center min-w-[60px] transition-all duration-300',
              'hover:scale-105 active:scale-95',
              isActive('/home') ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <div className={cn(
              'relative p-3 rounded-2xl transition-all duration-300',
              isActive('/home') 
                ? 'bg-primary/10' 
                : 'group-hover:bg-muted/50'
            )}>
              <Home className={cn(
                'w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300',
                isActive('/home') && 'drop-shadow-sm'
              )} />
              {isActive('/home') && (
                <div className="absolute inset-0 rounded-2xl bg-primary/5 animate-pulse" />
              )}
            </div>
          </button>

          {/* Center Action Button */}
          <button
            onClick={onCenterAction}
            className="group relative flex flex-col items-center justify-center -mt-8 sm:-mt-10 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-terracotta/30 to-rose/30 blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
            
            {/* Main button */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-terracotta via-rose to-rose-600 shadow-2xl shadow-rose/25 group-hover:shadow-rose/40 transition-all duration-300">
              {/* Inner glow */}
              <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-white/20 to-transparent" />
              
              {/* Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Plus className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" strokeWidth={2.5} />
              </div>
            </div>
          </button>

          {/* Profile Button */}
          <button
            onClick={() => router.push('/profile')}
            className={cn(
              'group flex flex-col items-center justify-center min-w-[60px] transition-all duration-300',
              'hover:scale-105 active:scale-95',
              isActive('/profile') ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <div className={cn(
              'relative p-3 rounded-2xl transition-all duration-300',
              isActive('/profile') 
                ? 'bg-primary/10' 
                : 'group-hover:bg-muted/50'
            )}>
              <User className={cn(
                'w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300',
                isActive('/profile') && 'drop-shadow-sm'
              )} />
              {isActive('/profile') && (
                <div className="absolute inset-0 rounded-2xl bg-primary/5 animate-pulse" />
              )}
            </div>
          </button>
        </div>
      </div>
    </nav>
  )
}
