import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BRAND_CONFIG } from '@/config/brand.config';
import { createAvatarIllustration } from '@/assets/fashion-illustrations';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const preview = createAvatarIllustration({
    topColor: '#8FB0C9',
    outerwearColor: '#4B3A32',
    bottomColor: '#343230',
    footwearColor: '#8C4E32',
    label: 'Editorial Studio',
  });

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent font-display text-lg font-semibold text-white">
                {BRAND_CONFIG.shortMark}
              </span>
              <span className="text-base font-semibold text-ink">{BRAND_CONFIG.appName}</span>
            </Link>
          </div>

          <div className="mx-auto my-8 w-full max-w-md space-y-6">
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h1>
              <p className="text-sm text-ink-muted">{subtitle}</p>
            </div>
            {children}
          </div>

          <p className="text-xs text-ink-subtle">{BRAND_CONFIG.demoBannerText}</p>
        </div>

        <div className="hidden items-center justify-center bg-surface-muted/60 p-10 lg:flex">
          <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-card">
            <img
              src={preview}
              alt="Personal AI avatar wearing tailored studio pieces"
              className="mx-auto h-96 w-full rounded-xl object-contain bg-surface-muted/40"
            />
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                Personal Styling Studio
              </p>
              <p className="font-display text-2xl font-medium text-ink">
                “See every combination on your own avatar before you step out.”
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
