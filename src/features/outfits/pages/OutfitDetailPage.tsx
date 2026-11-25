import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, ArrowLeft, Copy, Pencil, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { TagBadge } from '@/components/common/TagBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { FormDialog } from '@/components/common/FormDialog';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { outfitService } from '@/services/outfit.service';
import { wardrobeService } from '@/services/wardrobe.service';
import { useOutfitStudioStore } from '@/store/outfit-studio.store';
import { CATEGORY_SINGULAR, formatShortDate } from '@/lib/format';
import type { Garment } from '@/types';

export default function OutfitDetailPage() {
  const { outfitId = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const loadFromGarments = useOutfitStudioStore((s) => s.loadFromGarments);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [notes, setNotes] = useState('');

  const outfitQuery = useQuery({
    queryKey: ['outfits', outfitId],
    queryFn: () => outfitService.getOutfit(outfitId),
    enabled: Boolean(outfitId),
  });

  const garmentsQuery = useQuery({
    queryKey: ['wardrobe', 'items', 'all-including-archived'],
    queryFn: () => wardrobeService.listItems({ includeArchived: true }),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      outfitService.updateOutfit(outfitId, {
        name: name.trim(),
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
        tags: tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    onSuccess: (updated) => {
      qc.setQueryData(['outfits', outfitId], updated);
      void qc.invalidateQueries({ queryKey: ['outfits'] });
      setEditOpen(false);
      toast.success('Outfit details updated');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: () => outfitService.duplicateOutfit(outfitId),
    onSuccess: (copy) => {
      void qc.invalidateQueries({ queryKey: ['outfits'] });
      toast.success(`Duplicated as "${copy.name}"`);
      navigate(`/app/outfits/${copy.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => outfitService.deleteOutfit(outfitId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['outfits'] });
      toast.success('Outfit deleted');
      navigate('/app/outfits');
    },
  });

  if (outfitQuery.isLoading || garmentsQuery.isLoading) {
    return <LoadingSkeleton cards={2} />;
  }

  if (outfitQuery.isError || !outfitQuery.data) {
    return (
      <ErrorState
        title="Outfit not found"
        message="This outfit could not be found."
        onRetry={() => navigate('/app/outfits')}
      />
    );
  }

  const outfit = outfitQuery.data;
  const allGarments = garmentsQuery.data ?? [];
  const linkedGarments = outfit.garmentIds.map((id) => ({
    id,
    garment: allGarments.find((g) => g.id === id),
  }));

  const openEditDialog = () => {
    setName(outfit.name);
    setDescription(outfit.description ?? '');
    setTagsText(outfit.tags.join(', '));
    setNotes(outfit.notes ?? '');
    setEditOpen(true);
  };

  const handleRecreateInStudio = () => {
    const activeGarments: Garment[] = linkedGarments
      .map((entry) => entry.garment)
      .filter((g): g is Garment => Boolean(g && g.status !== 'ARCHIVED'));
    loadFromGarments(activeGarments);
    toast.success('Loaded active garments into Outfit Studio');
    navigate('/app/outfit-studio');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={outfit.name}
        description={`Created ${formatShortDate(outfit.createdAt)} · ${outfit.garmentIds.length} linked garments`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/app/outfits">
                <ArrowLeft className="h-4 w-4" />
                Saved Outfits
              </Link>
            </Button>
            <Button variant="outline" onClick={openEditDialog}>
              <Pencil className="h-4 w-4" />
              Edit details
            </Button>
            <Button onClick={handleRecreateInStudio}>
              <Sparkles className="h-4 w-4" />
              Recreate in Outfit Studio
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="p-5 lg:col-span-5 space-y-4">
          <div className="overflow-hidden rounded-2xl bg-surface-muted/45 p-4">
            <ImageWithFallback
              src={outfit.generatedImageUrl}
              alt={outfit.name}
              className="mx-auto h-96 w-full object-contain"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => duplicateMutation.mutate()}
              disabled={duplicateMutation.isPending}
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-danger hover:text-danger"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </Card>

        <div className="space-y-5 lg:col-span-7">
          <Card className="p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {outfit.occasion && <TagBadge label={outfit.occasion} tone="sage" />}
              {outfit.tags.map((tag) => (
                <TagBadge key={tag} label={tag} tone="accent" />
              ))}
            </div>
            <p className="text-sm leading-relaxed text-ink-muted">
              {outfit.description ?? 'No description provided for this outfit.'}
            </p>
            {outfit.notes && (
              <div className="rounded-xl bg-surface-muted/60 p-3.5 text-xs text-ink-muted">
                <span className="font-semibold text-ink">Notes: </span>
                {outfit.notes}
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-base font-semibold text-ink">
              Items in this outfit ({linkedGarments.length})
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {linkedGarments.map(({ id, garment }) => {
                if (!garment || garment.status === 'ARCHIVED') {
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface-muted/50 p-3"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-subtle">
                        <Archive className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">
                          {garment ? garment.name : 'Removed garment'}
                        </p>
                        <p className="text-xs text-ink-muted">
                          This item has been archived and will be skipped if recreated.
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={garment.id}
                    to={`/app/wardrobe/${garment.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-accent/40 hover:bg-surface-muted/40"
                  >
                    <ImageWithFallback
                      src={garment.imageUrl}
                      alt={garment.name}
                      className="h-14 w-14 shrink-0 rounded-lg bg-surface-muted/50 object-contain p-1"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{garment.name}</p>
                      <p className="text-xs text-ink-muted">
                        {CATEGORY_SINGULAR[garment.category]} · {garment.color}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <FormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit outfit details"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void updateMutation.mutateAsync();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="detail-outfit-name">Name</Label>
            <Input
              id="detail-outfit-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="detail-outfit-desc">Description</Label>
            <Textarea
              id="detail-outfit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="detail-outfit-tags">Tags (comma-separated)</Label>
            <Input
              id="detail-outfit-tags"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="detail-outfit-notes">Notes</Label>
            <Textarea
              id="detail-outfit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      </FormDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete outfit?"
        description={`"${outfit.name}" will be permanently removed from your saved outfits.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => void deleteMutation.mutateAsync()}
      />
    </div>
  );
}
