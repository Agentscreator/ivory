'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Bell, Lock, Trash2, HelpCircle, UserX, CreditCard, ChevronRight, Coins, Wallet } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { StripeConnectWallet } from '@/components/stripe-connect-wallet';

export default function TechSettingsPage() {
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive');

  useEffect(() => {
    const loadUserData = async () => {
      const userStr = localStorage.getItem('ivoryUser');
      if (!userStr) {
        router.push('/');
        return;
      }

      const user = JSON.parse(userStr);
      setSubscriptionTier(user.subscriptionTier || 'free');
      setSubscriptionStatus(user.subscriptionStatus || 'inactive');

      // Load credits
      try {
        const response = await fetch('/api/user/credits');
        if (response.ok) {
          const data = await response.json();
          setCredits(data.credits);
        }
      } catch (error) {
        console.error('Error loading credits:', error);
      }
    };

    loadUserData();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24 lg:pl-20">
      {/* Header */}
      <header className="bg-white/98 backdrop-blur-md border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16 py-5 sm:py-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="w-10 h-10 flex items-center justify-center hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1} />
            </button>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">
              Settings
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-12 sm:py-16 lg:py-20 pb-safe">
        <div className="border border-[#E8E8E8] p-8 sm:p-10 lg:p-12 bg-white shadow-sm hover:shadow-lg transition-all duration-700">
          <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-tight mb-8">
            Settings
          </h3>

          {/* Privacy & Security */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 font-light">Privacy & Security</p>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/settings/privacy')}
                className="w-full border border-[#E8E8E8] p-4 bg-white hover:border-[#8B7355] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <Shield className="w-5 h-5 text-[#6B6B6B]" strokeWidth={1} />
                  <div className="text-left">
                    <p className="font-serif text-base font-light text-[#1A1A1A]">Privacy & Data</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#8B7355] transition-colors" strokeWidth={1} />
              </button>

              <button
                onClick={() => router.push('/settings/account')}
                className="w-full border border-[#E8E8E8] p-4 bg-white hover:border-[#8B7355] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <Lock className="w-5 h-5 text-[#6B6B6B]" strokeWidth={1} />
                  <div className="text-left">
                    <p className="font-serif text-base font-light text-[#1A1A1A]">Account Security</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#8B7355] transition-colors" strokeWidth={1} />
              </button>

              <button
                onClick={() => router.push('/settings/blocked-users')}
                className="w-full border border-[#E8E8E8] p-4 bg-white hover:border-[#8B7355] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <UserX className="w-5 h-5 text-[#6B6B6B]" strokeWidth={1} />
                  <div className="text-left">
                    <p className="font-serif text-base font-light text-[#1A1A1A]">Blocked Users</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#8B7355] transition-colors" strokeWidth={1} />
              </button>
            </div>
          </div>

          {/* Billing & Subscription */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 font-light">Billing & Subscription</p>
            <button
              onClick={() => router.push('/billing')}
              className="w-full border border-[#E8E8E8] p-4 bg-white hover:border-[#8B7355] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <CreditCard className="w-5 h-5 text-[#6B6B6B]" strokeWidth={1} />
                <div className="text-left">
                  <p className="font-serif text-base font-light text-[#1A1A1A]">Manage Subscription</p>
                  <p className="text-xs text-[#6B6B6B] font-light">
                    {subscriptionTier !== 'free' && subscriptionStatus === 'active' 
                      ? `${subscriptionTier === 'pro' ? 'Pro' : 'Business'} Plan` 
                      : 'Basic Plan'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#8B7355] transition-colors" strokeWidth={1} />
            </button>
          </div>

          {/* Payout Wallet */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 font-light">Payouts</p>
            <StripeConnectWallet />
          </div>

          {/* Credits */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 font-light">Credits</p>
            <button
              onClick={() => router.push('/settings/credits')}
              className="w-full border border-[#E8E8E8] p-4 bg-white hover:border-[#8B7355] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <Coins className="w-5 h-5 text-[#6B6B6B]" strokeWidth={1} />
                <div className="text-left">
                  <p className="font-serif text-base font-light text-[#1A1A1A]">Credits & Referrals</p>
                  <p className="text-xs text-[#6B6B6B] font-light">
                    {credits !== null ? `${credits} credits available` : 'Loading...'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#8B7355] transition-colors" strokeWidth={1} />
            </button>
          </div>

          {/* Preferences */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 font-light">Preferences</p>
            <button
              onClick={() => router.push('/settings/notifications')}
              className="w-full border border-[#E8E8E8] p-4 bg-white hover:border-[#8B7355] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <Bell className="w-5 h-5 text-[#6B6B6B]" strokeWidth={1} />
                <div className="text-left">
                  <p className="font-serif text-base font-light text-[#1A1A1A]">Notifications</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#8B7355] transition-colors" strokeWidth={1} />
            </button>
          </div>

          {/* Support */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 font-light">Support</p>
            <button
              onClick={() => router.push('/settings/help')}
              className="w-full border border-[#E8E8E8] p-4 bg-white hover:border-[#8B7355] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <HelpCircle className="w-5 h-5 text-[#6B6B6B]" strokeWidth={1} />
                <div className="text-left">
                  <p className="font-serif text-base font-light text-[#1A1A1A]">Get Help</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#8B7355] transition-colors" strokeWidth={1} />
            </button>
          </div>

          {/* Danger Zone */}
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-red-600 mb-4 font-light">Danger Zone</p>
            <button
              onClick={() => router.push('/settings/delete-account')}
              className="w-full border border-red-200 p-4 bg-red-50 hover:border-red-500 hover:bg-red-100 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <Trash2 className="w-5 h-5 text-red-600" strokeWidth={1} />
                <div className="text-left">
                  <p className="font-serif text-base font-light text-red-600">Delete Account</p>
                  <p className="text-xs text-red-500 font-light">Permanently delete your account and all data</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-red-600 group-hover:text-red-700 transition-colors" strokeWidth={1} />
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} centerActionLabel="Create" />
    </div>
  );
}
