import { useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { FormDialog } from '@/components/common/FormDialog';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { TagBadge } from '@/components/common/TagBadge';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { calendarService } from '@/services/calendar.service';
import { outfitService } from '@/services/outfit.service';
import { cn } from '@/lib/cn';
import type { CalendarOutfitPlan } from '@/types';

const OCCASION_OPTIONS = ['Office', 'Party', 'Travel', 'Wedding', 'Casual', 'Other'];

export default function CalendarPage() {
  const qc = useQueryClient();
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [cursorDate, setCursorDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CalendarOutfitPlan | null>(null);
  const [formOutfitId, setFormOutfitId] = useState('');
  const [formOccasion, setFormOccasion] = useState('Office');
  const [formNotes, setFormNotes] = useState('');

  const plansQuery = useQuery({
    queryKey: ['calendar', 'plans'],
    queryFn: () => calendarService.listPlans(),
  });
  const outfitsQuery = useQuery({
    queryKey: ['outfits'],
    queryFn: () => outfitService.listOutfits(),
  });

  const savePlanMutation = useMutation({
    mutationFn: async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      if (editingPlan) {
        return calendarService.updatePlan(editingPlan.id, {
          outfitId: formOutfitId,
          occasion: formOccasion,
          notes: formNotes.trim() || undefined,
        });
      }
      return calendarService.savePlan({
        date: dateStr,
        outfitId: formOutfitId,
        occasion: formOccasion,
        notes: formNotes.trim() || undefined,
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['calendar'] });
      setDialogOpen(false);
      toast.success(editingPlan ? 'Planned outfit updated' : 'Outfit added to calendar');
    },
  });

  const removePlanMutation = useMutation({
    mutationFn: (id: string) => calendarService.removePlan(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['calendar'] });
      toast.success('Removed outfit from date');
    },
  });

  const plans = plansQuery.data ?? [];
  const outfits = outfitsQuery.data ?? [];

  const daysToDisplay = useMemo(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(cursorDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    const monthStart = startOfMonth(cursorDate);
    const monthEnd = endOfMonth(cursorDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days: Date[] = [];
    let d = gridStart;
    while (d <= gridEnd) {
      days.push(d);
      d = addDays(d, 1);
    }
    return days;
  }, [cursorDate, viewMode]);

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayPlans = plans.filter((p) => p.date === selectedDateKey);

  const openAddDialog = () => {
    setEditingPlan(null);
    setFormOutfitId(outfits[0]?.id ?? '');
    setFormOccasion('Office');
    setFormNotes('');
    setDialogOpen(true);
  };

  const openEditDialog = (plan: CalendarOutfitPlan) => {
    setEditingPlan(plan);
    setFormOutfitId(plan.outfitId);
    setFormOccasion(plan.occasion);
    setFormNotes(plan.notes ?? '');
    setDialogOpen(true);
  };

  const navigatePeriod = (dir: -1 | 1) => {
    if (viewMode === 'week') {
      setCursorDate((d) => addDays(d, dir * 7));
    } else {
      setCursorDate((d) => (dir === -1 ? subMonths(d, 1) : addMonths(d, 1)));
    }
  };

  if (plansQuery.isLoading || outfitsQuery.isLoading) {
    return <LoadingSkeleton cards={2} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outfit Calendar"
        description="Plan looks ahead for office days, travel itineraries, dinners, and weddings."
        actions={
          <Button onClick={openAddDialog} disabled={outfits.length === 0}>
            <Plus className="h-4 w-4" />
            Plan outfit for {format(selectedDate, 'MMM d')}
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous period"
            onClick={() => navigatePeriod(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="min-w-[160px] text-center text-base font-semibold text-ink">
            {format(cursorDate, 'MMMM yyyy')}
          </h3>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next period"
            onClick={() => navigatePeriod(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const today = new Date();
              setCursorDate(today);
              setSelectedDate(today);
            }}
          >
            Today
          </Button>
        </div>

        <div className="inline-flex rounded-xl border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium',
              viewMode === 'month' ? 'bg-accent text-white' : 'text-ink-muted',
            )}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium',
              viewMode === 'week' ? 'bg-accent text-white' : 'text-ink-muted',
            )}
          >
            Week
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Calendar Grid */}
        <Card className="p-4 lg:col-span-8 overflow-hidden">
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wider text-ink-subtle pb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {daysToDisplay.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayPlans = plans.filter((p) => p.date === key);
              const isSelected = isSameDay(day, selectedDate);
              const inMonth = isSameMonth(day, cursorDate);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'flex min-h-[72px] sm:min-h-[92px] flex-col items-start justify-between rounded-xl border p-1.5 sm:p-2 text-left transition-colors',
                    isSelected
                      ? 'border-accent bg-accent-soft/35'
                      : 'border-border bg-surface hover:bg-surface-muted/50',
                    !inMonth && viewMode === 'month' && 'opacity-45',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                      isToday ? 'bg-accent text-white' : 'text-ink',
                    )}
                  >
                    {format(day, 'd')}
                  </span>

                  <div className="w-full space-y-1">
                    {dayPlans.slice(0, 2).map((plan) => {
                      const outfit = outfits.find((o) => o.id === plan.outfitId);
                      return (
                        <div
                          key={plan.id}
                          className="flex items-center gap-1 rounded-md bg-sage-soft px-1.5 py-0.5 text-[10px] font-medium text-sage-foreground"
                        >
                          <span className="truncate">{outfit?.name ?? plan.occasion}</span>
                        </div>
                      );
                    })}
                    {dayPlans.length > 2 && (
                      <span className="block text-[10px] text-ink-subtle">
                        +{dayPlans.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected Day Agenda */}
        <Card className="p-5 space-y-4 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">
                Day Plan
              </p>
              <h3 className="text-base font-semibold text-ink">
                {format(parseISO(selectedDateKey), 'EEEE, MMM d')}
              </h3>
            </div>
            <Button size="sm" variant="outline" onClick={openAddDialog} disabled={outfits.length === 0}>
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>

          {selectedDayPlans.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <CalendarDays className="mx-auto h-8 w-8 text-ink-subtle" />
              <p className="text-sm font-medium text-ink">No outfit scheduled</p>
              <p className="text-xs text-ink-muted">
                Assign a saved outfit to this date so getting ready is effortless.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayPlans.map((plan) => {
                const outfit = outfits.find((o) => o.id === plan.outfitId);
                return (
                  <div
                    key={plan.id}
                    className="rounded-xl border border-border bg-surface-muted/35 p-3 space-y-2.5"
                  >
                    <div className="flex items-start gap-3">
                      {outfit && (
                        <ImageWithFallback
                          src={outfit.generatedImageUrl}
                          alt={outfit.name}
                          className="h-20 w-16 shrink-0 rounded-lg bg-surface object-contain p-1"
                        />
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {outfit?.name ?? 'Saved outfit'}
                        </p>
                        <TagBadge label={plan.occasion} tone="sage" />
                        {plan.notes && <p className="text-xs text-ink-muted">{plan.notes}</p>}
                      </div>
                    </div>
                    <div className="flex justify-end gap-1.5 border-t border-border pt-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(plan)}>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger hover:text-danger"
                        onClick={() => removePlanMutation.mutate(plan.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingPlan ? 'Edit planned outfit' : `Assign outfit for ${format(selectedDate, 'MMM d, yyyy')}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!formOutfitId) return;
            void savePlanMutation.mutateAsync();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="cal-outfit">Saved outfit</Label>
            <Select value={formOutfitId} onValueChange={setFormOutfitId}>
              <SelectTrigger id="cal-outfit">
                <SelectValue placeholder="Choose outfit" />
              </SelectTrigger>
              <SelectContent>
                {outfits.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cal-occasion">Occasion</Label>
            <Select value={formOccasion} onValueChange={setFormOccasion}>
              <SelectTrigger id="cal-occasion">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OCCASION_OPTIONS.map((occ) => (
                  <SelectItem key={occ} value={occ}>
                    {occ}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cal-notes">Notes (optional)</Label>
            <Input
              id="cal-notes"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Client meeting, flight, dinner..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formOutfitId || savePlanMutation.isPending}>
              {savePlanMutation.isPending ? 'Saving...' : 'Save plan'}
            </Button>
          </div>
        </form>
      </FormDialog>
    </div>
  );
}
