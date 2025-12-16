'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditsDisplay } from '@/components/credits-display';
import { BuyCreditsDialog } from '@/components/buy-credits-dialog';
import { SubscriptionPlans } from '@/components/subscription-plans';
import { ArrowLeft, Coins, CreditCard, History, Sparkles, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { CREDIT_PACKAGES } from '@/lib/stripe-config';

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

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-serif text-xl font-bold text-charcoal">Billing & Credits</h1>
            <p className="text-xs text-muted-foreground">Manage your credits and purchases</p>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Current Balance */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Coins className="h-6 w-6 text-primary" />
                Your Balance
              </span>
              <CreditsDisplay showLabel={false} className="text-3xl" />
            </CardTitle>
            <CardDescription>
              {subscriptionTier !== 'free' && subscriptionStatus === 'active' ? (
                <span className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  {subscriptionTier === 'pro' ? 'Pro' : 'Business'} Plan Active
                </span>
              ) : (
                'Use credits to generate AI nail designs'
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Tabs for Subscriptions and Credits */}
        <Tabs defaultValue="subscriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="subscriptions" className="gap-2">
              <Crown className="h-4 w-4" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="credits" className="gap-2">
              <Coins className="h-4 w-4" />
              Buy Credits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions" className="space-y-6 mt-6">
            <SubscriptionPlans 
              currentTier={subscriptionTier}
              currentStatus={subscriptionStatus}
            />
          </TabsContent>

          <TabsContent value="credits" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Buy Additional Credits</CardTitle>
                <CardDescription>
                  Purchase extra credits on top of your subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BuyCreditsDialog>
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    <CreditCard className="h-5 w-5" />
                    Buy More Credits
                  </Button>
                </BuyCreditsDialog>
              </CardContent>
            </Card>

            {/* Quick Buy Options */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Quick Purchase
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CREDIT_PACKAGES.map((pkg) => (
                  <BuyCreditsDialog key={pkg.id}>
                    <Card className="cursor-pointer hover:border-primary transition-all hover:shadow-md">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {pkg.credits}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">credits</div>
                        <div className="text-lg font-semibold">
                          ${(pkg.price / 100).toFixed(2)}
                        </div>
                        {pkg.savings && (
                          <div className="text-xs text-green-600 font-medium mt-1">
                            Save {pkg.savings}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </BuyCreditsDialog>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Transaction History */}
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
              <div className="text-center py-12">
                <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground mb-4">
                  No transactions yet
                </p>
                <BuyCreditsDialog>
                  <Button variant="outline">
                    Purchase Your First Credits
                  </Button>
                </BuyCreditsDialog>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold text-lg ${
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

        {/* Info Card */}
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">About Credits</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Each AI nail design generation costs 1 credit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Credits never expire</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Earn free credits by referring friends</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Secure payments powered by Stripe</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
