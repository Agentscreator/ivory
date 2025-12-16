'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReferralCard } from '@/components/referral-card';
import { CreditsDisplay } from '@/components/credits-display';
import { BuyCreditsDialog } from '@/components/buy-credits-dialog';
import { Coins, History } from 'lucide-react';
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

export default function CreditsPage() {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle payment success/cancel
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      toast.success('Payment successful! Your credits have been added.');
      // Remove query params from URL
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
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Credits & Referrals</h1>
        <p className="text-muted-foreground">
          Manage your credits and earn more by referring friends
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Your Balance
            </span>
            <CreditsDisplay showLabel={false} />
          </CardTitle>
          <CardDescription>
            Use credits to generate AI nail designs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BuyCreditsDialog />
        </CardContent>
      </Card>

      <ReferralCard />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            View all your credit transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.amount > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {transaction.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Balance: {transaction.balanceAfter}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
