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

  return (
    <div className="space-y-6">
      {/* Free Tier */}
      <Card className={`${currentTier === 'free' ? 'border-2 border-primary' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Free
                {currentTier === 'free' && (
                  <Badge variant="secondary">Current Plan</Badge>
                )}
              </CardTitle>
              <CardDescription>Perfect for trying out the platform</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">$0</div>
              <div className="text-sm text-muted-foreground">forever</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mb-4">
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span>5 credits on signup</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span>Buy credits as needed</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span>Basic design tools</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span>Community support</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div className="grid md:grid-cols-2 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.popular ? 'border-2 border-primary shadow-lg' : ''
            } ${isCurrentPlan(plan.id) ? 'border-2 border-green-500' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            {isCurrentPlan(plan.id) && (
              <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Active
              </div>
            )}

            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    {plan.id === 'pro' ? (
                      <Zap className="h-6 w-6 text-primary" />
                    ) : (
                      <Sparkles className="h-6 w-6 text-primary" />
                    )}
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {plan.credits} credits per month
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">${plan.price / 100}</div>
                  <div className="text-sm text-muted-foreground">/month</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
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
                  'Current Plan'
                ) : (
                  `Subscribe to ${plan.name}`
                )}
              </Button>

              {!isCurrentPlan(plan.id) && (
                <p className="text-xs text-center text-muted-foreground">
                  You can still buy additional credits anytime
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">About Subscriptions</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Credits refresh monthly on your billing date</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Unused credits roll over to next month</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Subscribers can buy additional credits anytime (starting from 5 credits)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Cancel anytime - no long-term commitment</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
