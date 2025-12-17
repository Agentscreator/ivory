'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/bottom-nav';
import { ReferralCard } from '@/components/referral-card';
import { CreditsDisplay } from '@/components/credits-display';
import { ArrowLeft, Coins, History } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CreditTransaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

function CreditsContent() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle payment success/cancel
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      toast.success('Payment successful! Your credits have been added.');
      window.history.replaceState({}, '', '/settings/credits');
    } else if (canceled === 'true') {
      toast.error('Payment was canceled.');
      window.history.replaceState({}, '', '/settings/credits');
    }

    fetchTransactions();
  }, [searchParams]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/credits/history');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-6 py-4 sm:py-5 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="hover:bg-[#F8F7F5] active:scale-95 transition-all rounded-none"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1} />
          </Button>
          <h1 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">
            Credits & Referrals
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe space-y-6">
        {/* Balance Card */}
        <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-[#F8F7F5]">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Your Balance</p>
          <div className="flex items-baseline gap-3 mb-4">
            <CreditsDisplay showLabel={false} className="font-serif text-4xl sm:text-5xl font-light text-[#1A1A1A]" />
            <span className="font-serif text-xl text-[#6B6B6B] font-light">Credits</span>
          </div>
          <p className="text-sm text-[#6B6B6B] font-light mb-6">
            Use credits to generate AI nail designs
          </p>
          <button
            onClick={() => router.push('/settings?tab=billing')}
            className="w-full h-12 bg-[#1A1A1A] text-white font-light text-sm tracking-wider uppercase hover:bg-[#1A1A1A]/90 active:scale-95 transition-all duration-300"
          >
            View Subscription Plans
          </button>
        </div>

        {/* Referral Card */}
        <ReferralCard />

        {/* Transaction History */}
        <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <History className="w-5 h-5 text-[#8B7355]" strokeWidth={1} />
            <h2 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">
              Transaction History
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-2 border-[#E8E8E8] border-t-[#8B7355] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-[#6B6B6B] font-light">Loading...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-[#6B6B6B] mx-auto mb-4" strokeWidth={1} />
              <p className="text-sm text-[#6B6B6B] font-light">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="border border-[#E8E8E8] p-4 hover:border-[#8B7355] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-base font-light text-[#1A1A1A] mb-1">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-[#6B6B6B] font-light tracking-wider uppercase">
                        {format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="text-right">
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
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} />
    </div>
  );
}

export default function CreditsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-12">
            <div className="w-12 h-12 border-2 border-[#E8E8E8] border-t-[#8B7355] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-[#6B6B6B] font-light">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <CreditsContent />
    </Suspense>
  );
}
