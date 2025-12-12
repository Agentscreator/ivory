'use client';

import { Button } from '@/components/ui/button';
import { useCredits } from '@/hooks/use-credits';
import { Loader2, Coins } from 'lucide-react';
import { toast } from 'sonner';

interface GenerateWithCreditsButtonProps {
  onClick: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  creditsRequired?: number;
}

export function GenerateWithCreditsButton({
  onClick,
  loading = false,
  disabled = false,
  children = 'Generate Design',
  className,
  creditsRequired = 1,
}: GenerateWithCreditsButtonProps) {
  const { credits, hasCredits, loading: creditsLoading } = useCredits();

  const handleClick = async () => {
    if (!hasCredits(creditsRequired)) {
      toast.error(`Insufficient credits. You need ${creditsRequired} credit${creditsRequired > 1 ? 's' : ''} to generate a design.`, {
        description: 'Refer friends to earn more credits!',
        action: {
          label: 'View Credits',
          onClick: () => window.location.href = '/settings/credits',
        },
      });
      return;
    }

    await onClick();
  };

  const isDisabled = disabled || loading || creditsLoading || !hasCredits(creditsRequired);

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Coins className="mr-2 h-4 w-4" />
          {children}
          {credits !== null && (
            <span className="ml-2 text-xs opacity-70">
              ({creditsRequired} credit{creditsRequired > 1 ? 's' : ''})
            </span>
          )}
        </>
      )}
    </Button>
  );
}
