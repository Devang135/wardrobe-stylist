import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookmarkPlus, Loader2, Send, Shirt, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { TagBadge } from '@/components/common/TagBadge';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { stylistService } from '@/services/stylist.service';
import { wardrobeService } from '@/services/wardrobe.service';
import { outfitService } from '@/services/outfit.service';
import { useOutfitStudioStore } from '@/store/outfit-studio.store';
import { createAvatarIllustration } from '@/assets/fashion-illustrations';
import { cn } from '@/lib/cn';
import type { Garment, StylistRecommendation } from '@/types';

const PROMPT_SUGGESTIONS = [
  'Create a smart-casual office look.',
  'What can I wear to a dinner party?',
  'Style my blue shirt in three ways.',
  'Suggest an outfit using items I rarely wear.',
];

const STYLE_CHIPS = ['Minimal', 'Smart Casual', 'Formal', 'Traditional', 'Travel'];

export default function StylistPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const loadFromGarments = useOutfitStudioStore((s) => s.loadFromGarments);

  const [input, setInput] = useState('');
  const [occasion, setOccasion] = useState('ANY');
  const [selectedStyle, setSelectedStyle] = useState<string>('Minimal');

  const messagesQuery = useQuery({
    queryKey: ['stylist', 'messages'],
    queryFn: () => stylistService.getConversation(),
  });

  const garmentsQuery = useQuery({
    queryKey: ['wardrobe', 'items'],
    queryFn: () => wardrobeService.listItems(),
  });

  const sendMutation = useMutation({
    mutationFn: (message: string) =>
      stylistService.sendMessage({
        message,
        occasion: occasion === 'ANY' ? undefined : occasion,
        style: selectedStyle,
      }),
    onSuccess: (nextMessages) => {
      qc.setQueryData(['stylist', 'messages'], nextMessages);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Unable to get stylist reply');
    },
  });

  const saveSuggestionMutation = useMutation({
    mutationFn: (rec: StylistRecommendation) => {
      const garments = garmentsQuery.data ?? [];
      const linked = rec.garmentIds
        .map((id) => garments.find((g) => g.id === id))
        .filter((g): g is Garment => Boolean(g));
      const findColor = (cat: Garment['category']) => linked.find((g) => g.category === cat)?.colorHex;

      return outfitService.saveOutfit({
        name: rec.title,
        description: rec.rationale,
        generatedImageUrl: createAvatarIllustration({
          topColor: findColor('TOP') ?? findColor('TRADITIONAL') ?? '#EAE4DC',
          bottomColor: findColor('BOTTOM') ?? '#344154',
          outerwearColor: findColor('OUTERWEAR'),
          footwearColor: findColor('FOOTWEAR') ?? '#FAF8F5',
          label: rec.title,
        }),
        garmentIds: rec.garmentIds,
        tags: rec.tags,
        occasion: rec.occasion,
      });
    },
    onSuccess: (saved) => {
      void qc.invalidateQueries({ queryKey: ['outfits'] });
      toast.success(`Saved "${saved.name}" to Saved Outfits`);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sendMutation.isPending) return;
    setInput('');
    sendMutation.mutate(trimmed);
  };

  const handleOpenInStudio = (rec: StylistRecommendation) => {
    const garments = garmentsQuery.data ?? [];
    const matched = rec.garmentIds
      .map((id) => garments.find((g) => g.id === id))
      .filter((g): g is Garment => Boolean(g));
    loadFromGarments(matched);
    toast.success(`Loaded "${rec.title}" into Outfit Studio`);
    navigate('/app/outfit-studio');
  };

  if (messagesQuery.isLoading || garmentsQuery.isLoading) {
    return <LoadingSkeleton cards={2} />;
  }

  const garments = garmentsQuery.data ?? [];
  const messages = messagesQuery.data ?? [];

  if (garments.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="AI Stylist"
          description="Personal styling recommendations grounded strictly in the clothes in your digital wardrobe."
        />
        <EmptyState
          icon={Shirt}
          title="Add garments so your stylist can build outfits"
          description="Your AI Stylist creates looks exclusively from items you own. Upload a few pieces first."
          action={
            <Button asChild>
              <Link to="/app/wardrobe/upload">Upload clothes</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Stylist"
        description={`Grounded in your ${garments.length} catalogued garments. Recommendations are simulated locally in demo mode via stylistService.sendMessage().`}
      />

      {/* Context Controls */}
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-ink-subtle">Style focus:</span>
          {STYLE_CHIPS.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setSelectedStyle(style)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                selectedStyle === style
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-border bg-surface text-ink-muted hover:bg-surface-muted',
              )}
            >
              {style}
            </button>
          ))}
        </div>

        <Select value={occasion} onValueChange={setOccasion}>
          <SelectTrigger aria-label="Select occasion" className="w-full sm:w-[170px]">
            <SelectValue placeholder="Occasion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ANY">Any occasion</SelectItem>
            <SelectItem value="Office">Office</SelectItem>
            <SelectItem value="Party">Party / Dinner</SelectItem>
            <SelectItem value="Casual">Casual</SelectItem>
            <SelectItem value="Wedding">Wedding / Festive</SelectItem>
            <SelectItem value="Travel">Travel</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {/* Transcript */}
      <Card className="flex flex-col overflow-hidden">
        <div className="max-h-[520px] min-h-[320px] space-y-4 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="py-12 text-center text-sm text-ink-muted">
              Ask a styling question or tap one of the prompt chips below to get started.
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex flex-col gap-3',
                  msg.role === 'user' ? 'items-end' : 'items-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-accent text-white'
                      : 'border border-border bg-surface-muted/50 text-ink',
                  )}
                >
                  {msg.content}
                </div>

                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                    {msg.recommendations.map((rec) => {
                      const recGarments = rec.garmentIds
                        .map((id) => garments.find((g) => g.id === id))
                        .filter((g): g is Garment => Boolean(g));
                      return (
                        <Card key={rec.id} className="p-4 space-y-3 bg-surface">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-semibold text-ink">{rec.title}</h4>
                              <p className="mt-0.5 text-xs text-ink-muted">{rec.rationale}</p>
                            </div>
                            <TagBadge label={rec.occasion} tone="sage" />
                          </div>

                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {recGarments.map((g) => (
                              <div
                                key={g.id}
                                className="flex w-20 shrink-0 flex-col items-center rounded-xl border border-border bg-surface-muted/35 p-1.5"
                              >
                                <ImageWithFallback
                                  src={g.imageUrl}
                                  alt={g.name}
                                  className="h-14 w-14 object-contain"
                                />
                                <span className="mt-1 w-full truncate text-center text-[10px] text-ink-muted">
                                  {g.name}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                              size="sm"
                              onClick={() => handleOpenInStudio(rec)}
                              className="flex-1"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              Open in Outfit Studio
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={saveSuggestionMutation.isPending}
                              onClick={() => saveSuggestionMutation.mutate(rec)}
                            >
                              <BookmarkPlus className="h-3.5 w-3.5" />
                              Save suggestion
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}

          {sendMutation.isPending && (
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              <span>Stylist is reviewing your wardrobe pairings...</span>
            </div>
          )}
        </div>

        {/* Prompt Chips + Input */}
        <div className="border-t border-border bg-surface-muted/30 p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {PROMPT_SUGGESTIONS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={sendMutation.isPending}
                onClick={() => sendMutation.mutate(prompt)}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-accent/50 hover:text-ink"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for an outfit idea (e.g. Friday client lunch, rainy commute)..."
              aria-label="Message AI Stylist"
              disabled={sendMutation.isPending}
            />
            <Button type="submit" disabled={!input.trim() || sendMutation.isPending}>
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
