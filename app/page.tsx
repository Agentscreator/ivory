"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isChecking, setIsChecking] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)

  // Check for existing session and referral code on mount
  useEffect(() => {
    // Get referral code from URL
    const urlParams = new URLSearchParams(window.location.search)
    const refCode = urlParams.get('ref')
    if (refCode) {
      setReferralCode(refCode)
      setIsSignUp(true) // Auto-switch to signup mode if there's a referral code
    }

    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        
        if (data.user) {
          // User is already logged in, redirect them
          localStorage.setItem("ivoryUser", JSON.stringify(data.user))
          if (data.user.userType === 'tech') {
            router.push('/tech/dashboard')
          } else if (data.user.userType === 'client') {
            router.push('/home')
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
        
        // If user already has a type, go to home, otherwise select type
        if (user.userType) {
          router.push(user.userType === 'tech' ? '/tech/dashboard' : '/home')
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
    // TODO: Implement proper OAuth flow
    // This requires:
    // 1. OAuth provider configuration (Google/Apple credentials)
    // 2. OAuth callback endpoint
    // 3. Token exchange and verification
    // 4. Secure user creation/login
    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} authentication is not yet configured. Please use email/password login or contact support.`)
  }

  // Show loading state while checking session
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush flex items-center justify-center">
        <div className="text-charcoal">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mb-2">Ivory</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {referralCode ? "🎉 You've been invited! Get 5 free credits" : isSignUp ? "Create your account" : "Welcome back"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-3 sm:space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 sm:h-14 text-base"
                required
              />
            </div>
            {isSignUp && (
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 sm:h-14 text-base"
                  required
                />
              </div>
            )}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 sm:h-14 text-base pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-charcoal transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            <Button type="submit" className="w-full h-12 sm:h-14 text-base font-semibold">
              {isSignUp ? "Sign Up" : "Log In"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 sm:h-14 bg-transparent text-base"
              onClick={() => handleSocialAuth("google")}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign {isSignUp ? "up" : "in"} with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 sm:h-14 bg-transparent text-base"
              onClick={() => handleSocialAuth("apple")}
            >
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Sign {isSignUp ? "up" : "in"} with Apple
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="text-base font-medium text-primary hover:underline"
            >
              {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground space-x-3">
            <button 
              type="button"
              onClick={() => router.push('/privacy-policy')}
              className="hover:underline"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button 
              type="button"
              onClick={() => router.push('/terms')}
              className="hover:underline"
            >
              Terms of Service
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
