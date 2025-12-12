'use client';

import { useState, useEffect, useCallback } from 'react';

export function useCredits() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/credits/balance');
      
      if (!response.ok) {
        throw new Error('Failed to fetch credits');
      }
      
      const data = await response.json();
      setCredits(data.credits);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setCredits(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const hasCredits = (amount: number = 1): boolean => {
    return credits !== null && credits >= amount;
  };

  const refresh = () => {
    fetchCredits();
  };

  return {
    credits,
    loading,
    error,
    hasCredits,
    refresh,
  };
}
