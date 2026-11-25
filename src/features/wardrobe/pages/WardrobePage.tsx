import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, List, Plus, Search, Shirt, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
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
import { FilterPopover } from '@/components/common/FilterPopover';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { GarmentCard } from '@/features/wardrobe/components/GarmentCard';
import { GarmentEditDialog } from '@/features/wardrobe/components/GarmentEditDialog';
import { wardrobeService } from '@/services/wardrobe.service';
import { useOutfitStudioStore } from '@/store/outfit-studio.store';
import { CATEGORY_LABELS } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Garment, GarmentCategory } from '@/types';

const CATEGORIES: Array<'ALL' | GarmentCategory> = [
  'ALL',
  'TOP',
  'BOTTOM',
  'ONE_PIECE',
  'OUTERWEAR',
  'FOOTWEAR',
  'ACCESSORY',
  'TRADITIONAL',
];

type SortKey = 'RECENT' | 'NAME' | 'CATEGORY' | 'MOST_WORN';

export default function WardrobePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const selectGarmentInStudio = useOutfitStudioStore((s) => s.selectGarment);

  const activeCategory = (searchParams.get('category') as 'ALL' | GarmentCategory | null) ?? 'ALL';
  const searchQuery = searchParams.get('q') ?? '';
  const [colorFilter, setColorFilter] = useState<string>('ALL');
  const [seasonFilter, setSeasonFilter] = useState<string>('ALL');
  const [occasionFilter, setOccasionFilter] = useState<string>('ALL');
  const [styleFilter, setStyleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [sortBy, setSortBy] = useState<SortKey>('RECENT');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [editingGarment, setEditingGarment] = useState<Garment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Garment | null>(null);

  const itemsQuery = useQuery({
    queryKey: ['wardrobe', 'items', 'all-including-archived'],
    queryFn: () => wardrobeService.listItems({ includeArchived: true }),
  });

  const favoriteMutation = useMutation({
    mutationFn: (id: string) => wardrobeService.toggleFavorite(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['wardrobe'] });
      const prev = qc.getQueryData<Garment[]>([
        'wardrobe',
        'items',
        'all-including-archived',
      ]);
      if (prev) {
        qc.setQueryData(
          ['wardrobe', 'items', 'all-including-archived'],
          prev.map((g) => (g.id === id ? { ...g, favorite: !g.favorite } : g)),
        );
      }
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(['wardrobe', 'items', 'all-including-archived'], ctx.prev);
      }
      toast.error('Unable to update favorite status');
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['wardrobe'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Garment> }) =>
      wardrobeService.updateItem(id, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['wardrobe'] });
      toast.success('Garment updated');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => wardrobeService.archiveItem(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['wardrobe'] });
      toast.success('Garment archived');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => wardrobeService.deleteItem(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['wardrobe'] });
      setDeleteTarget(null);
      toast.success('Garment deleted');
    },
  });

  const allItems = itemsQuery.data ?? [];

  const nonArchivedItems = useMemo(
    () => allItems.filter((g) => g.status !== 'ARCHIVED'),
    [allItems],
  );

  const filterOptions = useMemo(() => {
    const colors = new Set<string>();
    const seasons = new Set<string>();
    const occasions = new Set<string>();
    const styles = new Set<string>();
    for (const item of allItems) {
      colors.add(item.color);
      item.seasonTags.forEach((t) => seasons.add(t));
      item.occasionTags.forEach((t) => occasions.add(t));
      item.styleTags.forEach((t) => styles.add(t));
    }
    return {
      colors: Array.from(colors).sort(),
      seasons: Array.from(seasons).sort(),
      occasions: Array.from(occasions).sort(),
      styles: Array.from(styles).sort(),
    };
  }, [allItems]);

  const categoryCounts = useMemo(() => {
    const base = statusFilter === 'ARCHIVED' ? allItems.filter((g) => g.status === 'ARCHIVED') : nonArchivedItems;
    const map: Record<string, number> = { ALL: base.length };
    for (const c of CATEGORIES) {
      if (c !== 'ALL') {
        map[c] = base.filter((g) => g.category === c).length;
      }
    }
    return map;
  }, [allItems, nonArchivedItems, statusFilter]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = allItems.filter((item) => {
      if (statusFilter === 'ACTIVE' && item.status === 'ARCHIVED') return false;
      if (statusFilter === 'ARCHIVED' && item.status !== 'ARCHIVED') return false;
      if (statusFilter === 'PROCESSING' && item.status !== 'PROCESSING' && item.status !== 'FAILED')
        return false;
      if (activeCategory !== 'ALL' && item.category !== activeCategory) return false;
      if (colorFilter !== 'ALL' && item.color !== colorFilter) return false;
      if (seasonFilter !== 'ALL' && !item.seasonTags.includes(seasonFilter)) return false;
      if (occasionFilter !== 'ALL' && !item.occasionTags.includes(occasionFilter)) return false;
      if (styleFilter !== 'ALL' && !item.styleTags.includes(styleFilter)) return false;
      if (q) {
        const hay = `${item.name} ${item.brand ?? ''} ${item.color} ${item.subcategory}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'NAME') return a.name.localeCompare(b.name);
      if (sortBy === 'CATEGORY') return a.category.localeCompare(b.category);
      if (sortBy === 'MOST_WORN') return b.wearCount - a.wearCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    allItems,
    statusFilter,
    activeCategory,
    colorFilter,
    seasonFilter,
    occasionFilter,
    styleFilter,
    searchQuery,
    sortBy,
  ]);

  const activeFilterCount =
    (colorFilter !== 'ALL' ? 1 : 0) +
    (seasonFilter !== 'ALL' ? 1 : 0) +
    (occasionFilter !== 'ALL' ? 1 : 0) +
    (styleFilter !== 'ALL' ? 1 : 0) +
    (statusFilter !== 'ACTIVE' ? 1 : 0);

  const setCategory = (cat: 'ALL' | GarmentCategory) => {
    const next = new URLSearchParams(searchParams);
    if (cat === 'ALL') next.delete('category');
    else next.set('category', cat);
    setSearchParams(next);
  };

  const setSearch = (q: string) => {
    const next = new URLSearchParams(searchParams);
    if (!q) next.delete('q');
    else next.set('q', q);
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setColorFilter('ALL');
    setSeasonFilter('ALL');
    setOccasionFilter('ALL');
    setStyleFilter('ALL');
    setStatusFilter('ACTIVE');
    setSearchParams({});
  };

  const handleAddToStudio = (garment: Garment) => {
    selectGarmentInStudio(garment);
    toast.success(`Added "${garment.name}" to Outfit Studio`);
    navigate('/app/outfit-studio');
  };

  if (itemsQuery.isLoading) {
    return <LoadingSkeleton />;
  }

  if (itemsQuery.isError) {
    return (
      <ErrorState
        message="Unable to load your wardrobe catalogue."
        onRetry={() => void itemsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Wardrobe"
        description={`${nonArchivedItems.length} active garments catalogued across tops, bottoms, outerwear, footwear, and traditional wear.`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/app/wardrobe/upload">
                <Upload className="h-4 w-4" />
                Bulk upload
              </Link>
            </Button>
            <Button asChild>
              <Link to="/app/wardrobe/upload">
                <Plus className="h-4 w-4" />
                Add clothes
              </Link>
            </Button>
          </>
        }
      />

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat;
          const label = cat === 'ALL' ? 'All Items' : CATEGORY_LABELS[cat];
          const count = categoryCounts[cat] ?? 0;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink',
              )}
            >
              <span>{label}</span>
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[11px]',
                  active ? 'bg-white/20 text-white' : 'bg-surface-muted text-ink-subtle',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search, Filters, Sort, View Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by item name, brand, or color..."
            aria-label="Search wardrobe items"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterPopover activeCount={activeFilterCount}>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">Filter wardrobe</p>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="filter-color">Color</Label>
                <Select value={colorFilter} onValueChange={setColorFilter}>
                  <SelectTrigger id="filter-color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All colors</SelectItem>
                    {filterOptions.colors.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="filter-occasion">Occasion</Label>
                <Select value={occasionFilter} onValueChange={setOccasionFilter}>
                  <SelectTrigger id="filter-occasion">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All occasions</SelectItem>
                    {filterOptions.occasions.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="filter-season">Season</Label>
                <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                  <SelectTrigger id="filter-season">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All seasons</SelectItem>
                    {filterOptions.seasons.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="filter-style">Style</Label>
                <Select value={styleFilter} onValueChange={setStyleFilter}>
                  <SelectTrigger id="filter-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All styles</SelectItem>
                    {filterOptions.styles.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="filter-status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="filter-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active items</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                    <SelectItem value="PROCESSING">Processing / Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FilterPopover>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
            <SelectTrigger aria-label="Sort garments" className="w-[165px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RECENT">Recently Added</SelectItem>
              <SelectItem value="NAME">Name (A–Z)</SelectItem>
              <SelectItem value="CATEGORY">Category</SelectItem>
              <SelectItem value="MOST_WORN">Most Worn</SelectItem>
            </SelectContent>
          </Select>

          <div className="inline-flex rounded-xl border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={cn(
                'rounded-lg p-1.5',
                viewMode === 'grid' ? 'bg-surface-muted text-ink' : 'text-ink-subtle',
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={cn(
                'rounded-lg p-1.5',
                viewMode === 'list' ? 'bg-surface-muted text-ink' : 'text-ink-subtle',
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results / Empty States */}
      {allItems.length === 0 ? (
        <EmptyState
          icon={Shirt}
          title="Your wardrobe is waiting"
          description="Add your first clothing items to build your digital catalogue and start creating outfits."
          action={
            <Button asChild>
              <Link to="/app/wardrobe/upload">Upload your first items</Link>
            </Button>
          }
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching garments"
          description="No items matched your current search or filter combination."
          action={
            <Button variant="outline" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredItems.map((garment) => (
            <GarmentCard
              key={garment.id}
              garment={garment}
              viewMode="grid"
              onToggleFavorite={(id) => favoriteMutation.mutate(id)}
              onEdit={setEditingGarment}
              onAddToStudio={handleAddToStudio}
              onArchive={(g) => archiveMutation.mutate(g.id)}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((garment) => (
            <GarmentCard
              key={garment.id}
              garment={garment}
              viewMode="list"
              onToggleFavorite={(id) => favoriteMutation.mutate(id)}
              onEdit={setEditingGarment}
              onAddToStudio={handleAddToStudio}
              onArchive={(g) => archiveMutation.mutate(g.id)}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <GarmentEditDialog
        garment={editingGarment}
        open={Boolean(editingGarment)}
        onOpenChange={(open) => !open && setEditingGarment(null)}
        isSaving={updateMutation.isPending}
        onSave={async (id, patch) => {
          await updateMutation.mutateAsync({ id, patch });
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete garment?"
        description={`"${deleteTarget?.name ?? ''}" will be permanently removed from your digital wardrobe.`}
        confirmLabel="Delete item"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) return deleteMutation.mutateAsync(deleteTarget.id);
        }}
      />
    </div>
  );
}
