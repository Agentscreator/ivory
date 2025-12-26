'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

export function StripeConnectWallet() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/stripe/connect/status', {
        headers,
        credentials: 'include', // Include cookies
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        console.error('Failed to fetch wallet status:', response.status);
        // Set default not_setup status if fetch fails
        setStatus({ status: 'not_setup', payoutsEnabled: false });
      }
    } catch (error) {
      console.error('Error fetching wallet status:', error);
      // Set default not_setup status on error
      setStatus({ status: 'not_setup', payoutsEnabled: false });
    } finally {
      setLoading(false);
    }
  };

  const handleSetupWallet = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
        headers,
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        const error = await response.json();
        
        // Show user-friendly message for Connect not enabled
        if (response.status === 503 || error.message?.includes('being configured')) {
          alert('The payout system is being set up. Please try again in a few minutes or contact support.');
        } else {
          alert(error.error || error.message || 'Failed to setup wallet');
        }
      }
    } catch (error) {
      console.error('Error setting up wallet:', error);
      alert('Failed to setup wallet');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/stripe/connect/dashboard', {
        method: 'POST',
        headers,
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        window.open(data.url, '_blank');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to open dashboard');
      }
    } catch (error) {
      console.error('Error opening dashboard:', error);
      alert('Failed to open dashboard');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-[#E8E8E8]">
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#8B7355]" />
        </CardContent>
      </Card>
    );
  }

  const isActive = status?.status === 'active' && status?.payoutsEnabled;
  const isPending = status?.status === 'pending' || (status?.status === 'active' && !status?.payoutsEnabled);
  const isNotSetup = status?.status === 'not_setup';

  return (
    <Card className={`border-2 transition-all duration-500 ${
      isActive 
        ? 'border-green-500/20 bg-gradient-to-br from-green-50/50 to-emerald-50/50' 
        : isPending
        ? 'border-yellow-500/20 bg-gradient-to-br from-yellow-50/50 to-amber-50/50'
        : 'border-[#8B7355]/20 bg-gradient-to-br from-[#8B7355]/5 to-[#8B7355]/10'
    }`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 flex items-center justify-center border ${
              isActive 
                ? 'bg-green-50 border-green-200' 
                : isPending
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-white border-[#E8E8E8]'
            }`}>
              <Wallet className={`w-6 h-6 ${
                isActive 
                  ? 'text-green-600' 
                  : isPending
                  ? 'text-yellow-600'
                  : 'text-[#8B7355]'
              }`} />
            </div>
            <div>
              <CardTitle className="font-serif text-xl font-light text-[#1A1A1A] tracking-tight">
                Payout Wallet
              </CardTitle>
              <CardDescription className="text-sm text-[#6B6B6B] font-light mt-1">
                {isActive && 'Receive payments from bookings'}
                {isPending && 'Complete setup to receive payments'}
                {isNotSetup && 'Setup your wallet to receive payments'}
              </CardDescription>
            </div>
          </div>
          {isActive && (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          )}
          {isPending && (
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-[#E8E8E8]">
            <span className="text-xs tracking-wider uppercase text-[#6B6B6B] font-light">Status</span>
            <span className={`text-sm font-light ${
              isActive 
                ? 'text-green-600' 
                : isPending
                ? 'text-yellow-600'
                : 'text-[#6B6B6B]'
            }`}>
              {isActive && 'Active'}
              {isPending && 'Pending Setup'}
              {isNotSetup && 'Not Setup'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[#E8E8E8]">
            <span className="text-xs tracking-wider uppercase text-[#6B6B6B] font-light">Payouts</span>
            <span className={`text-sm font-light ${
              status?.payoutsEnabled ? 'text-green-600' : 'text-[#6B6B6B]'
            }`}>
              {status?.payoutsEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-white/50 border border-[#E8E8E8]">
          <p className="text-xs text-[#6B6B6B] font-light leading-relaxed">
            {isActive && (
              <>
                Your wallet is active! When clients book appointments, you'll receive the service price directly to your account. 
                The 12.5% platform fee is automatically deducted.
              </>
            )}
            {isPending && (
              <>
                Complete your account setup to start receiving payments. You'll need to provide business information 
                and bank account details.
              </>
            )}
            {isNotSetup && (
              <>
                Setup your payout wallet to receive payments from client bookings. The platform charges a 12.5% service fee, 
                and you receive the remaining amount directly to your bank account.
              </>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {isNotSetup && (
            <Button
              onClick={handleSetupWallet}
              disabled={actionLoading}
              className="flex-1 bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all duration-500 h-11 text-xs tracking-widest uppercase rounded-none font-light"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Setup Wallet
                </>
              )}
            </Button>
          )}
          {isPending && (
            <Button
              onClick={handleSetupWallet}
              disabled={actionLoading}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white transition-all duration-500 h-11 text-xs tracking-widest uppercase rounded-none font-light"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          )}
          {isActive && (
            <Button
              onClick={handleOpenDashboard}
              disabled={actionLoading}
              variant="outline"
              className="flex-1 border-[#E8E8E8] hover:border-[#8B7355] hover:bg-transparent text-[#1A1A1A] h-11 text-xs tracking-widest uppercase rounded-none font-light"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Dashboard
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
