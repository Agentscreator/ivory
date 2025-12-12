'use client';

import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCredits } from '@/hooks/use-credits';

interface CreditsDisplayProps {
  className?: string;
  showLabel?: boolean;
}

export function CreditsDisplay({ className, showLabel = true }: CreditsDisplayProps) {
  const { credits, loading } = useCredits();

  if (loading || credits === null) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Coins className="h-5 w-5 text-yellow-500" />
      <span className="font-semibold">{credits}</span>
      {showLabel && <span className="text-sm text-muted-foreground">credits</span>}
    </div>
  );
}
