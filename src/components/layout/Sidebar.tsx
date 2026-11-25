import { Link, NavLink, useLocation } from 'react-router-dom';
import { BRAND_CONFIG } from '@/config/brand.config';
import { cn } from '@/lib/cn';
import { APP_NAV_GROUPS } from '@/components/layout/navigation.config';
import { UserMenu } from '@/components/layout/UserMenu';
import type { UserProfile } from '@/types';

interface SidebarProps {
  user: UserProfile;
  onNavigate?: () => void;
}

export function Sidebar({ user, onNavigate }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      aria-label="Primary navigation"
      className="flex h-full w-[256px] flex-col border-r border-border bg-surface"
    >
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <Link
          to="/app/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-lg"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent font-display text-lg font-semibold text-white">
            {BRAND_CONFIG.shortMark}
          </span>
          <div className="leading-tight">
            <span className="block text-sm font-semibold text-ink">{BRAND_CONFIG.appName}</span>
            <span className="block text-[11px] text-ink-subtle">{BRAND_CONFIG.tagline}</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {APP_NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isSettingsItem = item.to.startsWith('/app/settings');
                const activeOverride =
                  isSettingsItem && location.pathname.startsWith('/app/settings');

                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onNavigate}
                      className={({ isActive }) => {
                        const active = isActive || activeOverride;
                        return cn(
                          'relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'bg-accent-soft text-accent'
                            : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                        );
                      }}
                    >
                      {({ isActive }) => {
                        const active = isActive || activeOverride;
                        return (
                          <>
                            {active && (
                              <span
                                aria-hidden="true"
                                className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-accent"
                              />
                            )}
                            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span className="truncate">{item.label}</span>
                          </>
                        );
                      }}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <UserMenu user={user} />
      </div>
    </aside>
  );
}
