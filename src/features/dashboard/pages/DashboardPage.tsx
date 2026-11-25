import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Layers,
  MessageSquareText,
  Plus,
  Shirt,
  Sparkles,
  UserCheck,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/common/StatCard';
import { SectionHeader } from '@/components/common/SectionHeader';
import { TagBadge } from '@/components/common/TagBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useCurrentUser } from '@/hooks/useAuth';
import { wardrobeService } from '@/services/wardrobe.service';
import { outfitService } from '@/services/outfit.service';
import { avatarService } from '@/services/avatar.service';
import { subscriptionService } from '@/services/subscription.service';
import { CATEGORY_SINGULAR, formatShortDate, getGreetingByHour } from '@/lib/format';

export default function DashboardPage() {
  const { data: user } = useCurrentUser();

  const garmentsQuery = useQuery({
    queryKey: ['wardrobe', 'items'],
    queryFn: () => wardrobeService.listItems(),
  });
  const outfitsQuery = useQuery({
    queryKey: ['outfits'],
    queryFn: () => outfitService.listOutfits(),
  });
  const avatarQuery = useQuery({
    queryKey: ['avatar'],
    queryFn: () => avatarService.getAvatar(),
  });
  const subscriptionQuery = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionService.getSummary(),
  });

  if (
    garmentsQuery.isLoading ||
    outfitsQuery.isLoading ||
    avatarQuery.isLoading ||
    subscriptionQuery.isLoading
  ) {
    return <LoadingSkeleton />;
  }

  if (garmentsQuery.isError || outfitsQuery.isError) {
    return (
      <ErrorState
        message="Unable to load your studio summary right now."
        onRetry={() => {
          void garmentsQuery.refetch();
          void outfitsQuery.refetch();
        }}
      />
    );
  }

  const garments = garmentsQuery.data ?? [];
  const outfits = outfitsQuery.data ?? [];
  const avatar = avatarQuery.data;
  const sub = subscriptionQuery.data?.summary;
  const creditHistory = subscriptionQuery.data?.history ?? [];

  const firstName = user?.name.split(' ')[0] ?? 'there';
  const isNewAccount = garments.length === 0 && outfits.length === 0;
  const tryOnsThisMonth = creditHistory.filter((h) => h.action.toLowerCase().includes('try-on')).length + 6;
  const featuredOutfit = outfits[0];

  const unwornShoes = garments.filter((g) => g.category === 'FOOTWEAR' && g.wearCount <= 2).length;
  const unwornOuterwear = garments.filter(
    (g) => g.category === 'OUTERWEAR' && g.wearCount === 0,
  ).length;

  return (
    <div className="space-y-8">
      {/* Greeting + Primary CTAs */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Personal Styling Studio
          </p>
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            {getGreetingByHour()}, {firstName}
          </h2>
          <p className="text-sm text-ink-muted">
            {isNewAccount
              ? 'Your digital closet is ready. Upload your first clothes and create your studio avatar.'
              : `You have ${garments.length} catalogued pieces and ${outfits.length} saved outfits ready to mix.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link to="/app/outfit-studio">
              <Sparkles className="h-4 w-4" />
              Create an outfit
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/app/wardrobe/upload">
              <Plus className="h-4 w-4" />
              Add clothes
            </Link>
          </Button>
        </div>
      </div>

      {/* Above-the-fold Avatar Card + 4 Summary Cards */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="flex flex-col justify-between p-5 lg:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                Your AI Avatar
              </p>
              <h3 className="mt-1 text-lg font-semibold text-ink">
                {avatar?.status === 'READY' ? 'Studio Avatar Active' : 'Avatar Setup Pending'}
              </h3>
            </div>
            <StatusBadge status={avatar?.status ?? 'NOT_STARTED'} />
          </div>

          <div className="my-4 flex items-center justify-center overflow-hidden rounded-xl bg-surface-muted/60 p-3">
            {avatar?.avatarImageUrl ? (
              <ImageWithFallback
                src={avatar.avatarImageUrl}
                alt="Your personal AI avatar"
                className="h-56 w-auto object-contain"
              />
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-2 text-center px-4">
                <UserCheck className="h-8 w-8 text-ink-subtle" />
                <p className="text-xs text-ink-muted">
                  Upload a face & full-body photo to generate your avatar for Outfit Studio.
                </p>
              </div>
            )}
          </div>

          <Button asChild variant="secondary" className="w-full">
            <Link to="/app/avatar">
              {avatar?.status === 'READY' ? 'View / Regenerate avatar' : 'Create avatar'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
          <StatCard
            label="Total Items"
            value={garments.length}
            helper={
              garments.length === 0
                ? 'Start by uploading a few staples'
                : `${garments.filter((g) => g.favorite).length} favorited garments`
            }
            icon={Shirt}
          />
          <StatCard
            label="Saved Outfits"
            value={outfits.length}
            helper={
              outfits.length === 0
                ? 'Combine pieces in Outfit Studio'
                : `${outfits.filter((o) => o.favorite).length} favorite combinations`
            }
            icon={Layers}
            tone="sage"
          />
          <StatCard
            label="AI Try-ons This Month"
            value={isNewAccount ? 0 : tryOnsThisMonth}
            helper="Simulated demo studio count"
            icon={Wand2}
          />
          <StatCard
            label="Remaining Credits"
            value={sub?.creditsRemaining ?? 0}
            helper={`${sub?.plan ?? 'FREE'} plan (${sub?.creditsIncluded ?? 10} / mo)`}
            icon={Sparkles}
            tone="accent"
          />

          {/* Quick Actions + Wardrobe Insight Strip */}
          <Card className="p-5 sm:col-span-2 flex flex-col justify-between gap-4 bg-surface-muted/40">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-sage-foreground">
                  Wardrobe Insight (Mock Data)
                </p>
                <p className="mt-1 text-sm text-ink">
                  {isNewAccount
                    ? 'Once you upload at least 4–6 garments, we will surface styling gaps and unworn pieces here.'
                    : `You have ${unwornShoes} lightly worn footwear options and ${unwornOuterwear} outerwear pieces you haven’t styled in an outfit yet.`}
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link to="/app/analytics">View analytics</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-border pt-3">
              <Button asChild size="sm" variant="secondary">
                <Link to="/app/wardrobe/upload">Upload clothes</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link to="/app/outfit-studio">Generate outfit</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link to="/app/avatar">Update avatar</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link to="/app/stylist">
                  <MessageSquareText className="h-3.5 w-3.5" />
                  Ask AI Stylist
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {isNewAccount ? (
        <EmptyState
          icon={Shirt}
          title="Your wardrobe is waiting"
          description="Upload photos of your shirts, trousers, shoes, or traditional wear to unlock Outfit Studio try-ons and AI Stylist suggestions."
          action={
            <>
              <Button asChild>
                <Link to="/app/wardrobe/upload">Upload your first items</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/app/avatar">Set up your avatar</Link>
              </Button>
            </>
          }
        />
      ) : (
        <>
          {/* Outfit of the Day + Recently Created Outfits */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {featuredOutfit && (
              <Card className="overflow-hidden p-5 lg:col-span-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                      Outfit of the Day
                    </span>
                    <span className="text-xs text-ink-subtle">
                      {featuredOutfit.garmentIds.length} pieces
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-xl bg-surface-muted/60 p-3">
                    <ImageWithFallback
                      src={featuredOutfit.generatedImageUrl}
                      alt={featuredOutfit.name}
                      className="mx-auto h-64 w-auto object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{featuredOutfit.name}</h3>
                    {featuredOutfit.description && (
                      <p className="mt-1 text-sm text-ink-muted">{featuredOutfit.description}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {featuredOutfit.tags.map((tag) => (
                      <TagBadge key={tag} label={tag} />
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <Button asChild className="flex-1">
                    <Link to={`/app/outfits/${featuredOutfit.id}`}>View outfit</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/app/outfit-studio">Remix</Link>
                  </Button>
                </div>
              </Card>
            )}

            <div className="space-y-4 lg:col-span-7">
              <SectionHeader
                title="Recently created outfits"
                description="Saved looks ready to wear or schedule"
                action={
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/app/outfits">View all</Link>
                  </Button>
                }
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {outfits.slice(0, 4).map((outfit) => (
                  <Link
                    key={outfit.id}
                    to={`/app/outfits/${outfit.id}`}
                    className="group rounded-2xl border border-border bg-surface p-3.5 shadow-card transition-all hover:border-accent/40 hover:shadow-elevated"
                  >
                    <div className="flex items-center gap-3.5">
                      <ImageWithFallback
                        src={outfit.generatedImageUrl}
                        alt={outfit.name}
                        className="h-24 w-20 shrink-0 rounded-xl bg-surface-muted/60 object-contain p-1"
                      />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <h4 className="truncate text-sm font-semibold text-ink group-hover:text-accent">
                          {outfit.name}
                        </h4>
                        <p className="text-xs text-ink-muted">
                          {outfit.garmentIds.length} items · {formatShortDate(outfit.createdAt)}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {outfit.tags.slice(0, 2).map((tag) => (
                            <TagBadge key={tag} label={tag} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recently Added Garments */}
          <div className="space-y-4">
            <SectionHeader
              title="Recently added to your wardrobe"
              description="Latest pieces catalogued in your studio"
              action={
                <Button asChild variant="ghost" size="sm">
                  <Link to="/app/wardrobe">Browse wardrobe</Link>
                </Button>
              }
            />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {garments.slice(0, 6).map((item) => (
                <Link
                  key={item.id}
                  to={`/app/wardrobe/${item.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface p-3 shadow-card transition-all hover:border-accent/40 hover:shadow-elevated"
                >
                  <div className="aspect-[4/4.2] w-full overflow-hidden rounded-xl bg-surface-muted/50">
                    <ImageWithFallback
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-contain p-1 transition-transform group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-2.5 space-y-1">
                    <p className="truncate text-xs font-semibold text-ink">{item.name}</p>
                    <p className="truncate text-[11px] text-ink-muted">
                      {CATEGORY_SINGULAR[item.category]} · {formatShortDate(item.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
