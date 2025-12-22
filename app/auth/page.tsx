"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Capacitor } from "@capacitor/core"
import { Browser } from "@capacitor/browser"
import { Haptics, ImpactStyle } from "@capacitor/haptics"
// import { signInWithAppleNative } from "@/lib/native-apple-auth" // Temporarily disabled - waiting for Capacitor 8 compatible version

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true')
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isChecking, setIsChecking] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Check for existing session and referral code on mount
  useEffect(() => {
    // Get referral code from URL
    const urlParams = new URLSearchParams(window.location.search)
    const refCode = urlParams.get('ref')
    if (refCode) {
      setReferralCode(refCode)
      setIsSignUp(true) // Auto-switch to signup mode if there's a referral code
      // Store referral code in cookie for OAuth flow (expires in 10 minutes)
      document.cookie = `pendingReferralCode=${refCode}; path=/; max-age=600; SameSite=Lax`
    }

    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        
        if (data.user) {
          // User is already logged in, redirect them
          localStorage.setItem("ivoryUser", JSON.stringify(data.user))
          
          // Check if there's a return URL stored
          const returnUrl = localStorage.getItem('returnUrl')
          if (returnUrl) {
            localStorage.removeItem('returnUrl')
            router.push(returnUrl)
            return
          }
          
          if (data.user.userType === 'tech') {
            router.push('/tech/dashboard')
          } else if (data.user.userType === 'client') {
            router.push('/capture')
          } else {
            router.push('/user-type')
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setIsChecking(false)
      }
    }
    
    checkSession()

    // Listen for OAuth completion from in-app browser
    const isNative = Capacitor.isNativePlatform();
    if (isNative) {
      // Poll for session after OAuth flow
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch('/api/auth/session')
          const data = await response.json()
          
          if (data.user) {
            clearInterval(pollInterval)
            localStorage.setItem("ivoryUser", JSON.stringify(data.user))
            
            if (data.user.userType === 'tech') {
              router.push('/tech/dashboard')
            } else if (data.user.userType === 'client') {
              router.push('/capture')
            } else {
              router.push('/user-type')
            }
          }
        } catch (error) {
          // Continue polling
        }
      }, 1000)

      // Clean up polling after 2 minutes
      setTimeout(() => clearInterval(pollInterval), 120000)

      return () => clearInterval(pollInterval)
    }
  }, [router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isSignUp) {
        // Sign up - create new user
        if (!email) {
          alert('Email is required for sign up')
          return
        }
        
        if (!acceptedTerms) {
          alert('You must accept the Terms of Service and Privacy Policy to create an account')
          return
        }
        
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username, 
            email, 
            password, 
            authProvider: 'email',
            referralCode: referralCode || undefined 
          }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          alert(error.error || 'Failed to sign up')
          return
        }
        
        const user = await response.json()
        localStorage.setItem("ivoryUser", JSON.stringify(user))
        
        // Check if there's a return URL stored
        const returnUrl = localStorage.getItem('returnUrl')
        if (returnUrl) {
          localStorage.removeItem('returnUrl')
          router.push(returnUrl)
          return
        }
        
        router.push("/user-type")
      } else {
        // Log in - find existing user
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          alert(error.error || 'Failed to log in')
          return
        }
        
        const user = await response.json()
        localStorage.setItem("ivoryUser", JSON.stringify(user))
        
        // Check if there's a return URL stored
        const returnUrl = localStorage.getItem('returnUrl')
        if (returnUrl) {
          localStorage.removeItem('returnUrl')
          router.push(returnUrl)
          return
        }
        
        // If user already has a type, go to capture/dashboard, otherwise select type
        if (user.userType) {
          router.push(user.userType === 'tech' ? '/tech/dashboard' : '/capture')
        } else {
          router.push("/user-type")
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const handleSocialAuth = async (provider: string) => {
    // Haptic feedback on button press
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {
        // Haptics not available, continue
      }
    }

    // Store referral code in cookie before OAuth redirect
    if (referralCode) {
      document.cookie = `pendingReferralCode=${referralCode}; path=/; max-age=600; SameSite=Lax`
    }
    
    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/api/auth/callback/${provider}`;
    const isNative = Capacitor.isNativePlatform();
    const isIOS = Capacitor.getPlatform() === 'ios';
    
    if (provider === 'google') {
      // Build Google OAuth URL
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleAuthUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '');
      googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
      googleAuthUrl.searchParams.set('response_type', 'code');
      googleAuthUrl.searchParams.set('scope', 'profile email');
      googleAuthUrl.searchParams.set('access_type', 'offline');
      googleAuthUrl.searchParams.set('prompt', 'consent');
      
      if (isNative) {
        // Use in-app browser (Safari View Controller on iOS)
        await Browser.open({ 
          url: googleAuthUrl.toString(),
          presentationStyle: 'popover' // Uses Safari View Controller on iOS
        });
      } else {
        // Web: redirect in same window
        window.location.href = googleAuthUrl.toString();
      }
    }
    else if (provider === 'apple') {
      // Build Apple OAuth URL for web
      const appleAuthUrl = new URL('https://appleid.apple.com/auth/authorize');
      appleAuthUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '');
      appleAuthUrl.searchParams.set('redirect_uri', redirectUri);
      appleAuthUrl.searchParams.set('response_type', 'code id_token');
      appleAuthUrl.searchParams.set('response_mode', 'form_post');
      appleAuthUrl.searchParams.set('scope', 'name email');
      
      if (isNative) {
        // Use in-app browser (Safari View Controller on iOS)
        await Browser.open({ 
          url: appleAuthUrl.toString(),
          presentationStyle: 'popover' // Uses Safari View Controller on iOS
        });
      } else {
        // Web: redirect in same window
        window.location.href = appleAuthUrl.toString();
      }
    }
  }

  // Show loading state while checking session
  if (isChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#1A1A1A] text-xs tracking-widest uppercase font-light">Loading...</div>
      </div>
    )
  }

  const isNative = Capacitor.isNativePlatform();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      {/* Back to Home Link - Only show on web, not in native iOS app */}
      {!isNative && (
        <button 
          onClick={() => router.push('/')}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-300 z-50 touch-manipulation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-4 sm:h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="text-xs tracking-wider uppercase font-light hidden sm:inline">Home</span>
        </button>
      )}

      <div className="w-full max-w-md">
        <div className="border border-[#E8E8E8] bg-white p-6 sm:p-8 md:p-12">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] mb-2 tracking-tight">
              IVORY'S CHOICE
            </h1>
            <p className="text-xs sm:text-sm tracking-wider uppercase text-[#6B6B6B] font-light mb-4">
              {referralCode ? "Exclusive Invitation" : isSignUp ? "Begin Your Journey" : "Welcome Back"}
            </p>
            
            {/* Account Toggle - Elegant & Aesthetic */}
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#E8E8E8] bg-[#FAFAF8] rounded-sm">
              <span className="text-xs tracking-wide text-[#6B6B6B] font-light">
                {isSignUp ? "Already have an account?" : "New to Ivory's Choice?"}
              </span>
              <button 
                type="button" 
                onClick={() => setIsSignUp(!isSignUp)} 
                className="text-sm font-normal text-[#8B7355] hover:text-[#1A1A1A] transition-colors duration-300 underline decoration-[#8B7355] decoration-1 underline-offset-2 touch-manipulation"
              >
                {isSignUp ? "Sign in" : "Create account"}
              </button>
            </div>
            
            {referralCode && (
              <p className="text-xs text-[#8B7355] mt-3 font-light">5 complimentary credits included</p>
            )}
          </div>

          <form onSubmit={handleAuth} className="space-y-4 sm:space-y-5 mt-6">
            <div>
              <label className="block text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 font-light">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-14 text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light touch-manipulation"
                required
              />
            </div>
            {isSignUp && (
              <div>
                <label className="block text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 font-light">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light touch-manipulation"
                  required
                />
              </div>
            )}
            <div className="relative">
              <label className="block text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 font-light">Password</label>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 pr-14 font-light touch-manipulation"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] p-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors touch-manipulation"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            {isSignUp && (
              <div className="border border-[#E8E8E8] bg-[#FAFAF8] p-5 sm:p-6">
                <label 
                  htmlFor="terms-checkbox" 
                  className="flex items-start gap-4 cursor-pointer group"
                >
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      id="terms-checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="peer h-5 w-5 cursor-pointer appearance-none border-2 border-[#E8E8E8] bg-white transition-all duration-300 checked:border-[#8B7355] checked:bg-[#8B7355] hover:border-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:ring-offset-2 touch-manipulation"
                      required
                    />
                    <svg 
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-300" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-[13px] text-[#1A1A1A] font-light leading-relaxed">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          router.push('/terms')
                        }}
                        className="text-[#8B7355] hover:text-[#1A1A1A] underline decoration-1 underline-offset-2 transition-colors duration-300 touch-manipulation font-normal"
                      >
                        Terms of Service
                      </button>
                      {" "}and{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          router.push('/privacy-policy')
                        }}
                        className="text-[#8B7355] hover:text-[#1A1A1A] underline decoration-1 underline-offset-2 transition-colors duration-300 touch-manipulation font-normal"
                      >
                        Privacy Policy
                      </button>
                    </p>
                    <p className="text-xs text-[#6B6B6B] font-light leading-relaxed mt-2 tracking-wide">
                      Including our zero-tolerance policy for objectionable content and abusive behavior.
                    </p>
                  </div>
                </label>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 text-xs tracking-widest uppercase rounded-none font-light mt-6 touch-manipulation"
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          {!isSignUp && (
            <div className="mt-5 text-center">
              <button 
                type="button" 
                onClick={() => router.push('/forgot-password')} 
                className="text-sm text-[#6B6B6B] hover:text-[#8B7355] transition-colors duration-300 font-light touch-manipulation"
              >
                Forgot password?
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-xs tracking-wider text-[#6B6B6B] space-x-3 font-light">
            <button 
              type="button"
              onClick={() => router.push('/privacy-policy')}
              className="hover:text-[#8B7355] transition-colors duration-300 touch-manipulation"
            >
              Privacy
            </button>
            <span>·</span>
            <button 
              type="button"
              onClick={() => router.push('/terms')}
              className="hover:text-[#8B7355] transition-colors duration-300 touch-manipulation"
            >
              Terms
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#1A1A1A] text-xs tracking-widest uppercase font-light">Loading...</div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}
