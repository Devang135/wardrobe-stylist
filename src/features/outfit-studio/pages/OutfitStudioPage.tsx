import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookmarkPlus,
  Check,
  Columns2,
  Download,
  Info,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { FormDialog } from '@/components/common/FormDialog';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { GenerationStatus, type GenerationStep } from '@/components/feedback/GenerationStatus';
import { BRAND_CONFIG, CREDIT_RULES } from '@/config/brand.config';
import { wardrobeService } from '@/services/wardrobe.service';
import { avatarService } from '@/services/avatar.service';
import { outfitService } from '@/services/outfit.service';
import { subscriptionService } from '@/services/subscription.service';
import { useOutfitStudioStore } from '@/store/outfit-studio.store';
import { cn } from '@/lib/cn';
import type { Garment, GarmentCategory } from '@/types';

type StudioTab = 'TOP' | 'BOTTOM' | 'FOOTWEAR' | 'ACCESSORY' | 'OUTERWEAR_ONEPIECE';

const STUDIO_TABS: Array<{ id: StudioTab; label: string; categories: GarmentCategory[] }> = [
  { id: 'TOP', label: 'Top', categories: ['TOP', 'TRADITIONAL'] },
  { id: 'BOTTOM', label: 'Bottom', categories: ['BOTTOM'] },
  { id: 'FOOTWEAR', label: 'Shoes', categories: ['FOOTWEAR'] },
  { id: 'ACCESSORY', label: 'Accessories', categories: ['ACCESSORY'] },
  { id: 'OUTERWEAR_ONEPIECE', label: 'Outerwear / One-piece', categories: ['OUTERWEAR', 'ONE_PIECE'] },
];

const OUTFIT_TAG_PRESETS = [
  'Party',
  'Office',
  'Western',
  'Traditional',
  'Wedding',
  'Casual',
  'Travel',
  'Minimal',
];

export default function OutfitStudioPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const {
    selection,
    lastPreviewUrl,
    lastPreviewGarmentIds,
    selectGarment,
    removeSlot,
    removeAccessory,
    clearSelection,
    setPreview,
    clearPreview,
  } = useOutfitStudioStore();

  const [activeTab, setActiveTab] = useState<StudioTab>('TOP');
  const [search, setSearch] = useState('');
  const [mobileStep, setMobileStep] = useState<1 | 2 | 3>(1);

  const [confirmGenerateOpen, setConfirmGenerateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genSteps, setGenSteps] = useState<GenerationStep[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [outfitDescription, setOutfitDescription] = useState('');
  const [outfitOccasion, setOutfitOccasion] = useState('Casual');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Casual']);

  const garmentsQuery = useQuery({
    queryKey: ['wardrobe', 'items'],
    queryFn: () => wardrobeService.listItems(),
  });
  const avatarQuery = useQuery({
    queryKey: ['avatar'],
    queryFn: () => avatarService.getAvatar(),
  });
  const subscriptionQuery = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionService.getSummary(),
  });

  const saveOutfitMutation = useMutation({
    mutationFn: () =>
      outfitService.saveOutfit({
        name: outfitName.trim() || 'Untitled Studio Look',
        description: outfitDescription.trim() || undefined,
        generatedImageUrl: lastPreviewUrl!,
        garmentIds: lastPreviewGarmentIds,
        tags: selectedTags,
        occasion: outfitOccasion,
      }),
    onSuccess: (created) => {
      void qc.invalidateQueries({ queryKey: ['outfits'] });
      setSaveDialogOpen(false);
      toast.success(`Saved "${created.name}" to Saved Outfits`);
      navigate(`/app/outfits/${created.id}`);
    },
  });

  const garments = garmentsQuery.data ?? [];
  const avatar = avatarQuery.data;
  const creditsRemaining = subscriptionQuery.data?.summary.creditsRemaining ?? 0;

  const garmentMap = useMemo(() => {
    const map = new Map<string, Garment>();
    for (const g of garments) map.set(g.id, g);
    return map;
  }, [garments]);

  const currentTabConfig = STUDIO_TABS.find((t) => t.id === activeTab) ?? STUDIO_TABS[0];

  const filteredTabGarments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return garments.filter((g) => {
      if (!currentTabConfig.categories.includes(g.category)) return false;
      if (!q) return true;
      return `${g.name} ${g.color} ${g.subcategory} ${g.brand ?? ''}`.toLowerCase().includes(q);
    });
  }, [garments, currentTabConfig, search]);

  const isSelected = (id: string) =>
    selection.topId === id ||
    selection.bottomId === id ||
    selection.onePieceId === id ||
    selection.outerwearId === id ||
    selection.footwearId === id ||
    selection.accessoryIds.includes(id);

  const selectedGarmentsList = useMemo(() => {
    const ids = [
      selection.onePieceId,
      selection.topId,
      selection.bottomId,
      selection.outerwearId,
      selection.footwearId,
      ...selection.accessoryIds,
    ].filter((id): id is string => Boolean(id));
    return ids.map((id) => garmentMap.get(id)).filter((g): g is Garment => Boolean(g));
  }, [selection, garmentMap]);

  const hasValidAvatar = Boolean(avatar?.status === 'READY' && avatar.avatarImageUrl);
  const hasCoreGarments = Boolean(
    selection.onePieceId || (selection.topId && selection.bottomId),
  );
  const hasFootwear = Boolean(selection.footwearId);
  const hasEnoughCredits = creditsRemaining >= CREDIT_RULES.tryOnGenerationCost;

  const missingRequirements: string[] = [];
  if (!hasValidAvatar) missingRequirements.push('Create or activate your AI avatar');
  if (!hasCoreGarments) missingRequirements.push('Select a Top + Bottom (or a One-piece)');
  if (!hasFootwear) missingRequirements.push('Select Footwear');
  if (!hasEnoughCredits) missingRequirements.push('At least 1 AI credit');

  const canGenerate = missingRequirements.length === 0 && !isGenerating;

  const runGeneration = async () => {
    if (!avatar?.id) return;
    setConfirmGenerateOpen(false);
    setIsGenerating(true);
    setCompareMode(false);
    setMobileStep(3);

    setGenSteps([
      { id: '1', label: 'Preparing references', status: 'active' },
      { id: '2', label: 'Generating look', status: 'pending' },
      { id: '3', label: 'Saving preview', status: 'pending' },
    ]);

    const t1 = window.setTimeout(() => {
      setGenSteps([
        { id: '1', label: 'Preparing references', status: 'done' },
        { id: '2', label: 'Generating look', status: 'active' },
        { id: '3', label: 'Saving preview', status: 'pending' },
      ]);
    }, 300);

    const t2 = window.setTimeout(() => {
      setGenSteps([
        { id: '1', label: 'Preparing references', status: 'done' },
        { id: '2', label: 'Generating look', status: 'done' },
        { id: '3', label: 'Saving preview', status: 'active' },
      ]);
    }, 640);

    try {
      const result = await outfitService.generateTryOn({
        avatarId: avatar.id,
        topId: selection.topId,
        bottomId: selection.bottomId,
        onePieceId: selection.onePieceId,
        outerwearId: selection.outerwearId,
        footwearId: selection.footwearId,
        accessoryIds: selection.accessoryIds,
      });
      setPreview(result.previewUrl, result.garmentIds);
      void qc.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Try-on preview generated (Demo)');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to generate try-on preview');
    } finally {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      setIsGenerating(false);
    }
  };

  const handleDownloadPreview = () => {
    if (!lastPreviewUrl) return;
    const link = document.createElement('a');
    link.href = lastPreviewUrl;
    link.download = `wardrobe-ai-look-${Date.now()}.svg`;
    link.click();
    toast.success('Preview image downloaded');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  if (garmentsQuery.isLoading || avatarQuery.isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outfit Studio"
        description="Pair garments from your wardrobe and generate a full-body virtual try-on on your studio avatar."
        actions={
          <div className="flex items-center gap-2">
            {selectedGarmentsList.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearSelection}>
                <Trash2 className="h-4 w-4" />
                Clear selection
              </Button>
            )}
          </div>
        }
      />

      {/* Mobile Step Switcher */}
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-surface p-1.5 lg:hidden">
        {[
          { step: 1 as const, label: '1. Select Items' },
          { step: 2 as const, label: `2. Review (${selectedGarmentsList.length})` },
          { step: 3 as const, label: '3. Preview' },
        ].map((item) => (
          <button
            key={item.step}
            type="button"
            onClick={() => setMobileStep(item.step)}
            className={cn(
              'rounded-xl px-2 py-2 text-xs font-medium transition-colors',
              mobileStep === item.step
                ? 'bg-accent text-white'
                : 'text-ink-muted hover:bg-surface-muted',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 3-Column Studio Workspace */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Column 1: Wardrobe Selector */}
        <Card
          className={cn(
            'p-4 space-y-4 lg:col-span-5',
            mobileStep !== 1 && 'hidden lg:block',
          )}
        >
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {STUDIO_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-accent text-white'
                    : 'bg-surface-muted text-ink-muted hover:text-ink',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${currentTabConfig.label.toLowerCase()}...`}
              aria-label="Filter items in category"
              className="pl-9 h-9"
            />
          </div>

          {filteredTabGarments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm font-medium text-ink">No items in this category</p>
              <p className="mt-1 text-xs text-ink-muted">
                Upload more clothes or clear your search term.
              </p>
            </div>
          ) : (
            <div className="grid max-h-[540px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-2">
              {filteredTabGarments.map((item) => {
                const selected = isSelected(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectGarment(item)}
                    className={cn(
                      'group relative flex flex-col rounded-xl border p-2.5 text-left transition-all',
                      selected
                        ? 'border-accent bg-accent-soft/35 ring-1 ring-accent'
                        : 'border-border bg-surface hover:border-border-strong',
                    )}
                  >
                    {selected && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    <div className="aspect-square w-full overflow-hidden rounded-lg bg-surface-muted/45 p-1.5">
                      <ImageWithFallback
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <p className="mt-2 truncate text-xs font-semibold text-ink">{item.name}</p>
                    <p className="truncate text-[11px] text-ink-muted">
                      {item.color} · {item.subcategory}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex justify-end lg:hidden">
            <Button onClick={() => setMobileStep(2)}>Review selection</Button>
          </div>
        </Card>

        {/* Column 2: Selected Garment Slots */}
        <Card
          className={cn(
            'p-5 space-y-4 lg:col-span-3',
            mobileStep !== 2 && 'hidden lg:block',
          )}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Selected Slots</h3>
            <span className="text-xs text-ink-subtle">{selectedGarmentsList.length} items</span>
          </div>

          <div className="space-y-2.5">
            {selection.onePieceId ? (
              <SlotItemRow
                label="One-piece"
                garment={garmentMap.get(selection.onePieceId)}
                onRemove={() => removeSlot('onePieceId')}
              />
            ) : (
              <>
                <SlotItemRow
                  label="Primary Top *"
                  garment={selection.topId ? garmentMap.get(selection.topId) : undefined}
                  onRemove={() => removeSlot('topId')}
                  onSelectTab={() => {
                    setActiveTab('TOP');
                    setMobileStep(1);
                  }}
                />
                <SlotItemRow
                  label="Primary Bottom *"
                  garment={selection.bottomId ? garmentMap.get(selection.bottomId) : undefined}
                  onRemove={() => removeSlot('bottomId')}
                  onSelectTab={() => {
                    setActiveTab('BOTTOM');
                    setMobileStep(1);
                  }}
                />
              </>
            )}

            <SlotItemRow
              label="Footwear *"
              garment={selection.footwearId ? garmentMap.get(selection.footwearId) : undefined}
              onRemove={() => removeSlot('footwearId')}
              onSelectTab={() => {
                setActiveTab('FOOTWEAR');
                setMobileStep(1);
              }}
            />

            <SlotItemRow
              label="Outerwear (Optional)"
              garment={selection.outerwearId ? garmentMap.get(selection.outerwearId) : undefined}
              onRemove={() => removeSlot('outerwearId')}
              onSelectTab={() => {
                setActiveTab('OUTERWEAR_ONEPIECE');
                setMobileStep(1);
              }}
            />

            <div className="rounded-xl border border-border bg-surface-muted/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-muted">Accessories (Optional)</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ACCESSORY');
                    setMobileStep(1);
                  }}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Add
                </button>
              </div>
              {selection.accessoryIds.length === 0 ? (
                <p className="text-xs text-ink-subtle">Watch, sunglasses, bag, or belt</p>
              ) : (
                <div className="space-y-1.5">
                  {selection.accessoryIds.map((accId) => {
                    const g = garmentMap.get(accId);
                    if (!g) return null;
                    return (
                      <div
                        key={accId}
                        className="flex items-center justify-between gap-2 rounded-lg bg-surface p-1.5 border border-border"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <ImageWithFallback
                            src={g.imageUrl}
                            alt={g.name}
                            className="h-8 w-8 rounded object-contain bg-surface-muted/40"
                          />
                          <span className="truncate text-xs font-medium text-ink">{g.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAccessory(accId)}
                          aria-label={`Remove ${g.name}`}
                          className="rounded p-1 text-ink-subtle hover:bg-surface-muted hover:text-ink"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {missingRequirements.length > 0 && (
            <div className="rounded-xl border border-warning/30 bg-warning-soft/60 p-3 text-xs text-warning space-y-1">
              <p className="font-semibold">Required before try-on:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {missingRequirements.map((req) => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2 border-t border-border pt-3">
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Estimated cost</span>
              <span className="font-semibold text-ink">
                Uses {CREDIT_RULES.tryOnGenerationCost} AI credit
              </span>
            </div>
            <Button
              className="w-full"
              disabled={!canGenerate}
              onClick={() => setConfirmGenerateOpen(true)}
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate try-on'}
            </Button>
          </div>
        </Card>

        {/* Column 3: Avatar & Try-on Preview */}
        <Card
          className={cn(
            'p-5 space-y-4 lg:col-span-4',
            mobileStep !== 3 && 'hidden lg:block',
          )}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">
              {lastPreviewUrl ? 'Try-On Result (Demo)' : 'Studio Avatar'}
            </h3>
            {lastPreviewUrl && avatar?.avatarImageUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCompareMode((v) => !v)}
              >
                <Columns2 className="h-4 w-4" />
                {compareMode ? 'Single view' : 'Compare'}
              </Button>
            )}
          </div>

          {!hasValidAvatar ? (
            <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface-muted/40 p-6 text-center">
              <UserCheck className="mb-3 h-10 w-10 text-ink-subtle" />
              <p className="text-sm font-semibold text-ink">Avatar required</p>
              <p className="mt-1 text-xs text-ink-muted">
                Set up your personal avatar first to preview outfits in Outfit Studio.
              </p>
              <Button asChild size="sm" className="mt-4">
                <Link to="/app/avatar">Go to My Avatar</Link>
              </Button>
            </div>
          ) : isGenerating ? (
            <GenerationStatus
              title="Generating virtual try-on (Demo)"
              subtitle="Composing your avatar with selected garments"
              steps={genSteps}
            />
          ) : (
            <div className="space-y-3">
              {compareMode && lastPreviewUrl && avatar?.avatarImageUrl ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-surface-muted/40 p-2 text-center">
                    <ImageWithFallback
                      src={avatar.avatarImageUrl}
                      alt="Base avatar"
                      className="mx-auto h-64 object-contain"
                    />
                    <span className="mt-1 block text-[11px] text-ink-subtle">Base Avatar</span>
                  </div>
                  <div className="rounded-xl border border-accent bg-accent-soft/20 p-2 text-center">
                    <ImageWithFallback
                      src={lastPreviewUrl}
                      alt="Generated try-on"
                      className="mx-auto h-64 object-contain"
                    />
                    <span className="mt-1 block text-[11px] font-medium text-accent">
                      Try-On Look
                    </span>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-border bg-surface-muted/40 p-4">
                  <ImageWithFallback
                    src={lastPreviewUrl ?? avatar?.avatarImageUrl}
                    alt={lastPreviewUrl ? 'Generated try-on look' : 'Active studio avatar'}
                    className="mx-auto h-96 w-full object-contain"
                  />
                </div>
              )}

              {lastPreviewUrl && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="col-span-2"
                    onClick={() => {
                      setOutfitName('');
                      setSaveDialogOpen(true);
                    }}
                  >
                    <BookmarkPlus className="h-4 w-4" />
                    Save outfit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmGenerateOpen(true)}
                    disabled={!canGenerate}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadPreview}>
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="col-span-2"
                    onClick={() => {
                      clearPreview();
                      setMobileStep(1);
                    }}
                  >
                    Edit selection
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-start gap-2 rounded-xl bg-surface-muted/70 p-3 text-xs text-ink-muted">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" />
            <p>{BRAND_CONFIG.disclaimerText}</p>
          </div>
        </Card>
      </div>

      {/* Confirm Credit Usage */}
      <ConfirmDialog
        open={confirmGenerateOpen}
        onOpenChange={setConfirmGenerateOpen}
        title="Generate virtual try-on?"
        description={`This will simulate an AI try-on preview using ${CREDIT_RULES.tryOnGenerationCost} AI credit. You currently have ${creditsRemaining} credits remaining.`}
        confirmLabel={`Use ${CREDIT_RULES.tryOnGenerationCost} credit & generate`}
        onConfirm={() => void runGeneration()}
      />

      {/* Save Outfit Dialog */}
      <FormDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        title="Save outfit to lookbook"
        description="Name this combination and add tags so you can filter or schedule it later."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void saveOutfitMutation.mutateAsync();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="save-outfit-name">Outfit name</Label>
            <Input
              id="save-outfit-name"
              required
              value={outfitName}
              onChange={(e) => setOutfitName(e.target.value)}
              placeholder="e.g. Friday Gallery Dinner"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="save-outfit-occasion">Primary occasion</Label>
            <Input
              id="save-outfit-occasion"
              value={outfitOccasion}
              onChange={(e) => setOutfitOccasion(e.target.value)}
              placeholder="Office, Party, Casual, Wedding..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5">
              {OUTFIT_TAG_PRESETS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      active
                        ? 'border-accent bg-accent-soft text-accent'
                        : 'border-border bg-surface text-ink-muted hover:bg-surface-muted',
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="save-outfit-desc">Description (optional)</Label>
            <Textarea
              id="save-outfit-desc"
              value={outfitDescription}
              onChange={(e) => setOutfitDescription(e.target.value)}
              placeholder="Styling notes or weather suitability..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveOutfitMutation.isPending}>
              {saveOutfitMutation.isPending ? 'Saving...' : 'Save outfit'}
            </Button>
          </div>
        </form>
      </FormDialog>
    </div>
  );
}

function SlotItemRow({
  label,
  garment,
  onRemove,
  onSelectTab,
}: {
  label: string;
  garment?: Garment;
  onRemove: () => void;
  onSelectTab?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface-muted/35 p-2.5">
      {garment ? (
        <>
          <div className="flex min-w-0 items-center gap-2.5">
            <ImageWithFallback
              src={garment.imageUrl}
              alt={garment.name}
              className="h-11 w-11 shrink-0 rounded-lg bg-surface object-contain p-0.5"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-ink-subtle">{label}</p>
              <p className="truncate text-xs font-semibold text-ink">{garment.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${garment.name}`}
            className="rounded-lg p-1.5 text-ink-subtle hover:bg-surface hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      ) : (
        <div className="flex w-full items-center justify-between py-1">
          <div>
            <p className="text-xs font-medium text-ink-muted">{label}</p>
            <p className="text-[11px] text-ink-subtle">Empty slot</p>
          </div>
          {onSelectTab && (
            <button
              type="button"
              onClick={onSelectTab}
              className="text-xs font-medium text-accent hover:underline"
            >
              Choose
            </button>
          )}
        </div>
      )}
    </div>
  );
}
