import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { useUiStore } from '@/store/ui.store';
import { BRAND_CONFIG } from '@/config/brand.config';
import type { UserProfile } from '@/types';

const ROUTE_TITLES: Array<{ match: string; title: string; breadcrumb: string }> = [
  { match: '/app/dashboard', title: 'Dashboard', breadcrumb: 'Overview' },
  { match: '/app/avatar', title: 'My Avatar', breadcrumb: 'My Style' },
  { match: '/app/wardrobe/upload', title: 'Add Clothes', breadcrumb: 'My Wardrobe' },
  { match: '/app/wardrobe/', title: 'Garment Detail', breadcrumb: 'My Wardrobe' },
  { match: '/app/wardrobe', title: 'My Wardrobe', breadcrumb: 'My Style' },
  { match: '/app/outfit-studio', title: 'Outfit Studio', breadcrumb: 'My Style' },
  { match: '/app/outfits/', title: 'Outfit Detail', breadcrumb: 'Saved Outfits' },
  { match: '/app/outfits', title: 'Saved Outfits', breadcrumb: 'My Style' },
  { match: '/app/stylist', title: 'AI Stylist', breadcrumb: 'My Style' },
  { match: '/app/calendar', title: 'Outfit Calendar', breadcrumb: 'My Style' },
  { match: '/app/analytics', title: 'Wardrobe Analytics', breadcrumb: 'Insights' },
  { match: '/app/subscription', title: 'Subscription & Credits', breadcrumb: 'Account' },
  { match: '/app/settings', title: 'Settings', breadcrumb: 'Account' },
];

export function AppShell({ user }: { user: UserProfile }) {
  const location = useLocation();
  const { mobileDrawerOpen, setMobileDrawerOpen } = useUiStore();

  const meta =
    ROUTE_TITLES.find((r) => location.pathname.startsWith(r.match)) ?? {
      title: BRAND_CONFIG.appName,
      breadcrumb: 'Studio',
    };

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <div className="hidden lg:sticky lg:top-0 lg:block lg:h-screen lg:shrink-0">
        <Sidebar user={user} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={meta.title}
          breadcrumb={meta.breadcrumb}
          user={user}
          onOpenMobileMenu={() => setMobileDrawerOpen(true)}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-10">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <MobileNav
        user={user}
        drawerOpen={mobileDrawerOpen}
        onCloseDrawer={() => setMobileDrawerOpen(false)}
      />
    </div>
  );
}
