import { NavLink, Outlet } from 'react-router-dom';
import { Bell, Lock, Sliders, User } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/cn';

const SETTINGS_TABS = [
  { label: 'Profile', to: '/app/settings/profile', icon: User },
  { label: 'Preferences', to: '/app/settings/preferences', icon: Sliders },
  { label: 'Notifications', to: '/app/settings/notifications', icon: Bell },
  { label: 'Privacy & Data', to: '/app/settings/privacy', icon: Lock },
];

export function SettingsLayout() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your studio profile, styling preferences, notifications, and privacy controls."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <nav
          aria-label="Settings sections"
          className="flex gap-1.5 overflow-x-auto pb-1 lg:col-span-3 lg:flex-col lg:pb-0"
        >
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent-soft text-accent'
                      : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="lg:col-span-9">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
