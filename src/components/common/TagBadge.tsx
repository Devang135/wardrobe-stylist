import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface TagBadgeProps {
  label: string;
  tone?: 'default' | 'accent' | 'sage';
  onRemove?: () => void;
  className?: string;
}

export function TagBadge({ label, tone = 'default', onRemove, className }: TagBadgeProps) {
  const styles =
    tone === 'accent'
      ? 'bg-accent-soft text-accent border-accent/20'
      : tone === 'sage'
        ? 'bg-sage-soft text-sage-foreground border-sage/20'
        : 'bg-surface-muted text-ink-muted border-border';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        styles,
        className,
      )}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="rounded-full p-0.5 hover:bg-black/10"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
