'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Plus, User, Calendar, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsAppleWatch } from './watch-optimized-layout'
import { haptics } from '@/lib/haptics'

interface BottomNavProps {
  onCenterAction?: () => void
  centerActionLabel?: string
}

export function BottomNav({ onCenterAction, centerActionLabel = 'Create' }: BottomNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isWatch = useIsAppleWatch()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path)

  // Check if user is a tech
  const [userType, setUserType] = React.useState<'client' | 'tech'>('client')
  
  React.useEffect(() => {
    const userStr = localStorage.getItem('ivoryUser')
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserType(user.userType || 'client')
    }
  }, [])

  const navItems = [
    { icon: Home, label: 'Home', path: '/home', altPaths: ['/bookings', '/book', '/tech/dashboard', '/tech/bookings'] },
    { icon: User, label: 'Profile', path: '/profile', altPaths: ['/settings', '/billing'] },
  ]

  return (
    <>
      {/* Desktop Vertical Sidebar */}
      <nav className="vertical-sidebar hidden lg:flex fixed left-0 top-0 bottom-0 z-30 w-20 flex-col items-center justify-center bg-white/98 backdrop-blur-sm border-r border-[#E8E8E8]">
        <div className="flex flex-col items-center space-y-6">
          {/* Home navigation item */}
          <button
            onClick={async () => {
              haptics.light()
              const userStr = localStorage.getItem("ivoryUser");
              if (userStr) {
                const user = JSON.parse(userStr);
                if (user.userType === 'tech') {
                  router.push('/tech/dashboard');
                  return;
                }
              }
              router.push('/home')
            }}
            className={cn(
              'flex items-center justify-center transition-all duration-300 relative',
              'active:scale-95 w-12 h-12 rounded-lg',
              (isActive('/home') || isActive('/tech/dashboard'))
                ? 'text-[#1A1A1A] bg-[#F8F7F5]'
                : 'text-[#6B6B6B] hover:text-[#8B7355] hover:bg-[#F8F7F5]/50'
            )}
          >
            <Home className="w-6 h-6" strokeWidth={(isActive('/home') || isActive('/tech/dashboard')) ? 1.5 : 1} />
            {(isActive('/home') || isActive('/tech/dashboard')) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#1A1A1A] rounded-r-full" />
            )}
          </button>

          {/* Bookings for Tech Users */}
          {userType === 'tech' && (
            <button
              onClick={() => {
                haptics.light()
                router.push('/tech/bookings')
              }}
              className={cn(
                'flex items-center justify-center transition-all duration-300 relative',
                'active:scale-95 w-12 h-12 rounded-lg',
                isActive('/tech/bookings')
                  ? 'text-[#1A1A1A] bg-[#F8F7F5]'
                  : 'text-[#6B6B6B] hover:text-[#8B7355] hover:bg-[#F8F7F5]/50'
              )}
            >
              <Calendar className="w-6 h-6" strokeWidth={isActive('/tech/bookings') ? 1.5 : 1} />
              {isActive('/tech/bookings') && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#1A1A1A] rounded-r-full" />
              )}
            </button>
          )}

          {/* Center Action Button */}
          <button
            onClick={() => {
              haptics.medium()
              onCenterAction?.()
            }}
            className="relative flex items-center justify-center bg-[#1A1A1A] hover:bg-[#8B7355] active:scale-95 transition-all duration-300 w-12 h-12 rounded-lg"
          >
            <Plus className="w-6 h-6 text-white" strokeWidth={1.5} />
          </button>

          {/* Profile navigation item */}
          <button
            onClick={() => {
              haptics.light()
              router.push('/profile')
            }}
            className={cn(
              'flex items-center justify-center transition-all duration-300 relative',
              'active:scale-95 w-12 h-12 rounded-lg',
              isActive('/profile')
                ? 'text-[#1A1A1A] bg-[#F8F7F5]'
                : 'text-[#6B6B6B] hover:text-[#8B7355] hover:bg-[#F8F7F5]/50'
            )}
          >
            <User className="w-6 h-6" strokeWidth={isActive('/profile') ? 1.5 : 1} />
            {isActive('/profile') && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#1A1A1A] rounded-r-full" />
            )}
          </button>

          {/* Settings for Tech Users */}
          {userType === 'tech' && (
            <button
              onClick={() => {
                haptics.light()
                router.push('/tech/settings')
              }}
              className={cn(
                'flex items-center justify-center transition-all duration-300 relative',
                'active:scale-95 w-12 h-12 rounded-lg',
                isActive('/tech/settings')
                  ? 'text-[#1A1A1A] bg-[#F8F7F5]'
                  : 'text-[#6B6B6B] hover:text-[#8B7355] hover:bg-[#F8F7F5]/50'
              )}
            >
              <Settings className="w-6 h-6" strokeWidth={isActive('/tech/settings') ? 1.5 : 1} />
              {isActive('/tech/settings') && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#1A1A1A] rounded-r-full" />
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-30 safe-bottom lg:hidden",
        isWatch && "watch-nav"
      )}>
        {/* Elegant backdrop */}
        <div className="absolute inset-0 bg-white/98 backdrop-blur-sm border-t border-[#E8E8E8]" />
        
        <div className={cn(
          "relative max-w-screen-xl mx-auto",
          isWatch ? "px-2" : "px-6 sm:px-8"
        )}>
          <div className={cn(
            "flex items-center",
            isWatch ? "h-12" : "h-16 sm:h-18",
            "max-w-md mx-auto",
            userType === 'tech' ? "justify-around" : "justify-around"
          )}>
            {/* Home Button */}
            <button
              onClick={() => {
                haptics.light();
                const userStr = localStorage.getItem("ivoryUser");
                if (userStr) {
                  const user = JSON.parse(userStr);
                  if (user.userType === 'tech') {
                    router.push('/tech/dashboard');
                  } else {
                    router.push('/home');
                  }
                } else {
                  router.push('/home');
                }
              }}
              className={cn(
                'flex flex-col items-center justify-center transition-all duration-300 relative',
                'active:scale-95',
                isWatch ? 'w-10 h-10 watch-nav-item' : 'w-12 h-12',
                (isActive('/home') || isActive('/tech/dashboard'))
                  ? 'text-[#1A1A1A]' 
                  : 'text-[#6B6B6B] hover:text-[#8B7355]'
              )}
            >
              <Home className={isWatch ? "w-4 h-4" : "w-6 h-6"} strokeWidth={(isActive('/home') || isActive('/tech/dashboard')) ? 1.5 : 1} />
              {isWatch && <span className="text-[8px] mt-0.5">Home</span>}
              {(isActive('/home') || isActive('/tech/dashboard')) && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1A1A1A] rounded-full" />
              )}
            </button>

            {/* Bookings for Tech Users */}
            {userType === 'tech' && (
              <button
                onClick={() => {
                  haptics.light();
                  router.push('/tech/bookings');
                }}
                className={cn(
                  'flex flex-col items-center justify-center transition-all duration-300 relative',
                  'active:scale-95',
                  isWatch ? 'w-10 h-10 watch-nav-item' : 'w-12 h-12',
                  isActive('/tech/bookings')
                    ? 'text-[#1A1A1A]' 
                    : 'text-[#6B6B6B] hover:text-[#8B7355]'
                )}
              >
                <Calendar className={isWatch ? "w-4 h-4" : "w-6 h-6"} strokeWidth={isActive('/tech/bookings') ? 1.5 : 1} />
                {isWatch && <span className="text-[8px] mt-0.5">Book</span>}
                {isActive('/tech/bookings') && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1A1A1A] rounded-full" />
                )}
              </button>
            )}

            {/* Center Action Button */}
            <button
              onClick={() => {
                haptics.medium();
                onCenterAction?.();
              }}
              className={cn(
                "relative flex items-center justify-center bg-[#1A1A1A] hover:bg-[#8B7355] active:scale-95 transition-all duration-300",
                isWatch ? "w-10 h-10 rounded-full" : "w-12 h-12 -mt-2"
              )}
            >
              <Plus className={isWatch ? "w-5 h-5 text-white" : "w-6 h-6 text-white"} strokeWidth={1.5} />
            </button>

            {/* Profile Button */}
            <button
              onClick={() => {
                haptics.light();
                router.push('/profile');
              }}
              className={cn(
                'flex flex-col items-center justify-center transition-all duration-300 relative',
                'active:scale-95',
                isWatch ? 'w-10 h-10 watch-nav-item' : 'w-12 h-12',
                isActive('/profile')
                  ? 'text-[#1A1A1A]' 
                  : 'text-[#6B6B6B] hover:text-[#8B7355]'
              )}
            >
              <User className={isWatch ? "w-4 h-4" : "w-6 h-6"} strokeWidth={isActive('/profile') ? 1.5 : 1} />
              {isWatch && <span className="text-[8px] mt-0.5">Profile</span>}
              {isActive('/profile') && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1A1A1A] rounded-full" />
              )}
            </button>

            {/* Settings for Tech Users */}
            {userType === 'tech' && (
              <button
                onClick={() => {
                  haptics.light();
                  router.push('/tech/settings');
                }}
                className={cn(
                  'flex flex-col items-center justify-center transition-all duration-300 relative',
                  'active:scale-95',
                  isWatch ? 'w-10 h-10 watch-nav-item' : 'w-12 h-12',
                  isActive('/tech/settings')
                    ? 'text-[#1A1A1A]' 
                    : 'text-[#6B6B6B] hover:text-[#8B7355]'
                )}
              >
                <Settings className={isWatch ? "w-4 h-4" : "w-6 h-6"} strokeWidth={isActive('/tech/settings') ? 1.5 : 1} />
                {isWatch && <span className="text-[8px] mt-0.5">Settings</span>}
                {isActive('/tech/settings') && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1A1A1A] rounded-full" />
                )}
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
