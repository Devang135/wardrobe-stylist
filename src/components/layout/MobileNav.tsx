import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { MOBILE_BOTTOM_NAV } from '@/components/layout/navigation.config';
import { Sidebar } from '@/components/layout/Sidebar';
import type { UserProfile } from '@/types';

interface MobileNavProps {
  user: UserProfile;
  drawerOpen: boolean;
  onCloseDrawer: () => void;
}

export function MobileNav({ user, drawerOpen, onCloseDrawer }: MobileNavProps) {
  return (
    <>
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-[1px]"
            onClick={onCloseDrawer}
            aria-hidden="true"
          />
          <div className="relative z-10 flex h-full">
            <Sidebar user={user} onNavigate={onCloseDrawer} />
            <button
              type="button"
              onClick={onCloseDrawer}
              aria-label="Close navigation menu"
              className="ml-2 mt-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink shadow-elevated"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <nav
        aria-label="Mobile quick navigation"
        className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border bg-surface/95 px-2 backdrop-blur-sm lg:hidden"
      >
        {MOBILE_BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex min-w-[56px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors',
                  isActive ? 'text-accent' : 'text-ink-muted hover:text-ink',
                )
              }
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
