'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SignupRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the ref parameter if it exists
    const ref = searchParams.get('ref');
    
    // Redirect to main page with ref parameter
    if (ref) {
      router.replace(`/?ref=${ref}`);
    } else {
      router.replace('/');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush flex items-center justify-center">
      <div className="text-charcoal">Redirecting...</div>
    </div>
  );
}

export default function SignupRedirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush flex items-center justify-center">
        <div className="text-charcoal">Loading...</div>
      </div>
    }>
      <SignupRedirectContent />
    </Suspense>
  );
}
