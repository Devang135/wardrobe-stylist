import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, Layers, Percent, Shirt } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/common/StatCard';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { analyticsService } from '@/services/analytics.service';
import { formatCurrencyInr } from '@/lib/format';
import { cn } from '@/lib/cn';

const CHART_COLORS = ['#B55D42', '#5B705A', '#344154', '#C9AE8B', '#7A6855', '#8FB0C9', '#A16207'];

export default function AnalyticsPage() {
  const [range, setRange] = useState<'30d' | '90d' | 'all'>('90d');

  const analyticsQuery = useQuery({
    queryKey: ['analytics', range],
    queryFn: () => analyticsService.getOverview(range),
  });

  if (analyticsQuery.isLoading) {
    return <LoadingSkeleton />;
  }

  if (analyticsQuery.isError || !analyticsQuery.data) {
    return (
      <ErrorState
        message="Unable to load wardrobe analytics."
        onRetry={() => void analyticsQuery.refetch()}
      />
    );
  }

  const data = analyticsQuery.data;

  if (data.activeItems === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Wardrobe Analytics"
          description="Utilization insights, category balance, and outfit activity derived from your wardrobe."
        />
        <EmptyState
          icon={BarChart3}
          title="No wardrobe analytics yet"
          description="Add garments and create outfits to see utilization and wear distribution charts."
        />
      </div>
    );
  }

  const topCategory = [...data.categoryBreakdown].sort((a, b) => b.count - a.count)[0];
  const neverWornCount = data.leastWornGarments.filter((g) => g.wearCount === 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wardrobe Analytics"
        description="Meaningful breakdowns computed directly from your seeded wardrobe items and saved outfits."
        actions={
          <div className="inline-flex rounded-xl border border-border bg-surface p-1">
            {[
              { id: '30d' as const, label: '30 days' },
              { id: '90d' as const, label: '90 days' },
              { id: 'all' as const, label: 'All time' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRange(opt.id)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  range === opt.id ? 'bg-accent text-white' : 'text-ink-muted hover:text-ink',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Items" value={data.activeItems} helper={`${data.archivedItems} archived`} icon={Shirt} />
        <StatCard label="Saved Outfits" value={data.totalOutfits} icon={Layers} tone="sage" />
        <StatCard
          label="Wardrobe Utilization"
          value={`${data.utilizationRate}%`}
          helper="Active items with 1+ logged wears"
          icon={Percent}
          tone="accent"
        />
        <StatCard
          label="Never-Worn Watchlist"
          value={neverWornCount}
          helper="Items awaiting their first outfit"
          icon={BarChart3}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Breakdown */}
        <Card className="p-5 space-y-3">
          <div>
            <h3 className="text-base font-semibold text-ink">Items by Category</h3>
            <p className="text-xs text-ink-muted">
              {topCategory
                ? `${topCategory.label} is your largest group (${topCategory.count} active items).`
                : 'Distribution across categories.'}
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryBreakdown} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E0D6" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#57534E' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#57534E' }} />
                <Tooltip />
                <Bar dataKey="count" name="Items" fill="#B55D42" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Saved Outfits by Occasion */}
        <Card className="p-5 space-y-3">
          <div>
            <h3 className="text-base font-semibold text-ink">Saved Outfits by Occasion</h3>
            <p className="text-xs text-ink-muted">
              Balance of your {data.totalOutfits} saved looks across daily, office, party, and festive needs.
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.outfitsByOccasion}
                  dataKey="count"
                  nameKey="occasion"
                  innerRadius={52}
                  outerRadius={84}
                  paddingAngle={3}
                >
                  {data.outfitsByOccasion.map((entry, idx) => (
                    <Cell key={entry.occasion} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Generation Activity Over Time */}
        <Card className="p-5 space-y-3 lg:col-span-2">
          <div>
            <h3 className="text-base font-semibold text-ink">Outfit Studio Activity Over Time</h3>
            <p className="text-xs text-ink-muted">
              Comparison of simulated try-on previews vs. looks saved to your lookbook ({range}).
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.generationActivity} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E0D6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#57534E' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#57534E' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="tryOns"
                  name="Try-ons"
                  stroke="#B55D42"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="savedOutfits"
                  name="Saved Outfits"
                  stroke="#5B705A"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Most-worn, Least-worn, Cost-per-wear */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-semibold text-ink">Most-Worn Staples</h3>
          <div className="space-y-2.5">
            {data.mostWornGarments.map((g) => (
              <Link
                key={g.id}
                to={`/app/wardrobe/${g.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-2 hover:bg-surface-muted/50"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <ImageWithFallback
                    src={g.imageUrl}
                    alt={g.name}
                    className="h-10 w-10 rounded-lg bg-surface-muted/40 object-contain"
                  />
                  <span className="truncate text-xs font-medium text-ink">{g.name}</span>
                </div>
                <span className="shrink-0 text-xs font-semibold text-sage-foreground">
                  {g.wearCount} wears
                </span>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-semibold text-ink">Least-Worn / Never-Worn</h3>
          <div className="space-y-2.5">
            {data.leastWornGarments.map((g) => (
              <Link
                key={g.id}
                to={`/app/wardrobe/${g.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-2 hover:bg-surface-muted/50"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <ImageWithFallback
                    src={g.imageUrl}
                    alt={g.name}
                    className="h-10 w-10 rounded-lg bg-surface-muted/40 object-contain"
                  />
                  <span className="truncate text-xs font-medium text-ink">{g.name}</span>
                </div>
                <span className="shrink-0 text-xs font-medium text-accent">
                  {g.wearCount} wears
                </span>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-ink">Best Cost-Per-Wear (Mock Prices)</h3>
            <p className="text-[11px] text-ink-subtle">Calculated from mock purchase price ÷ wear count</p>
          </div>
          <div className="space-y-2.5">
            {data.costPerWearLeaders.map((item) => (
              <Link
                key={item.garmentId}
                to={`/app/wardrobe/${item.garmentId}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-2.5 hover:bg-surface-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-ink">{item.name}</p>
                  <p className="text-[11px] text-ink-subtle">
                    {formatCurrencyInr(item.purchasePriceInr)} · {item.wearCount} wears
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-ink">
                  {formatCurrencyInr(item.costPerWearInr)}/wear
                </span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
