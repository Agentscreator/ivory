"use client"

import { useEffect } from 'react';
import { initializeWatchBridge } from '@/lib/watch-bridge';

/**
 * Component to initialize Apple Watch bridge
 * Should be included in the root layout
 */
export function WatchBridgeInitializer() {
  useEffect(() => {
    // Initialize Watch bridge on mount
    initializeWatchBridge();
  }, []);

  return null; // This component doesn't render anything
}
