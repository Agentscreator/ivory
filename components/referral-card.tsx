'use client';

import { useState, useEffect } from 'react';
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
        console.log('Share cancelled or failed');
      }
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-white">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="w-5 h-5 text-[#8B7355]" strokeWidth={1} />
          <h2 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">
            Earn Free Credits
          </h2>
        </div>
        <p className="text-sm text-[#6B6B6B] font-light">Loading...</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-white">
      <div className="flex items-center gap-3 mb-2">
        <Gift className="w-5 h-5 text-[#8B7355]" strokeWidth={1} />
        <h2 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">
          Earn Free Credits
        </h2>
      </div>
      <p className="text-sm text-[#6B6B6B] font-light mb-8">
        Share with 3 friends and get 1 free credit!
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center border border-[#E8E8E8] p-4 bg-[#F8F7F5]">
          <p className="font-serif text-3xl font-light text-[#1A1A1A] mb-1">{stats.totalReferrals}</p>
          <p className="text-xs tracking-wider uppercase text-[#6B6B6B] font-light">Total Referrals</p>
        </div>
        <div className="text-center border border-[#E8E8E8] p-4 bg-[#F8F7F5]">
          <p className="font-serif text-3xl font-light text-[#1A1A1A] mb-1">{stats.creditsEarned}</p>
          <p className="text-xs tracking-wider uppercase text-[#6B6B6B] font-light">Credits Earned</p>
        </div>
        <div className="text-center border border-[#E8E8E8] p-4 bg-[#F8F7F5]">
          <p className="font-serif text-3xl font-light text-[#1A1A1A] mb-1">{stats.referralsUntilNextCredit}</p>
          <p className="text-xs tracking-wider uppercase text-[#6B6B6B] font-light">Until Next Credit</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="space-y-3 mb-6">
        <label className="text-xs tracking-wider uppercase text-[#6B6B6B] font-light">Your Referral Link</label>
        <div className="flex gap-2">
          <input
            value={getReferralLink()}
            readOnly
            className="flex-1 px-4 py-3 border border-[#E8E8E8] font-light text-sm focus:outline-none focus:border-[#8B7355] transition-all duration-300"
          />
          <button
            onClick={copyToClipboard}
            className="w-12 h-12 border border-[#E8E8E8] hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300 flex items-center justify-center"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-600" strokeWidth={1} />
            ) : (
              <Copy className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1} />
            )}
          </button>
        </div>
      </div>

      {/* Share Button */}
      <button
        onClick={shareReferralLink}
        className="w-full h-12 bg-[#1A1A1A] text-white font-light text-sm tracking-wider uppercase hover:bg-[#1A1A1A]/90 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 mb-6"
      >
        <Share2 className="w-4 h-4" strokeWidth={1} />
        Share Referral Link
      </button>

      {/* Info */}
      <div className="border-t border-[#E8E8E8] pt-6 space-y-2">
        <p className="text-xs text-[#6B6B6B] font-light flex items-start gap-2">
          <span className="text-[#8B7355]">•</span>
          <span>New users get 5 free credits when they sign up</span>
        </p>
        <p className="text-xs text-[#6B6B6B] font-light flex items-start gap-2">
          <span className="text-[#8B7355]">•</span>
          <span>You get 1 credit for every 3 people who sign up with your link</span>
        </p>
        <p className="text-xs text-[#6B6B6B] font-light flex items-start gap-2">
          <span className="text-[#8B7355]">•</span>
          <span>Credits can be used to generate AI nail designs</span>
        </p>
      </div>
    </div>
  );
}
