import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Eye, Heart, Layers, MoreVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { TagBadge } from '@/components/common/TagBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { FormDialog } from '@/components/common/FormDialog';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { outfitService } from '@/services/outfit.service';
import { formatShortDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Outfit } from '@/types';

type OutfitSort = 'RECENT' | 'RECENTLY_WORN' | 'NAME';

export default function SavedOutfitsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();

  const searchQuery = searchParams.get('q') ?? '';
  const tagFilter = searchParams.get('tag') ?? 'ALL';
  const [occasionFilter, setOccasionFilter] = useState('ALL');
  const [seasonFilter, setSeasonFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<OutfitSort>('RECENT');

  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null);
  const [editName, setEditName] = useState('');
  const [editTagsText, setEditTagsText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Outfit | null>(null);

  const outfitsQuery = useQuery({
    queryKey: ['outfits'],
    queryFn: () => outfitService.listOutfits(),
  });

  const favoriteMutation = useMutation({
    mutationFn: (id: string) => outfitService.toggleFavorite(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['outfits'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Outfit> }) =>
      outfitService.updateOutfit(id, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['outfits'] });
      setEditingOutfit(null);
      toast.success('Outfit updated');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => outfitService.duplicateOutfit(id),
    onSuccess: (copy) => {
      void qc.invalidateQueries({ queryKey: ['outfits'] });
      toast.success(`Duplicated as "${copy.name}"`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => outfitService.deleteOutfit(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['outfits'] });
      setDeleteTarget(null);
      toast.success('Outfit deleted');
    },
  });

  const outfits = outfitsQuery.data ?? [];

  const filterChoices = useMemo(() => {
    const tags = new Set<string>();
    const occasions = new Set<string>();
    const seasons = new Set<string>();
    for (const o of outfits) {
      o.tags.forEach((t) => tags.add(t));
      if (o.occasion) occasions.add(o.occasion);
      if (o.season) seasons.add(o.season);
    }
    return {
      tags: Array.from(tags).sort(),
      occasions: Array.from(occasions).sort(),
      seasons: Array.from(seasons).sort(),
    };
  }, [outfits]);

  const filteredOutfits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = outfits.filter((o) => {
      if (tagFilter !== 'ALL' && !o.tags.includes(tagFilter)) return false;
      if (occasionFilter !== 'ALL' && o.occasion !== occasionFilter) return false;
      if (seasonFilter !== 'ALL' && o.season !== seasonFilter) return false;
      if (q && !`${o.name} ${o.description ?? ''} ${o.tags.join(' ')}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'NAME') return a.name.localeCompare(b.name);
      if (sortBy === 'RECENTLY_WORN') {
        const ta = a.lastWornAt ? new Date(a.lastWornAt).getTime() : 0;
        const tb = b.lastWornAt ? new Date(b.lastWornAt).getTime() : 0;
        return tb - ta;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [outfits, searchQuery, tagFilter, occasionFilter, seasonFilter, sortBy]);

  const openEdit = (outfit: Outfit) => {
    setEditingOutfit(outfit);
    setEditName(outfit.name);
    setEditTagsText(outfit.tags.join(', '));
  };

  if (outfitsQuery.isLoading) {
    return <LoadingSkeleton />;
  }

  if (outfitsQuery.isError) {
    return (
      <ErrorState
        message="Unable to load saved outfits."
        onRetry={() => void outfitsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Outfits"
        description="Your personal lookbook of virtual try-on combinations ready to wear, edit, or plan."
        actions={
          <Button asChild>
            <Link to="/app/outfit-studio">
              <Plus className="h-4 w-4" />
              Create new outfit
            </Link>
          </Button>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              const next = new URLSearchParams(searchParams);
              if (!e.target.value) next.delete('q');
              else next.set('q', e.target.value);
              setSearchParams(next);
            }}
            placeholder="Search saved outfits..."
            aria-label="Search saved outfits"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={tagFilter}
            onValueChange={(val) => {
              const next = new URLSearchParams(searchParams);
              if (val === 'ALL') next.delete('tag');
              else next.set('tag', val);
              setSearchParams(next);
            }}
          >
            <SelectTrigger aria-label="Filter by tag" className="w-[140px]">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All tags</SelectItem>
              {filterChoices.tags.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={occasionFilter} onValueChange={setOccasionFilter}>
            <SelectTrigger aria-label="Filter by occasion" className="w-[145px]">
              <SelectValue placeholder="Occasion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All occasions</SelectItem>
              {filterChoices.occasions.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={seasonFilter} onValueChange={setSeasonFilter}>
            <SelectTrigger aria-label="Filter by season" className="w-[140px]">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All seasons</SelectItem>
              {filterChoices.seasons.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as OutfitSort)}>
            <SelectTrigger aria-label="Sort outfits" className="w-[165px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RECENT">Recently Created</SelectItem>
              <SelectItem value="RECENTLY_WORN">Recently Worn</SelectItem>
              <SelectItem value="NAME">Name (A–Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {outfits.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No saved outfits yet"
          description="Combine garments in Outfit Studio and save your favorite combinations here."
          action={
            <Button asChild>
              <Link to="/app/outfit-studio">Create your first outfit</Link>
            </Button>
          }
        />
      ) : filteredOutfits.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No outfits match your filters"
          description="Try clearing your search or selecting another tag."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearchParams({});
                setOccasionFilter('ALL');
                setSeasonFilter('ALL');
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOutfits.map((outfit) => (
            <Card key={outfit.id} className="group flex flex-col overflow-hidden">
              <div className="relative bg-surface-muted/45 p-4">
                <Link to={`/app/outfits/${outfit.id}`} className="block">
                  <ImageWithFallback
                    src={outfit.generatedImageUrl}
                    alt={outfit.name}
                    className="mx-auto h-72 w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                </Link>
                <div className="absolute right-3 top-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => favoriteMutation.mutate(outfit.id)}
                    aria-label={outfit.favorite ? 'Unfavorite outfit' : 'Favorite outfit'}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface/90 shadow-sm"
                  >
                    <Heart
                      className={cn(
                        'h-4 w-4',
                        outfit.favorite ? 'fill-accent text-accent' : 'text-ink-muted',
                      )}
                    />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Actions for ${outfit.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface/90 text-ink-muted shadow-sm"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/app/outfits/${outfit.id}`}>
                          <Eye className="h-4 w-4 text-ink-muted" />
                          <span>Open look</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(outfit)}>
                        <Pencil className="h-4 w-4 text-ink-muted" />
                        <span>Edit tags / name</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateMutation.mutate(outfit.id)}>
                        <Copy className="h-4 w-4 text-ink-muted" />
                        <span>Duplicate</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(outfit)}
                        className="text-danger focus:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                <div className="space-y-1">
                  <Link
                    to={`/app/outfits/${outfit.id}`}
                    className="block text-base font-semibold text-ink hover:text-accent"
                  >
                    {outfit.name}
                  </Link>
                  <p className="text-xs text-ink-muted">
                    {outfit.garmentIds.length} pieces · {formatShortDate(outfit.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {outfit.tags.map((tag) => (
                    <TagBadge key={tag} label={tag} />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <FormDialog
        open={Boolean(editingOutfit)}
        onOpenChange={(open) => !open && setEditingOutfit(null)}
        title="Edit outfit"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!editingOutfit) return;
            void updateMutation.mutateAsync({
              id: editingOutfit.id,
              patch: {
                name: editName.trim() || editingOutfit.name,
                tags: editTagsText
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              },
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="edit-outfit-name">Name</Label>
            <Input
              id="edit-outfit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-outfit-tags">Tags (comma-separated)</Label>
            <Input
              id="edit-outfit-tags"
              value={editTagsText}
              onChange={(e) => setEditTagsText(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEditingOutfit(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              Save
            </Button>
          </div>
        </form>
      </FormDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete saved outfit?"
        description={`"${deleteTarget?.name ?? ''}" will be removed from Saved Outfits and any scheduled calendar dates.`}
        confirmLabel="Delete outfit"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) return deleteMutation.mutateAsync(deleteTarget.id);
        }}
      />
    </div>
  );
}
