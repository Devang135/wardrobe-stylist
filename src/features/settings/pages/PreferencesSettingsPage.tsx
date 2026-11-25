import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AUTH_QUERY_KEY, useCurrentUser } from '@/hooks/useAuth';
import { userService } from '@/services/user.service';
import { cn } from '@/lib/cn';

const STYLE_CHOICES = ['Minimal', 'Casual', 'Formal', 'Streetwear', 'Traditional', 'Sporty'];
const COLOR_CHOICES = ['Ivory', 'Charcoal', 'Navy', 'Olive', 'Terracotta', 'Sand', 'Espresso'];
const FIT_CHOICES = ['Tailored', 'Relaxed', 'Slim', 'Oversized'];
const SEASON_CHOICES = ['All-Season', 'Spring', 'Summer', 'Autumn', 'Winter'];

export default function PreferencesSettingsPage() {
  const qc = useQueryClient();
  const { data: user } = useCurrentUser();

  const [styles, setStyles] = useState<string[]>(user?.stylePreferences ?? ['Minimal']);
  const [colors, setColors] = useState<string[]>(user?.preferredColors ?? ['Ivory', 'Charcoal']);
  const [fits, setFits] = useState<string[]>(user?.preferredFits ?? ['Tailored']);
  const [seasons, setSeasons] = useState<string[]>(user?.preferredSeasons ?? ['All-Season']);
  const [units, setUnits] = useState<'METRIC' | 'IMPERIAL'>(user?.units ?? 'METRIC');

  const saveMutation = useMutation({
    mutationFn: () =>
      userService.updateProfile({
        stylePreferences: styles,
        preferredColors: colors,
        preferredFits: fits,
        preferredSeasons: seasons,
        units,
      }),
    onSuccess: (updated) => {
      qc.setQueryData(AUTH_QUERY_KEY, updated);
      toast.success('Styling preferences saved');
    },
  });

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((i) => i !== value) : [...list, value]);
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-base font-semibold text-ink">Styling Preferences</h3>
        <p className="text-xs text-ink-muted">
          These preferences tailor your AI Stylist suggestions and wardrobe filters.
        </p>
      </div>

      <div className="space-y-5">
        <ChipGroup label="Preferred Styles" options={STYLE_CHOICES} selected={styles} onToggle={(v) => toggle(styles, setStyles, v)} />
        <ChipGroup label="Favorite Color Palette" options={COLOR_CHOICES} selected={colors} onToggle={(v) => toggle(colors, setColors, v)} />
        <ChipGroup label="Preferred Fits" options={FIT_CHOICES} selected={fits} onToggle={(v) => toggle(fits, setFits, v)} />
        <ChipGroup label="Primary Seasons" options={SEASON_CHOICES} selected={seasons} onToggle={(v) => toggle(seasons, setSeasons, v)} />

        <div className="max-w-xs space-y-1.5">
          <Label htmlFor="pref-units">Measurement units</Label>
          <Select value={units} onValueChange={(v) => setUnits(v as 'METRIC' | 'IMPERIAL')}>
            <SelectTrigger id="pref-units">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="METRIC">Metric (cm / kg)</SelectItem>
              <SelectItem value="IMPERIAL">Imperial (in / lb)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving...' : 'Save preferences'}
        </Button>
      </div>
    </Card>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-ink">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-border bg-surface text-ink-muted hover:bg-surface-muted',
              )}
            >
              {active && <Check className="h-3 w-3" />}
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
