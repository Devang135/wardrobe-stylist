import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

interface CreditBalanceProps {
  creditsRemaining: number;
  creditsIncluded: number;
  compact?: boolean;
  className?: string;
}

export function CreditBalance({
  creditsRemaining,
  creditsIncluded,
  compact = false,
  className,
}: CreditBalanceProps) {
  const low = creditsRemaining <= 2;

  return (
    <Link
      to="/app/subscription"
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        low
          ? 'border-warning/30 bg-warning-soft text-warning hover:bg-warning-soft/80'
          : 'border-border bg-surface text-ink hover:bg-surface-muted',
        className,
      )}
      title="View subscription and credit balance"
    >
      <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
      <span>
        {creditsRemaining}
        {!compact && ` / ${creditsIncluded}`} credits
      </span>
    </Link>
  );
}
