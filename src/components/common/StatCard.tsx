import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon: LucideIcon;
  tone?: 'default' | 'accent' | 'sage';
  className?: string;
}

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'default',
  className,
}: StatCardProps) {
  const iconStyle =
    tone === 'accent'
      ? 'bg-accent-soft text-accent'
      : tone === 'sage'
        ? 'bg-sage-soft text-sage-foreground'
        : 'bg-surface-muted text-ink-muted';

  return (
    <Card className={cn('p-5 transition-shadow hover:shadow-elevated', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{value}</p>
          {helper && <p className="text-xs text-ink-muted truncate">{helper}</p>}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', iconStyle)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}
