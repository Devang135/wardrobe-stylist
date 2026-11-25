import { Menu } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { NotificationMenu } from '@/components/layout/NotificationMenu';
import { UserMenu } from '@/components/layout/UserMenu';
import { CreditBalance } from '@/components/common/CreditBalance';
import { subscriptionService } from '@/services/subscription.service';
import type { UserProfile } from '@/types';

interface TopbarProps {
  title: string;
  breadcrumb?: string;
  user: UserProfile;
  onOpenMobileMenu: () => void;
}

export function Topbar({ title, breadcrumb, user, onOpenMobileMenu }: TopbarProps) {
  const { data: subData } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionService.getSummary(),
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          {breadcrumb && (
            <p className="text-[11px] font-medium uppercase tracking-wider text-ink-subtle truncate">
              {breadcrumb}
            </p>
          )}
          <h1 className="truncate text-base font-semibold text-ink sm:text-lg">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <GlobalSearch />
        {subData && (
          <CreditBalance
            creditsRemaining={subData.summary.creditsRemaining}
            creditsIncluded={subData.summary.creditsIncluded}
            compact
            className="hidden sm:inline-flex"
          />
        )}
        <NotificationMenu />
        <div className="lg:hidden">
          <UserMenu user={user} compact />
        </div>
      </div>
    </header>
  );
}
