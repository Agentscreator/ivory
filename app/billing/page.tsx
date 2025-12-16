'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BuyCreditsDialog } from '@/components/buy-credits-dialog';
import { SubscriptionPlans } from '@/components/subscription-plans';
import { ArrowLeft, Coins, CreditCard, History, Sparkles, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { CREDIT_PACKAGES } from '@/lib/stripe-config';
import { toast } from 'sonner';

interface CreditTransaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export default function BillingPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive');
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    // Check for Stripe redirect parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const canceled = urlParams.get('canceled');
      
      if (success === 'true') {
        toast.success('Payment successful! Your credits will be added shortly.');
        // Clean up URL
        window.history.replaceState({}, '', '/billing');
      } else if (canceled === 'true') {
        toast.error('Payment canceled. You can try again anytime.');
        // Clean up URL
        window.history.replaceState({}, '', '/billing');
      }
    }
    
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user data for subscription info
      const userStr = localStorage.getItem('ivoryUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        setSubscriptionTier(user.subscriptionTier || 'free');
        setSubscriptionStatus(user.subscriptionStatus || 'inactive');
        setCredits(user.credits || 0);
      }

      // Fetch current credits balance
      const balanceResponse = await fetch('/api/credits/balance');
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setCredits(balanceData.credits);
      }

      // Fetch transactions
      const response = await fetch('/api/credits/history');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isBasicPlan = subscriptionTier === 'free';
  const isPaidPlan = subscriptionTier !== 'free' && subscriptionStatus === 'active';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-6 py-4 sm:py-5 flex items-center gap-4">
          <button
            onClick={() => router.push('/home')}
            className="text-[#1A1A1A] hover:text-[#8B7355] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1} />
          </button>
          <div className="flex-1">
            <h1 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">
              BILLING & CREDITS
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-32 space-y-8">
        {/* Current Balance */}
        <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-[#F8F7F5]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Your Balance</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A] tracking-tight mb-2">
                {credits !== null ? credits : '...'} <span className="text-xl text-[#6B6B6B]">Credits</span>
              </h2>
              <p className="text-sm text-[#6B6B6B] font-light">
                {isPaidPlan ? (
                  <span className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-[#8B7355]" strokeWidth={1} />
                    {subscriptionTier === 'pro' ? 'Pro' : 'Business'} Plan Active
                  </span>
                ) : (
                  'Basic Plan'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="border-b border-[#E8E8E8]">
          <div className="flex gap-8">
            <button
              onClick={() => document.getElementById('subscriptions')?.scrollIntoView({ behavior: 'smooth' })}
              className="pb-4 border-b-2 border-[#1A1A1A] text-sm tracking-[0.2em] uppercase font-light text-[#1A1A1A]"
            >
              Subscriptions
            </button>
            {isPaidPlan && (
              <button
                onClick={() => document.getElementById('credits')?.scrollIntoView({ behavior: 'smooth' })}
                className="pb-4 border-b-2 border-transparent hover:border-[#8B7355] text-sm tracking-[0.2em] uppercase font-light text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
              >
                Buy Credits
              </button>
            )}
            <button
              onClick={() => document.getElementById('history')?.scrollIntoView({ behavior: 'smooth' })}
              className="pb-4 border-b-2 border-transparent hover:border-[#8B7355] text-sm tracking-[0.2em] uppercase font-light text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
            >
              History
            </button>
          </div>
        </div>

        {/* Subscriptions Section */}
        <div id="subscriptions">
          <div className="mb-6">
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Plans</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">Subscription Options</h2>
          </div>

          <SubscriptionPlans 
            currentTier={subscriptionTier}
            currentStatus={subscriptionStatus}
          />
          
          {/* Message for Basic users */}
          {isBasicPlan && (
            <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-[#F8F7F5] mt-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 border border-[#E8E8E8] flex items-center justify-center flex-shrink-0 bg-white">
                  <Sparkles className="w-6 h-6 text-[#8B7355]" strokeWidth={1} />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                    Unlock Premium Features
                  </h3>
                  <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed font-light">
                    Upgrade to Pro or Business to get monthly credits and the ability to purchase additional credits anytime.
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="border border-[#E8E8E8] p-4 bg-white">
                  <p className="font-serif text-base font-light text-[#1A1A1A] mb-1">Monthly Credits</p>
                  <p className="text-xs text-[#6B6B6B] font-light">Automatic renewal</p>
                </div>
                <div className="border border-[#E8E8E8] p-4 bg-white">
                  <p className="font-serif text-base font-light text-[#1A1A1A] mb-1">Buy More Anytime</p>
                  <p className="text-xs text-[#6B6B6B] font-light">Starting at 5 credits</p>
                </div>
                <div className="border border-[#E8E8E8] p-4 bg-white">
                  <p className="font-serif text-base font-light text-[#1A1A1A] mb-1">Credits Roll Over</p>
                  <p className="text-xs text-[#6B6B6B] font-light">Never lose credits</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buy Credits Section - Only for paid users */}
        {isPaidPlan && (
          <div id="credits">
            <div className="mb-6">
              <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Additional</p>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight mb-2">Credit Packages</h2>
              <p className="text-sm text-[#6B6B6B] font-light">Purchase extra credits on top of your subscription</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {CREDIT_PACKAGES.map((pkg) => (
                <BuyCreditsDialog key={pkg.id}>
                  <div className="border border-[#E8E8E8] p-6 bg-white cursor-pointer hover:border-[#8B7355] active:scale-[0.98] transition-all duration-300 group">
                    <div className="text-center">
                      <div className="text-4xl font-light text-[#1A1A1A] mb-2 group-hover:text-[#8B7355] transition-colors">
                        {pkg.credits}
                      </div>
                      <div className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-4 font-light">credits</div>
                      <div className="text-2xl font-light text-[#1A1A1A] mb-2">
                        ${(pkg.price / 100).toFixed(2)}
                      </div>
                      {pkg.savings && (
                        <div className="text-xs text-green-600 font-light">
                          Save {pkg.savings}
                        </div>
                      )}
                    </div>
                  </div>
                </BuyCreditsDialog>
              ))}
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div id="history">
          <div className="mb-6">
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Activity</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">Transaction History</h2>
          </div>

          {loading ? (
            <div className="border border-[#E8E8E8] p-12 text-center bg-white">
              <div className="w-12 h-12 border-2 border-[#E8E8E8] border-t-[#8B7355] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-[#6B6B6B] font-light">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="border border-[#E8E8E8] p-12 text-center bg-white">
              <div className="w-16 h-16 mx-auto mb-6 border border-[#E8E8E8] flex items-center justify-center">
                <History className="w-8 h-8 text-[#6B6B6B]" strokeWidth={1} />
              </div>
              <p className="text-sm text-[#6B6B6B] font-light">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="border border-[#E8E8E8] p-4 sm:p-5 bg-white hover:border-[#8B7355] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-base font-light text-[#1A1A1A] mb-1 truncate">{transaction.description}</p>
                      <p className="text-xs text-[#6B6B6B] font-light tracking-wider uppercase">
                        {format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p
                        className={`text-xl font-light ${
                          transaction.amount > 0
                            ? 'text-green-600'
                            : 'text-[#1A1A1A]'
                        }`}
                      >
                        {transaction.amount > 0 ? '+' : ''}
                        {transaction.amount}
                      </p>
                      <p className="text-xs text-[#6B6B6B] font-light whitespace-nowrap">
                        Balance: {transaction.balanceAfter}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-[#F8F7F5]">
          <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-6 tracking-tight">About Credits</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 border border-[#E8E8E8] flex items-center justify-center flex-shrink-0 bg-white">
                <Coins className="w-6 h-6 text-[#8B7355]" strokeWidth={1} />
              </div>
              <div>
                <p className="font-serif text-base font-light text-[#1A1A1A] mb-1">1 Credit per Design</p>
                <p className="text-sm text-[#6B6B6B] font-light">Each AI generation costs 1 credit</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 border border-[#E8E8E8] flex items-center justify-center flex-shrink-0 bg-white">
                <History className="w-6 h-6 text-[#8B7355]" strokeWidth={1} />
              </div>
              <div>
                <p className="font-serif text-base font-light text-[#1A1A1A] mb-1">Never Expire</p>
                <p className="text-sm text-[#6B6B6B] font-light">Your credits last forever</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 border border-[#E8E8E8] flex items-center justify-center flex-shrink-0 bg-white">
                <Sparkles className="w-6 h-6 text-[#8B7355]" strokeWidth={1} />
              </div>
              <div>
                <p className="font-serif text-base font-light text-[#1A1A1A] mb-1">Earn Free Credits</p>
                <p className="text-sm text-[#6B6B6B] font-light">Refer friends to earn more</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 border border-[#E8E8E8] flex items-center justify-center flex-shrink-0 bg-white">
                <CreditCard className="w-6 h-6 text-[#8B7355]" strokeWidth={1} />
              </div>
              <div>
                <p className="font-serif text-base font-light text-[#1A1A1A] mb-1">Secure Payments</p>
                <p className="text-sm text-[#6B6B6B] font-light">Powered by Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
