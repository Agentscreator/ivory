'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe-config';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionPlansProps {
  currentTier?: string;
  currentStatus?: string;
}

export function SubscriptionPlans({ currentTier = 'free', currentStatus = 'inactive' }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(planId);

      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to start subscription. Please try again.');
      setLoading(null);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentTier === planId && currentStatus === 'active';
  };

  const isBasicPlan = currentTier === 'free';

  return (
    <div className="space-y-6">
      {/* Basic Tier */}
      <Card className={`border-0 shadow-md bg-white ${isBasicPlan ? 'ring-2 ring-primary/20' : ''}`}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl font-serif">
                Basic
                {isBasicPlan && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                    Current Plan
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-1">
                Perfect for trying out the platform
              </CardDescription>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-3xl sm:text-4xl font-bold">$0</div>
              <div className="text-sm text-muted-foreground">forever</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 mb-4">
            <li className="flex items-center gap-3 text-sm sm:text-base">
              <div className="p-1 bg-primary/10 rounded">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span>5 credits on signup</span>
            </li>
            <li className="flex items-center gap-3 text-sm sm:text-base">
              <div className="p-1 bg-primary/10 rounded">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span>Basic design tools</span>
            </li>
            <li className="flex items-center gap-3 text-sm sm:text-base">
              <div className="p-1 bg-primary/10 rounded">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span>Community support</span>
            </li>
            <li className="flex items-center gap-3 text-sm sm:text-base text-muted-foreground">
              <div className="p-1 bg-muted rounded">
                <Check className="h-4 w-4 text-muted-foreground" />
              </div>
              <span>Upgrade to buy more credits</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative border-0 shadow-lg bg-white overflow-hidden ${
              plan.popular ? 'ring-2 ring-primary' : ''
            } ${isCurrentPlan(plan.id) ? 'ring-2 ring-green-500' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-md z-10">
                Most Popular
              </div>
            )}
            {isCurrentPlan(plan.id) && (
              <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md z-10">
                Active
              </div>
            )}

            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />

            <CardHeader className="relative">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl font-serif mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {plan.id === 'pro' ? (
                        <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      ) : (
                        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      )}
                    </div>
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {plan.credits} credits per month
                  </CardDescription>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-3xl sm:text-4xl font-bold">${plan.price / 100}</div>
                  <div className="text-sm text-muted-foreground">/month</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 relative">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm sm:text-base">
                    <div className="p-1 bg-primary/10 rounded mt-0.5">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full shadow-md hover:shadow-lg transition-all"
                size="lg"
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading !== null || isCurrentPlan(plan.id)}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : isCurrentPlan(plan.id) ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Current Plan
                  </>
                ) : (
                  `Subscribe to ${plan.name}`
                )}
              </Button>

              {!isCurrentPlan(plan.id) && (
                <p className="text-xs text-center text-muted-foreground">
                  Buy additional credits anytime after subscribing
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-md bg-gradient-to-br from-sand/10 via-white to-ivory/20">
        <CardContent className="p-6 sm:p-8">
          <h3 className="font-serif text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            About Subscriptions
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">Monthly Credits</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Refresh on your billing date</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">Credits Roll Over</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Unused credits never expire</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">Buy More Anytime</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Starting from 5 credits</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">Cancel Anytime</p>
                <p className="text-xs sm:text-sm text-muted-foreground">No long-term commitment</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
