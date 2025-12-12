'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check, Gift } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  creditsEarned: number;
  pendingReferrals: number;
  referralsUntilNextCredit: number;
}

export function ReferralCard() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    try {
      const response = await fetch('/api/referrals/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralLink = () => {
    if (!stats) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/?ref=${stats.referralCode}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getReferralLink());
      setCopied(true);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareReferralLink = async () => {
    const link = getReferralLink();
    const text = `Join me on Ivory and get 5 free credits to create amazing nail designs! Use my referral link: ${link}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Ivory',
          text,
          url: link,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to copy
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Earn Free Credits
        </CardTitle>
        <CardDescription>
          Share with 3 friends and get 1 free credit!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold">{stats.totalReferrals}</p>
            <p className="text-xs text-muted-foreground">Total Referrals</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{stats.creditsEarned}</p>
            <p className="text-xs text-muted-foreground">Credits Earned</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{stats.referralsUntilNextCredit}</p>
            <p className="text-xs text-muted-foreground">Until Next Credit</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Your Referral Link</label>
          <div className="flex gap-2">
            <Input
              value={getReferralLink()}
              readOnly
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Button
          onClick={shareReferralLink}
          className="w-full"
          variant="default"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Referral Link
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• New users get 5 free credits when they sign up</p>
          <p>• You get 1 credit for every 3 people who sign up with your link</p>
          <p>• Credits can be used to generate AI nail designs</p>
        </div>
      </CardContent>
    </Card>
  );
}
