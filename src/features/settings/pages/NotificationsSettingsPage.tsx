import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { userService } from '@/services/user.service';
import type { NotificationPreferences } from '@/types';

export default function NotificationsSettingsPage() {
  const qc = useQueryClient();

  const prefsQuery = useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: () => userService.getNotificationPreferences(),
  });

  const updateMutation = useMutation({
    mutationFn: (patch: Partial<NotificationPreferences>) =>
      userService.updateNotificationPreferences(patch),
    onSuccess: (next) => {
      qc.setQueryData(['settings', 'notifications'], next);
      toast.success('Notification preferences updated');
    },
  });

  if (prefsQuery.isLoading || !prefsQuery.data) {
    return <LoadingSkeleton cards={1} />;
  }

  const prefs = prefsQuery.data;

  const rows: Array<{
    key: keyof NotificationPreferences;
    title: string;
    description: string;
  }> = [
    {
      key: 'generationComplete',
      title: 'Generation completion alerts',
      description: 'Notify me when avatar rendering or Outfit Studio try-on jobs complete.',
    },
    {
      key: 'weeklyInsights',
      title: 'Weekly wardrobe insights',
      description: 'Highlight unworn staples and seasonal styling gaps.',
    },
    {
      key: 'productUpdates',
      title: 'Product updates',
      description: 'Release notes for new styling studio features.',
    },
    {
      key: 'marketingEmails',
      title: 'Seasonal editorial newsletters',
      description: 'Occasional lookbook inspiration and capsule guides.',
    },
  ];

  return (
    <Card className="p-6 space-y-5">
      <div>
        <h3 className="text-base font-semibold text-ink">Notification Preferences</h3>
        <p className="text-xs text-ink-muted">
          Choose which studio notifications and email summaries you want to receive.
        </p>
      </div>

      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-4 py-4">
            <div className="space-y-0.5">
              <Label htmlFor={`notif-${row.key}`} className="text-sm font-medium text-ink">
                {row.title}
              </Label>
              <p className="text-xs text-ink-muted">{row.description}</p>
            </div>
            <Switch
              id={`notif-${row.key}`}
              checked={prefs[row.key]}
              disabled={updateMutation.isPending}
              onCheckedChange={(checked) => updateMutation.mutate({ [row.key]: checked })}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
