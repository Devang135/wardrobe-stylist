import { useState, type ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackLabel?: string;
  aspectClassName?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackLabel,
  aspectClassName,
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={alt ?? fallbackLabel ?? 'Image unavailable'}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl bg-surface-muted text-ink-subtle',
          aspectClassName,
          className,
        )}
      >
        <ImageOff className="h-6 w-6 opacity-60" aria-hidden="true" />
        {fallbackLabel && <span className="px-2 text-center text-xs">{fallbackLabel}</span>}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={cn('object-cover', aspectClassName, className)}
      {...props}
    />
  );
}
