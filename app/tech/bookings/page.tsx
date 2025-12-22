'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TechBookingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to tech dashboard with bookings tab
    router.replace('/tech/dashboard?tab=bookings');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1A1A] mx-auto mb-4"></div>
        <p className="text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">Redirecting...</p>
      </div>
    </div>
  );
}
