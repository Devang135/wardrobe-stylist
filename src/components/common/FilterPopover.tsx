import type { ReactNode } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface FilterPopoverProps {
  label?: string;
  activeCount?: number;
  children: ReactNode;
}

export function FilterPopover({ label = 'Filters', activeCount = 0, children }: FilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="default" className="gap-2">
          <SlidersHorizontal className="h-4 w-4 text-ink-muted" />
          <span>{label}</span>
          {activeCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        {children}
      </PopoverContent>
    </Popover>
  );
}
