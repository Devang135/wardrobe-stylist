import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, ArrowLeft, Heart, Pencil, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TagBadge } from '@/components/common/TagBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { GarmentEditDialog } from '@/features/wardrobe/components/GarmentEditDialog';
import { wardrobeService } from '@/services/wardrobe.service';
import { outfitService } from '@/services/outfit.service';
import { useOutfitStudioStore } from '@/store/outfit-studio.store';
import { CATEGORY_SINGULAR, formatShortDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Garment } from '@/types';

export default function GarmentDetailPage() {
  const { itemId = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const selectGarmentInStudio = useOutfitStudioStore((s) => s.selectGarment);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const itemQuery = useQuery({
    queryKey: ['wardrobe', 'item', itemId],
    queryFn: () => wardrobeService.getItem(itemId),
    enabled: Boolean(itemId),
  });

  const outfitsQuery = useQuery({
    queryKey: ['outfits'],
    queryFn: () => outfitService.listOutfits(),
  });

  const updateMutation = useMutation({
    mutationFn: (patch: Partial<Garment>) => wardrobeService.updateItem(itemId, patch),
    onSuccess: (updated) => {
      qc.setQueryData(['wardrobe', 'item', itemId], updated);
      void qc.invalidateQueries({ queryKey: ['wardrobe'] });
      toast.success('Garment updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => wardrobeService.deleteItem(itemId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['wardrobe'] });
      toast.success('Garment deleted');
      navigate('/app/wardrobe');
    },
  });

  if (itemQuery.isLoading) {
    return <LoadingSkeleton cards={2} />;
  }

  if (itemQuery.isError || !itemQuery.data) {
    return (
      <ErrorState
        title="Garment not found"
        message="This garment may have been deleted or the URL is invalid."
        onRetry={() => navigate('/app/wardrobe')}
      />
    );
  }

  const garment = itemQuery.data;
  const linkedOutfits = (outfitsQuery.data ?? []).filter((o) => o.garmentIds.includes(garment.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title={garment.name}
        description={`${CATEGORY_SINGULAR[garment.category]} · ${garment.subcategory}${garment.brand ? ` · ${garment.brand}` : ''}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/app/wardrobe">
                <ArrowLeft className="h-4 w-4" />
                Wardrobe
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => updateMutation.mutate({ favorite: !garment.favorite })}
            >
              <Heart
                className={cn(
                  'h-4 w-4',
                  garment.favorite ? 'fill-accent text-accent' : 'text-ink-muted',
                )}
              />
              {garment.favorite ? 'Favorited' : 'Favorite'}
            </Button>
            <Button
              onClick={() => {
                selectGarmentInStudio(garment);
                toast.success(`Loaded "${garment.name}" in Outfit Studio`);
                navigate('/app/outfit-studio');
              }}
            >
              <Sparkles className="h-4 w-4" />
              Add to Outfit Studio
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="p-5 lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <StatusBadge status={garment.status} />
            {garment.originalImageUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOriginal((v) => !v)}
              >
                {showOriginal ? 'Show catalogue image' : 'Show original upload'}
              </Button>
            )}
          </div>
          <div className="overflow-hidden rounded-2xl bg-surface-muted/50 p-6">
            <ImageWithFallback
              src={showOriginal && garment.originalImageUrl ? garment.originalImageUrl : garment.imageUrl}
              alt={garment.name}
              className="mx-auto h-80 w-full object-contain"
            />
          </div>
        </Card>

        <Card className="p-6 lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink">Garment Metadata</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              {garment.status !== 'ARCHIVED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateMutation.mutate({ status: 'ARCHIVED' })}
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-danger hover:text-danger"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-ink-subtle">Color</dt>
              <dd className="mt-1 flex items-center gap-2 font-medium text-ink">
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/15"
                  style={{ backgroundColor: garment.colorHex }}
                />
                {garment.color}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-subtle">Brand</dt>
              <dd className="mt-1 font-medium text-ink">{garment.brand ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-subtle">Size</dt>
              <dd className="mt-1 font-medium text-ink">{garment.size ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-subtle">Material</dt>
              <dd className="mt-1 font-medium text-ink">{garment.material ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-subtle">Wear count</dt>
              <dd className="mt-1 font-medium text-ink">{garment.wearCount} wears</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-subtle">Added on</dt>
              <dd className="mt-1 font-medium text-ink">{formatShortDate(garment.createdAt)}</dd>
            </div>
          </dl>

          <div className="space-y-3 border-t border-border pt-4">
            <div>
              <p className="text-xs font-medium text-ink-subtle mb-1.5">Styles</p>
              <div className="flex flex-wrap gap-1.5">
                {garment.styleTags.map((t) => (
                  <TagBadge key={t} label={t} tone="accent" />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-subtle mb-1.5">Occasions</p>
              <div className="flex flex-wrap gap-1.5">
                {garment.occasionTags.map((t) => (
                  <TagBadge key={t} label={t} tone="sage" />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-subtle mb-1.5">Seasons</p>
              <div className="flex flex-wrap gap-1.5">
                {garment.seasonTags.map((t) => (
                  <TagBadge key={t} label={t} />
                ))}
              </div>
            </div>
          </div>

          {garment.notes && (
            <div className="rounded-xl bg-surface-muted/60 p-3.5 text-sm text-ink-muted">
              <span className="font-medium text-ink">Notes: </span>
              {garment.notes}
            </div>
          )}

          <div className="border-t border-border pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-ink">
              Outfits featuring this garment ({linkedOutfits.length})
            </h4>
            {linkedOutfits.length === 0 ? (
              <p className="text-xs text-ink-muted">
                Not styled in any saved outfit yet. Try adding it to Outfit Studio.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {linkedOutfits.map((outfit) => (
                  <Link
                    key={outfit.id}
                    to={`/app/outfits/${outfit.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border p-2.5 hover:bg-surface-muted/50"
                  >
                    <ImageWithFallback
                      src={outfit.generatedImageUrl}
                      alt={outfit.name}
                      className="h-14 w-12 rounded-lg bg-surface-muted object-contain"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{outfit.name}</p>
                      <p className="text-xs text-ink-subtle">{outfit.occasion ?? 'Outfit'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <GarmentEditDialog
        garment={garment}
        open={editOpen}
        onOpenChange={setEditOpen}
        isSaving={updateMutation.isPending}
        onSave={async (_id, patch) => {
          await updateMutation.mutateAsync(patch);
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete garment?"
        description={`Are you sure you want to delete "${garment.name}"?`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => void deleteMutation.mutateAsync()}
      />
    </div>
  );
}
