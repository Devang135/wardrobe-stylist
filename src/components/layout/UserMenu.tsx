import { LogOut, Settings, Sparkles, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthActions } from '@/hooks/useAuth';
import type { UserProfile } from '@/types';

interface UserMenuProps {
  user: UserProfile;
  compact?: boolean;
}

export function UserMenu({ user, compact = false }: UserMenuProps) {
  const navigate = useNavigate();
  const { logoutMutation } = useAuthActions();

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-surface-muted"
          aria-label="Open account menu"
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-9 w-9 shrink-0 rounded-full border border-border object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
              {initials}
            </span>
          )}
          {!compact && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-xs text-ink-subtle">{user.plan} plan</p>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="font-medium text-ink truncate">{user.name}</p>
          <p className="text-xs font-normal text-ink-muted truncate">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/app/settings/profile')}>
          <User className="h-4 w-4 text-ink-muted" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/app/subscription')}>
          <Sparkles className="h-4 w-4 text-accent" />
          <span>Subscription & Credits</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/app/settings/preferences')}>
          <Settings className="h-4 w-4 text-ink-muted" />
          <span>Preferences</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void handleLogout()}
          className="text-danger focus:text-danger"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
