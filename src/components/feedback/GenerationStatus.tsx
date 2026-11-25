import { CheckCircle2, Loader2, Circle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}

interface GenerationStatusProps {
  title: string;
  subtitle?: string;
  steps: GenerationStep[];
  className?: string;
}

export function GenerationStatus({ title, subtitle, steps, className }: GenerationStatusProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('rounded-2xl border border-border bg-surface p-5 shadow-card', className)}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink">{title}</h4>
          {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
        </div>
      </div>

      <ol className="mt-4 space-y-2.5">
        {steps.map((step) => (
          <li key={step.id} className="flex items-center gap-2.5 text-sm">
            {step.status === 'done' && (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-sage" aria-hidden="true" />
            )}
            {step.status === 'active' && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" aria-hidden="true" />
            )}
            {step.status === 'pending' && (
              <Circle className="h-4 w-4 shrink-0 text-border-strong" aria-hidden="true" />
            )}
            {step.status === 'error' && (
              <AlertTriangle className="h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
            )}
            <span
              className={cn(
                step.status === 'active' && 'font-medium text-ink',
                step.status === 'done' && 'text-ink-muted',
                step.status === 'pending' && 'text-ink-subtle',
                step.status === 'error' && 'text-danger',
              )}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
