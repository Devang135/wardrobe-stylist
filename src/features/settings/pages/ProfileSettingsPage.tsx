import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AUTH_QUERY_KEY, useCurrentUser } from '@/hooks/useAuth';
import { userService } from '@/services/user.service';

const profileSchema = z.object({
  name: z.string().min(2, 'Enter at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileSettingsPage() {
  const qc = useQueryClient();
  const { data: user } = useCurrentUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name ?? '',
      email: user?.email ?? '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => userService.updateProfile(values),
    onSuccess: (updated) => {
      qc.setQueryData(AUTH_QUERY_KEY, updated);
      reset({ name: updated.name, email: updated.email });
      toast.success('Profile updated');
    },
  });

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-semibold text-ink">Account Profile</h3>
          <p className="text-xs text-ink-muted">Update your display name and contact email.</p>
        </div>
        {user?.emailVerified ? (
          <Badge variant="sage">
            <CheckCircle2 className="h-3 w-3" />
            Email verified (Demo)
          </Badge>
        ) : (
          <Badge variant="warning">
            <Clock className="h-3 w-3" />
            Verification pending (Demo)
          </Badge>
        )}
      </div>

      <form
        onSubmit={handleSubmit((vals) => updateMutation.mutate(vals))}
        className="space-y-4 max-w-lg"
      >
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Full name</Label>
          <Input id="profile-name" {...register('name')} />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-email">Email address</Label>
          <Input id="profile-email" type="email" {...register('email')} />
          {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save profile'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty}
            onClick={() => reset()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
