'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Home, Plus, User, Settings } from 'lucide-react'
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

  const navItems = [
    { icon: Home, label: 'Home', path: '/home', altPaths: ['/bookings', '/book', '/tech/dashboard', '/tech/bookings'] },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings', altPaths: ['/billing'] },
  ]

  return (
    <>
      {/* Desktop Vertical Sidebar */}
      <nav className="vertical-sidebar hidden lg:flex fixed left-0 top-0 bottom-0 z-30 w-20 flex-col items-center justify-center bg-white/98 backdrop-blur-sm border-r border-[#E8E8E8]">
        <div className="flex flex-col items-center space-y-6">
          {/* First navigation item - Home */}
          {navItems.slice(0, 1).map((item) => {
            const Icon = item.icon
            const active = isActive(item.path) || item.altPaths?.some(p => isActive(p))
            
            return (
              <button
                key={item.path}
                onClick={async () => {
                  haptics.light()
                  // Special handling for home button
                  const userStr = localStorage.getItem("ivoryUser");
                  if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user.userType === 'tech') {
                      router.push('/tech/dashboard');
                      return;
                    }
                  }
                  router.push(item.path)
                }}
                className={cn(
                  'flex items-center justify-center transition-all duration-300 relative',
                  'active:scale-95 w-12 h-12 rounded-lg',
                  active
                    ? 'text-[#1A1A1A] bg-[#F8F7F5]'
                    : 'text-[#6B6B6B] hover:text-[#8B7355] hover:bg-[#F8F7F5]/50'
                )}
              >
                <Icon className="w-6 h-6" strokeWidth={active ? 1.5 : 1} />
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#1A1A1A] rounded-r-full" />
                )}
              </button>
            )
          })}

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

          {/* Last two navigation items - Profile & Settings */}
          {navItems.slice(1).map((item) => {
            const Icon = item.icon
            const active = isActive(item.path) || item.altPaths?.some(p => isActive(p))
            
            return (
              <button
                key={item.path}
                onClick={() => {
                  haptics.light()
                  router.push(item.path)
                }}
                className={cn(
                  'flex items-center justify-center transition-all duration-300 relative',
                  'active:scale-95 w-12 h-12 rounded-lg',
                  active
                    ? 'text-[#1A1A1A] bg-[#F8F7F5]'
                    : 'text-[#6B6B6B] hover:text-[#8B7355] hover:bg-[#F8F7F5]/50'
                )}
              >
                <Icon className="w-6 h-6" strokeWidth={active ? 1.5 : 1} />
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#1A1A1A] rounded-r-full" />
                )}
              </button>
            )
          })}
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
            "flex items-center justify-around",
            isWatch ? "h-12" : "h-16 sm:h-18",
            "max-w-md mx-auto"
          )}>
            {/* Home Button */}
            <button
              onClick={() => {
                haptics.light();
                // Check user type and route accordingly
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
                isActive('/home') || isActive('/bookings') || isActive('/book') || isActive('/tech/dashboard') || isActive('/tech/bookings')
                  ? 'text-[#1A1A1A]' 
                  : 'text-[#6B6B6B] hover:text-[#8B7355]'
              )}
            >
              <Home className={isWatch ? "w-4 h-4" : "w-6 h-6"} strokeWidth={(isActive('/home') || isActive('/bookings') || isActive('/book') || isActive('/tech/dashboard') || isActive('/tech/bookings')) ? 1.5 : 1} />
              {isWatch && <span className="text-[8px] mt-0.5">Home</span>}
              {(isActive('/home') || isActive('/bookings') || isActive('/book') || isActive('/tech/dashboard') || isActive('/tech/bookings')) && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1A1A1A] rounded-full" />
              )}
            </button>

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

            {/* Settings Button */}
            <button
              onClick={() => {
                haptics.light();
                router.push('/settings');
              }}
              className={cn(
                'flex flex-col items-center justify-center transition-all duration-300 relative',
                'active:scale-95',
                isWatch ? 'w-10 h-10 watch-nav-item' : 'w-12 h-12',
                isActive('/settings') || isActive('/billing')
                  ? 'text-[#1A1A1A]' 
                  : 'text-[#6B6B6B] hover:text-[#8B7355]'
              )}
            >
              <Settings className={isWatch ? "w-4 h-4" : "w-6 h-6"} strokeWidth={(isActive('/settings') || isActive('/billing')) ? 1.5 : 1} />
              {isWatch && <span className="text-[8px] mt-0.5">Settings</span>}
              {(isActive('/settings') || isActive('/billing')) && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1A1A1A] rounded-full" />
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
