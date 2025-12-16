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
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush pb-20 md:pb-8">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-sand/20 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="hover:bg-sand/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-serif text-lg sm:text-2xl font-bold text-charcoal">
              Billing & Credits
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Manage your subscription and credits
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Current Balance - Elegant Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-sand/10 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl -z-0" />
          <CardHeader className="relative pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <span>Your Balance</span>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {isPaidPlan ? (
                    <span className="flex items-center gap-2 text-primary font-medium">
                      <Crown className="h-4 w-4" />
                      {subscriptionTier === 'pro' ? 'Pro' : 'Business'} Plan
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Basic Plan</span>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <CreditsDisplay showLabel={false} className="text-4xl sm:text-5xl font-bold" />
                <span className="text-sm sm:text-base text-muted-foreground">credits</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs for Subscriptions and Credits */}
        <Tabs defaultValue="subscriptions" className="w-full">
          <TabsList className={`grid w-full ${isPaidPlan ? 'grid-cols-2' : 'grid-cols-1'} h-auto p-1 bg-white/60 backdrop-blur-sm border border-sand/20`}>
            <TabsTrigger 
              value="subscriptions" 
              className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm py-3"
            >
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Subscriptions</span>
              <span className="sm:hidden">Plans</span>
            </TabsTrigger>
            {isPaidPlan && (
              <TabsTrigger 
                value="credits" 
                className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm py-3"
              >
                <Coins className="h-4 w-4" />
                <span className="hidden sm:inline">Buy Credits</span>
                <span className="sm:hidden">Credits</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="subscriptions" className="space-y-6 mt-6">
            <SubscriptionPlans 
              currentTier={subscriptionTier}
              currentStatus={subscriptionStatus}
            />
            
            {/* Message for Basic users */}
            {isBasicPlan && (
              <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 via-white to-primary/10 overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                <CardContent className="p-6 sm:p-8 relative">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    Unlock Premium Features
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6">
                    Upgrade to Pro or Business to get monthly credits and the ability to purchase additional credits anytime.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Coins className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Monthly Credits</p>
                        <p className="text-xs text-muted-foreground">Automatic renewal</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Buy More Anytime</p>
                        <p className="text-xs text-muted-foreground">Starting at 5 credits</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Credits Roll Over</p>
                        <p className="text-xs text-muted-foreground">Never lose credits</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {isPaidPlan && (
            <TabsContent value="credits" className="space-y-6 mt-6">
              <Card className="border-0 shadow-md bg-white">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl font-serif">Buy Additional Credits</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Purchase extra credits on top of your subscription - starting from just 5 credits
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Quick Buy Options */}
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Credit Packages
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {CREDIT_PACKAGES.map((pkg) => (
                    <BuyCreditsDialog key={pkg.id}>
                      <Card className="cursor-pointer hover:border-primary transition-all hover:shadow-lg hover:scale-105 border-0 shadow-md bg-white group">
                        <CardContent className="p-4 sm:p-6 text-center">
                          <div className="text-3xl sm:text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform">
                            {pkg.credits}
                          </div>
                          <div className="text-xs text-muted-foreground mb-3">credits</div>
                          <div className="text-lg sm:text-xl font-bold mb-2">
                            ${(pkg.price / 100).toFixed(2)}
                          </div>
                          {pkg.savings && (
                            <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
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
          )}
        </Tabs>

        {/* Transaction History */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl font-serif">
              <div className="p-2 bg-primary/10 rounded-lg">
                <History className="h-5 w-5 text-primary" />
              </div>
              Transaction History
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              View all your credit transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-sand/20 rounded-full w-fit mx-auto mb-4">
                  <Coins className="h-12 w-12 text-muted-foreground opacity-50" />
                </div>
                <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                  No transactions yet
                </p>
                {isPaidPlan && (
                  <BuyCreditsDialog>
                    <Button variant="outline" className="gap-2">
                      <CreditCard className="h-4 w-4" />
                      Purchase Credits
                    </Button>
                  </BuyCreditsDialog>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-sand/5 hover:bg-sand/10 transition-colors border border-transparent hover:border-sand/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p
                        className={`font-bold text-base sm:text-lg ${
                          transaction.amount > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.amount > 0 ? '+' : ''}
                        {transaction.amount}
                      </p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
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
        <Card className="border-0 shadow-md bg-gradient-to-br from-sand/10 via-white to-ivory/20">
          <CardContent className="p-6 sm:p-8">
            <h3 className="font-serif text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              About Credits
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                  <Coins className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">1 Credit per Design</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Each AI generation costs 1 credit</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                  <History className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">Never Expire</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Your credits last forever</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">Earn Free Credits</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Refer friends to earn more</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base">Secure Payments</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Powered by Stripe</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
