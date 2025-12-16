'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Coins, Check, Loader2, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { CREDIT_PACKAGES } from '@/lib/stripe';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface BuyCreditsDialogProps {
  children?: React.ReactNode;
}

export function BuyCreditsDialog({ children }: BuyCreditsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    try {
      setLoading(packageId);

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }


    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Coins className="h-4 w-4" />
            Buy Credits
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Buy Credits</DialogTitle>
          <DialogDescription>
            Choose a credit package to continue generating AI nail designs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Payment Methods Info */}
          <div className="flex items-center justify-center gap-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>Credit Card</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Smartphone className="h-4 w-4" />
              <span>Apple Pay</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.59 3.475A5.1 5.1 0 0 0 20.15.03a5.1 5.1 0 0 0-3.44 3.444 5.1 5.1 0 0 0 3.44 3.445 5.1 5.1 0 0 0 3.44-3.445zm-3.44 17.05a5.1 5.1 0 0 0-3.44 3.444 5.1 5.1 0 0 0 3.44 3.445 5.1 5.1 0 0 0 3.44-3.445 5.1 5.1 0 0 0-3.44-3.445zM.41 3.475A5.1 5.1 0 0 1 3.85.03a5.1 5.1 0 0 1 3.44 3.444A5.1 5.1 0 0 1 3.85 6.92a5.1 5.1 0 0 1-3.44-3.445zm3.44 17.05a5.1 5.1 0 0 1 3.44 3.444A5.1 5.1 0 0 1 3.85 27.414a5.1 5.1 0 0 1-3.44-3.445 5.1 5.1 0 0 1 3.44-3.445z"/>
              </svg>
              <span>Cash App</span>
            </div>
          </div>

          {/* Credit Packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CREDIT_PACKAGES.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative p-6 cursor-pointer transition-all hover:shadow-lg ${
                  pkg.popular
                    ? 'border-2 border-primary shadow-md'
                    : 'border hover:border-primary/50'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{pkg.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {pkg.credits} AI generations
                      </p>
                    </div>
                    <Coins className="h-8 w-8 text-primary" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        ${(pkg.price / 100).toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">USD</span>
                    </div>
                    {pkg.savings && (
                      <div className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium px-2 py-1 rounded">
                        <Check className="h-3 w-3" />
                        Save {pkg.savings}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Instant delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Never expires</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Secure payment</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={loading !== null}
                  >
                    {loading === pkg.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Purchase'
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Stripe. Your payment information is encrypted and secure.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
