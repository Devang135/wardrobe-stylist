import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Shield, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { userService } from '@/services/user.service';
import { avatarService } from '@/services/avatar.service';

export default function PrivacySettingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [deleteAvatarOpen, setDeleteAvatarOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const exportMutation = useMutation({
    mutationFn: () => userService.exportUserData(),
    onSuccess: ({ payload }) => {
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wardrobe-ai-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Demo data export downloaded');
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: () => avatarService.deleteAvatar('avatar_and_sources'),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['avatar'] });
      setDeleteAvatarOpen(false);
      toast.success('Avatar and source reference photos deleted');
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => userService.deleteAccount(),
    onSuccess: () => {
      qc.clear();
      setDeleteAccountOpen(false);
      toast.success('Account deleted from demo session');
      navigate('/', { replace: true });
    },
  });

  return (
    <div className="space-y-5">
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-soft text-sage-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-ink">How Your Photos & Data Are Used</h3>
            <p className="text-sm leading-relaxed text-ink-muted">
              Uploaded face and full-body source photos are used solely to construct your personal avatar. Garment images and saved outfit previews remain private to your account. You can delete source reference photos independently from your generated avatar or saved outfits.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-xl bg-surface-muted/60 p-4 text-xs text-ink-muted sm:grid-cols-3">
          <div>
            <p className="font-semibold text-ink">Source Photos</p>
            <p className="mt-0.5">Face & full-body references used to generate your avatar.</p>
          </div>
          <div>
            <p className="font-semibold text-ink">Avatar Images</p>
            <p className="mt-0.5">Synthesized studio avatar used in Outfit Studio.</p>
          </div>
          <div>
            <p className="font-semibold text-ink">Saved Outfit Previews</p>
            <p className="mt-0.5">Rendered lookbook previews stored under Saved Outfits.</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="text-base font-semibold text-ink">Data Controls</h3>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="text-sm font-medium text-ink">Download my data (Demo JSON)</p>
            <p className="text-xs text-ink-muted">
              Export your profile summary and item counts as a JSON snapshot.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
          >
            <Download className="h-4 w-4" />
            {exportMutation.isPending ? 'Preparing...' : 'Download my data'}
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="text-sm font-medium text-ink">Delete avatar & source photos</p>
            <p className="text-xs text-ink-muted">
              Removes your face/body reference photos and generated avatar while keeping your garments and saved outfits.
            </p>
          </div>
          <Button
            variant="outline"
            className="text-danger hover:text-danger"
            onClick={() => setDeleteAvatarOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete avatar data
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-danger">Delete account</p>
            <p className="text-xs text-ink-muted">
              Permanently deletes your profile, wardrobe, avatar, and saved outfit previews.
            </p>
          </div>
          <Button variant="destructive" onClick={() => setDeleteAccountOpen(true)}>
            Delete account
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={deleteAvatarOpen}
        onOpenChange={setDeleteAvatarOpen}
        title="Delete avatar and source photos?"
        description="This removes your face photo, full-body reference photo, and generated avatar versions. Your wardrobe garments and saved outfits remain intact."
        confirmLabel="Delete avatar data"
        destructive
        isLoading={deleteAvatarMutation.isPending}
        onConfirm={() => void deleteAvatarMutation.mutateAsync()}
      />

      <ConfirmDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        title="Permanently delete your account?"
        description="All profile details, garments, avatar references, and saved outfits will be removed."
        confirmLabel="Delete my account"
        destructive
        requireTypedText="DELETE"
        isLoading={deleteAccountMutation.isPending}
        onConfirm={() => void deleteAccountMutation.mutateAsync()}
      />
    </div>
  );
}
