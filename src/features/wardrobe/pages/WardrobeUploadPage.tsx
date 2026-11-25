import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UploadDropzone } from '@/components/common/UploadDropzone';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { wardrobeService, type SuggestedGarmentDraft } from '@/services/wardrobe.service';
import { CATEGORY_SINGULAR } from '@/lib/format';
import type { GarmentCategory } from '@/types';

type UploadStage = 'PENDING' | 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';

interface UploadQueueItem {
  tempId: string;
  fileName: string;
  objectUrl: string;
  stage: UploadStage;
  progress: number;
  errorMessage?: string;
  draft?: SuggestedGarmentDraft;
}

const CATEGORIES: GarmentCategory[] = [
  'TOP',
  'BOTTOM',
  'ONE_PIECE',
  'OUTERWEAR',
  'FOOTWEAR',
  'ACCESSORY',
  'TRADITIONAL',
];

export default function WardrobeUploadPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [oneItemPerImage, setOneItemPerImage] = useState(true);
  const [simulatePartialFailure, setSimulatePartialFailure] = useState(false);
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const addReadyMutation = useMutation({
    mutationFn: (drafts: SuggestedGarmentDraft[]) => wardrobeService.createItemsFromDrafts(drafts),
    onSuccess: (created) => {
      void qc.invalidateQueries({ queryKey: ['wardrobe'] });
      toast.success(`Added ${created.length} item${created.length === 1 ? '' : 's'} to your wardrobe`);
      navigate('/app/wardrobe');
    },
  });

  const handleFilesAccepted = (files: File[]) => {
    const newItems: UploadQueueItem[] = files.map((file, i) => {
      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(objectUrl);
      return {
        tempId: `tmp_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        fileName: file.name,
        objectUrl,
        stage: 'PENDING',
        progress: 0,
      };
    });
    setQueue((prev) => [...prev, ...newItems]);
    toast.success(`Queued ${newItems.length} image${newItems.length === 1 ? '' : 's'}`);
  };

  const processSingleItem = async (item: UploadQueueItem, index: number, failThis: boolean) => {
    setQueue((prev) =>
      prev.map((q) =>
        q.tempId === item.tempId ? { ...q, stage: 'UPLOADING', progress: 35, errorMessage: undefined } : q,
      ),
    );

    await new Promise((r) => setTimeout(r, 180));

    setQueue((prev) =>
      prev.map((q) => (q.tempId === item.tempId ? { ...q, stage: 'PROCESSING', progress: 70 } : q)),
    );

    try {
      const draft = await wardrobeService.simulateProcessUploadedFile({
        tempId: item.tempId,
        fileName: item.fileName,
        objectUrl: item.objectUrl,
        index,
        simulateError: failThis,
      });

      setQueue((prev) =>
        prev.map((q) =>
          q.tempId === item.tempId ? { ...q, stage: 'READY', progress: 100, draft } : q,
        ),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Processing failed';
      setQueue((prev) =>
        prev.map((q) =>
          q.tempId === item.tempId
            ? { ...q, stage: 'FAILED', progress: 0, errorMessage: message }
            : q,
        ),
      );
    }
  };

  const handleProcessPending = async () => {
    const targets = queue.filter((q) => q.stage === 'PENDING');
    if (targets.length === 0) return;

    await Promise.all(
      targets.map((item, idx) =>
        processSingleItem(item, idx, simulatePartialFailure && idx === targets.length - 1),
      ),
    );
    setSimulatePartialFailure(false);
  };

  const handleRetryFailed = async () => {
    const failed = queue.filter((q) => q.stage === 'FAILED');
    await Promise.all(failed.map((item, idx) => processSingleItem(item, idx, false)));
  };

  const updateDraftField = <K extends keyof SuggestedGarmentDraft>(
    tempId: string,
    field: K,
    value: SuggestedGarmentDraft[K],
  ) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.tempId === tempId && item.draft
          ? { ...item, draft: { ...item.draft, [field]: value } }
          : item,
      ),
    );
  };

  const removeQueueItem = (tempId: string) => {
    setQueue((prev) => prev.filter((q) => q.tempId !== tempId));
  };

  const pendingCount = queue.filter((q) => q.stage === 'PENDING').length;
  const readyDrafts = queue.filter((q) => q.stage === 'READY' && q.draft).map((q) => q.draft!);
  const failedCount = queue.filter((q) => q.stage === 'FAILED').length;
  const inFlight = queue.some((q) => q.stage === 'UPLOADING' || q.stage === 'PROCESSING');

  const overallProgress =
    queue.length === 0
      ? 0
      : Math.round(queue.reduce((acc, item) => acc + item.progress, 0) / queue.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Clothes"
        description="Upload photos of individual garments. In this demo, image cleanup and AI categorization are simulated locally before saving to your wardrobe."
        actions={
          <Button variant="outline" asChild>
            <Link to="/app/wardrobe">
              <ArrowLeft className="h-4 w-4" />
              Back to wardrobe
            </Link>
          </Button>
        }
      />

      <Card className="p-6 space-y-5">
        <UploadDropzone
          multiple
          title="Drag & drop garment photos, or click to select files"
          description="Supports JPG, PNG, and WebP · Max 10 MB per file · Separate photos improve item recognition"
          onFilesAccepted={handleFilesAccepted}
          onFilesRejected={(msg) => toast.error(msg)}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-4">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="one-item-per-image"
              checked={oneItemPerImage}
              onCheckedChange={(checked) => setOneItemPerImage(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="one-item-per-image" className="text-xs font-normal text-ink-muted cursor-pointer">
              One garment per image (recommended for cleaner categorization and Outfit Studio pairing)
            </Label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSimulatePartialFailure((v) => !v)}
              className="text-xs"
            >
              {simulatePartialFailure ? 'Partial failure test: ON' : 'Test partial failure'}
            </Button>
            {pendingCount > 0 && (
              <Button onClick={() => void handleProcessPending()} disabled={inFlight}>
                {inFlight ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Process {pendingCount} queued file{pendingCount === 1 ? '' : 's'} (Demo)
              </Button>
            )}
          </div>
        </div>
      </Card>

      {queue.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-ink">
                Batch progress: {overallProgress}% · {readyDrafts.length} ready
                {failedCount > 0 ? ` · ${failedCount} failed` : ''}
              </p>
              <div className="h-2 w-56 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {failedCount > 0 && (
                <Button variant="outline" size="sm" onClick={() => void handleRetryFailed()}>
                  <RefreshCw className="h-4 w-4" />
                  Retry failed ({failedCount})
                </Button>
              )}
              <Button
                disabled={readyDrafts.length === 0 || addReadyMutation.isPending}
                onClick={() => addReadyMutation.mutate(readyDrafts)}
              >
                <CheckCircle2 className="h-4 w-4" />
                {addReadyMutation.isPending
                  ? 'Saving...'
                  : `Add all ready items (${readyDrafts.length})`}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {queue.map((item) => (
              <Card key={item.tempId} className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <ImageWithFallback
                      src={item.draft ? item.draft.cleanedPreviewUrl : item.objectUrl}
                      alt={item.fileName}
                      className="h-20 w-20 shrink-0 rounded-xl border border-border bg-surface-muted/40 object-contain p-1"
                    />
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-semibold text-ink">{item.fileName}</p>
                      <StatusBadge status={item.stage} />
                      {item.draft && (
                        <p className="text-[11px] text-ink-subtle">
                          Simulated catalogue image & suggested metadata ready
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${item.fileName}`}
                    onClick={() => removeQueueItem(item.tempId)}
                  >
                    <Trash2 className="h-4 w-4 text-ink-subtle" />
                  </Button>
                </div>

                {item.stage === 'FAILED' && item.errorMessage && (
                  <p className="rounded-xl bg-danger-soft px-3 py-2 text-xs text-danger">
                    {item.errorMessage}
                  </p>
                )}

                {item.draft && (
                  <div className="grid grid-cols-1 gap-3 border-t border-border pt-3 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor={`name-${item.tempId}`}>Suggested Name</Label>
                      <Input
                        id={`name-${item.tempId}`}
                        value={item.draft.name}
                        onChange={(e) => updateDraftField(item.tempId, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`cat-${item.tempId}`}>Category</Label>
                      <Select
                        value={item.draft.category}
                        onValueChange={(val) =>
                          updateDraftField(item.tempId, 'category', val as GarmentCategory)
                        }
                      >
                        <SelectTrigger id={`cat-${item.tempId}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {CATEGORY_SINGULAR[c]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`color-${item.tempId}`}>Suggested Color</Label>
                      <Input
                        id={`color-${item.tempId}`}
                        value={item.draft.color}
                        onChange={(e) => updateDraftField(item.tempId, 'color', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
