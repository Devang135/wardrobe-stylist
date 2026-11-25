import { Bell, Check } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { userService } from '@/services/user.service';
import { formatRelativeDate } from '@/lib/format';

export function NotificationMenu() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => userService.getNotifications(),
  });

  const markAllRead = useMutation({
    mutationFn: () => userService.markAllNotificationsRead(),
    onSuccess: (next) => {
      qc.setQueryData(['notifications'], next);
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Notifications"
          className="relative rounded-xl"
        >
          <Bell className="h-4 w-4 text-ink-muted" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-ink">Notifications</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto divide-y divide-border">
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-xs text-ink-muted">No notifications right now.</p>
          ) : (
            notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.href) navigate(item.href);
                }}
                className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition-colors hover:bg-surface-muted"
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-ink">{item.title}</span>
                  {!item.read && <span className="h-2 w-2 rounded-full bg-accent" />}
                </div>
                <p className="text-xs text-ink-muted">{item.description}</p>
                <span className="text-[11px] text-ink-subtle">
                  {formatRelativeDate(item.createdAt)}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
