import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-muted text-ink-muted border border-border',
        accent: 'bg-accent-soft text-accent border border-accent/20',
        sage: 'bg-sage-soft text-sage-foreground border border-sage/20',
        warning: 'bg-warning-soft text-warning border border-warning/20',
        danger: 'bg-danger-soft text-danger border border-danger/20',
        outline: 'border border-border text-ink-muted bg-surface',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
