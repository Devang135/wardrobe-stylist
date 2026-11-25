import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  Info,
  RefreshCw,
  Sparkles,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/common/StatusBadge';
import { UploadDropzone } from '@/components/common/UploadDropzone';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { GenerationStatus, type GenerationStep } from '@/components/feedback/GenerationStatus';
import { BRAND_CONFIG, CREDIT_RULES } from '@/config/brand.config';
import { avatarService } from '@/services/avatar.service';
import { formatShortDate } from '@/lib/format';

export default function AvatarPage() {
  const qc = useQueryClient();
  const [consent, setConsent] = useState(true);
  const [isGeneratingUi, setIsGeneratingUi] = useState(false);
  const [genSteps, setGenSteps] = useState<GenerationStep[]>([]);
  const [genError, setGenError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteScope, setDeleteScope] = useState<'avatar_only' | 'avatar_and_sources'>(
    'avatar_and_sources',
  );
  const [simulateNextError, setSimulateNextError] = useState(false);
  const createdObjectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    const urls = createdObjectUrlsRef.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const avatarQuery = useQuery({
    queryKey: ['avatar'],
    queryFn: () => avatarService.getAvatar(),
  });

  const uploadRefMutation = useMutation({
    mutationFn: (payload: { faceReferenceUrl?: string; bodyReferenceUrl?: string }) =>
      avatarService.uploadReferences(payload),
    onSuccess: (updated) => {
      qc.setQueryData(['avatar'], updated);
    },
  });

  const setActiveMutation = useMutation({
    mutationFn: (versionId: string) => avatarService.setActiveVersion(versionId),
    onSuccess: (updated) => {
      qc.setQueryData(['avatar'], updated);
      toast.success('Active studio avatar updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (scope: 'avatar_only' | 'avatar_and_sources') => avatarService.deleteAvatar(scope),
    onSuccess: (updated) => {
      qc.setQueryData(['avatar'], updated);
      setDeleteDialogOpen(false);
      toast.success(
        deleteScope === 'avatar_and_sources'
          ? 'Avatar and source reference photos deleted'
          : 'Generated avatar removed; reference photos kept',
      );
    },
  });

  const handleSelectReference = (kind: 'face' | 'body', files: File[]) => {
    const file = files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    createdObjectUrlsRef.current.push(objectUrl);

    uploadRefMutation.mutate(
      kind === 'face' ? { faceReferenceUrl: objectUrl } : { bodyReferenceUrl: objectUrl },
      {
        onSuccess: () => {
          toast.success(`${kind === 'face' ? 'Face' : 'Full-body'} reference attached`);
        },
      },
    );
  };

  const handleRemoveReference = (kind: 'face' | 'body') => {
    uploadRefMutation.mutate(
      kind === 'face' ? { faceReferenceUrl: '' } : { bodyReferenceUrl: '' },
      {
        onSuccess: () => {
          toast.success(`${kind === 'face' ? 'Face' : 'Full-body'} reference cleared`);
        },
      },
    );
  };

  const handleGenerateAvatar = async () => {
    const avatar = avatarQuery.data;
    if (!avatar?.faceReferenceUrl || !avatar?.bodyReferenceUrl) {
      toast.error('Please provide both a face photo and a full-body reference photo.');
      return;
    }
    if (!consent) {
      toast.error('Please confirm photo permission and AI processing consent.');
      return;
    }

    setGenError(null);
    setIsGeneratingUi(true);
    setGenSteps([
      { id: '1', label: 'Validating reference photos (Demo)', status: 'active' },
      { id: '2', label: 'Aligning facial & body proportions', status: 'pending' },
      { id: '3', label: 'Rendering studio avatar', status: 'pending' },
    ]);

    const t1 = window.setTimeout(() => {
      setGenSteps([
        { id: '1', label: 'Validating reference photos (Demo)', status: 'done' },
        { id: '2', label: 'Aligning facial & body proportions', status: 'active' },
        { id: '3', label: 'Rendering studio avatar', status: 'pending' },
      ]);
    }, 300);

    const t2 = window.setTimeout(() => {
      setGenSteps([
        { id: '1', label: 'Validating reference photos (Demo)', status: 'done' },
        { id: '2', label: 'Aligning facial & body proportions', status: 'done' },
        { id: '3', label: 'Rendering studio avatar', status: 'active' },
      ]);
    }, 620);

    try {
      const result = await avatarService.generateAvatar({ simulateFailure: simulateNextError });
      setSimulateNextError(false);
      qc.setQueryData(['avatar'], result.avatar);
      void qc.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Studio avatar generated (Simulated demo)');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Avatar generation failed.';
      setGenError(msg);
      toast.error(msg);
    } finally {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      setIsGeneratingUi(false);
    }
  };

  if (avatarQuery.isLoading) {
    return <LoadingSkeleton cards={2} />;
  }

  if (avatarQuery.isError) {
    return (
      <ErrorState
        message="Unable to load your avatar workspace."
        onRetry={() => void avatarQuery.refetch()}
      />
    );
  }

  const avatar = avatarQuery.data;
  const hasFace = Boolean(avatar?.faceReferenceUrl);
  const hasBody = Boolean(avatar?.bodyReferenceUrl);
  const canGenerate = hasFace && hasBody && consent && !isGeneratingUi;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Avatar"
        description="Upload a clear face photo and full-body reference photo so your virtual try-ons reflect your identity and silhouette."
        actions={
          avatar?.avatarImageUrl ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDeleteScope('avatar_and_sources');
                setDeleteDialogOpen(true);
              }}
              className="text-danger hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
              Delete avatar & photos
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Reference Uploads & Consent */}
        <div className="space-y-5 lg:col-span-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Face Reference */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">1. Face Photo</h3>
                <span className="text-xs text-ink-subtle">Front-facing, natural light</span>
              </div>

              {hasFace ? (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-xl border border-border bg-surface-muted/40">
                    <ImageWithFallback
                      src={avatar?.faceReferenceUrl}
                      alt="Face reference photo"
                      className="h-52 w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleRemoveReference('face')}
                    >
                      Replace / Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <UploadDropzone
                  title="Upload face photo"
                  description="JPG, PNG or WebP · Max 10 MB"
                  onFilesAccepted={(files) => handleSelectReference('face', files)}
                  onFilesRejected={(msg) => toast.error(msg)}
                />
              )}
            </Card>

            {/* Full-body Reference */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">2. Full-body Reference</h3>
                <span className="text-xs text-ink-subtle">Head-to-toe, relaxed stance</span>
              </div>

              {hasBody ? (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-xl border border-border bg-surface-muted/40">
                    <ImageWithFallback
                      src={avatar?.bodyReferenceUrl}
                      alt="Full-body reference photo"
                      className="h-52 w-full object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleRemoveReference('body')}
                    >
                      Replace / Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <UploadDropzone
                  title="Upload full-body photo"
                  description="JPG, PNG or WebP · Max 10 MB"
                  onFilesAccepted={(files) => handleSelectReference('body', files)}
                  onFilesRejected={(msg) => toast.error(msg)}
                />
              )}
            </Card>
          </div>

          <Card className="p-5 space-y-4">
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="avatar-consent"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="avatar-consent" className="text-sm font-normal leading-relaxed text-ink-muted cursor-pointer">
                I confirm that I own or have permission to use these reference photos and consent to simulated AI avatar generation.
              </Label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-ink">
                  Uses {CREDIT_RULES.avatarGenerationCost} AI credits per generation
                </p>
                <p className="text-xs text-ink-subtle">
                  Simulated demo flow via <code className="text-[11px]">avatarService.generateAvatar()</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSimulateNextError((v) => !v)}
                  className="text-xs"
                >
                  {simulateNextError ? 'Error test: ON' : 'Simulate error'}
                </Button>
                <Button onClick={() => void handleGenerateAvatar()} disabled={!canGenerate}>
                  <Sparkles className="h-4 w-4" />
                  {isGeneratingUi
                    ? 'Generating...'
                    : avatar?.avatarImageUrl
                      ? 'Regenerate avatar'
                      : 'Generate my avatar'}
                </Button>
              </div>
            </div>
          </Card>

          {isGeneratingUi && (
            <GenerationStatus
              title="Building your studio avatar (Demo)"
              subtitle="Named stages shown while the simulated job runs"
              steps={genSteps}
            />
          )}

          {genError && (
            <ErrorState
              title="Avatar generation failed"
              message={genError}
              onRetry={() => void handleGenerateAvatar()}
            />
          )}
        </div>

        {/* Right: Avatar Preview & Version History */}
        <div className="space-y-5 lg:col-span-5">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">Active Avatar Preview</h3>
              <StatusBadge status={avatar?.status ?? 'NOT_STARTED'} />
            </div>

            {avatar?.avatarImageUrl ? (
              <>
                <div className="overflow-hidden rounded-2xl border border-border bg-surface-muted/40 p-4">
                  <ImageWithFallback
                    src={avatar.avatarImageUrl}
                    alt="Generated personal AI avatar"
                    className="mx-auto h-96 w-full object-contain"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleGenerateAvatar()}
                    disabled={!canGenerate}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleRemoveReference('face');
                      handleRemoveReference('body');
                    }}
                  >
                    Replace references
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface-muted/30 p-6 text-center">
                <UserCheck className="mb-3 h-10 w-10 text-ink-subtle" />
                <p className="text-sm font-medium text-ink">No avatar generated yet</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Attach both reference photos on the left and click “Generate my avatar”.
                </p>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-xl bg-surface-muted/70 p-3 text-xs text-ink-muted">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" />
              <p>
                Avatar output is an illustrative visual representation and can vary from the original reference photos. {BRAND_CONFIG.disclaimerText}
              </p>
            </div>
          </Card>

          {avatar && avatar.versions.length > 0 && (
            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-semibold text-ink">Generation History</h3>
              <div className="grid grid-cols-2 gap-3">
                {avatar.versions.map((ver) => {
                  const isActive = avatar.activeVersionId === ver.id;
                  return (
                    <div
                      key={ver.id}
                      className={`rounded-xl border p-2.5 transition-colors ${
                        isActive ? 'border-accent bg-accent-soft/30' : 'border-border bg-surface'
                      }`}
                    >
                      <ImageWithFallback
                        src={ver.imageUrl}
                        alt={ver.label}
                        className="h-28 w-full rounded-lg bg-surface-muted/40 object-contain"
                      />
                      <p className="mt-2 truncate text-xs font-medium text-ink">{ver.label}</p>
                      <p className="text-[11px] text-ink-subtle">{formatShortDate(ver.createdAt)}</p>
                      <Button
                        size="sm"
                        variant={isActive ? 'sage' : 'outline'}
                        className="mt-2 w-full"
                        disabled={isActive || setActiveMutation.isPending}
                        onClick={() => setActiveMutation.mutate(ver.id)}
                      >
                        {isActive ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Active
                          </>
                        ) : (
                          'Set as active'
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete avatar data?"
        description="Choose whether to remove only the generated avatar preview or also delete your uploaded face and full-body reference photos."
        confirmLabel="Delete permanently"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => void deleteMutation.mutateAsync(deleteScope)}
      >
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="delete-scope"
              checked={deleteScope === 'avatar_and_sources'}
              onChange={() => setDeleteScope('avatar_and_sources')}
            />
            <span>Delete generated avatar and both source photos</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="delete-scope"
              checked={deleteScope === 'avatar_only'}
              onChange={() => setDeleteScope('avatar_only')}
            />
            <span>Delete generated avatar only (keep source photos)</span>
          </label>
        </div>
      </ConfirmDialog>
    </div>
  );
}
