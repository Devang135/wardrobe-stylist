import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Sparkles, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { BRAND_CONFIG } from '@/config/brand.config';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentUser, AUTH_QUERY_KEY } from '@/hooks/useAuth';
import { userService } from '@/services/user.service';
import { cn } from '@/lib/cn';

const STYLE_OPTIONS = [
  'Minimal',
  'Casual',
  'Formal',
  'Streetwear',
  'Traditional',
  'Sporty',
  'Experimental',
];

const OCCASION_OPTIONS = [
  'Office',
  'College',
  'Daily',
  'Party',
  'Wedding',
  'Travel',
  'Fitness',
  'Other',
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: user } = useCurrentUser();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name ?? 'Alex Sharma');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    user?.stylePreferences?.length ? user.stylePreferences : ['Minimal', 'Casual'],
  );
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(
    user?.commonOccasions?.length ? user.commonOccasions : ['Office', 'Daily'],
  );

  const saveMutation = useMutation({
    mutationFn: () =>
      userService.updateProfile({
        name: name.trim() || user?.name || 'Alex',
        stylePreferences: selectedStyles,
        commonOccasions: selectedOccasions,
        onboardingCompleted: true,
      }),
    onSuccess: (updated) => {
      qc.setQueryData(AUTH_QUERY_KEY, updated);
    },
  });

  const toggleItem = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((i) => i !== value) : [...list, value]);
  };

  const handleComplete = async (destination: '/app/dashboard' | '/app/avatar') => {
    await saveMutation.mutateAsync();
    toast.success('Preferences saved to your studio');
    navigate(destination, { replace: true });
  };

  return (
    <div className="min-h-screen bg-canvas px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent font-display text-lg font-semibold text-white">
              {BRAND_CONFIG.shortMark}
            </span>
            <span className="text-sm font-semibold text-ink">{BRAND_CONFIG.appName}</span>
          </div>
          <span className="text-xs font-medium text-ink-muted">Step {step} of 5</span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        <Card className="p-6 sm:p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h1 className="font-display text-3xl font-semibold text-ink">
                  Welcome to your personal studio
                </h1>
                <p className="text-sm text-ink-muted">
                  Let’s personalize your digital wardrobe experience in less than a minute.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="onboarding-name">How should we greet you?</Label>
                <Input
                  id="onboarding-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h1 className="font-display text-3xl font-semibold text-ink">
                  Which styles feel most like you?
                </h1>
                <p className="text-sm text-ink-muted">Select one or more aesthetics for AI Stylist suggestions.</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {STYLE_OPTIONS.map((style) => {
                  const active = selectedStyles.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleItem(selectedStyles, setSelectedStyles, style)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'border-accent bg-accent-soft text-accent'
                          : 'border-border bg-surface text-ink-muted hover:bg-surface-muted',
                      )}
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                      <span>{style}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h1 className="font-display text-3xl font-semibold text-ink">
                  What occasions do you dress for?
                </h1>
                <p className="text-sm text-ink-muted">We’ll prioritize tags and calendar presets around these.</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {OCCASION_OPTIONS.map((occ) => {
                  const active = selectedOccasions.includes(occ);
                  return (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => toggleItem(selectedOccasions, setSelectedOccasions, occ)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'border-sage bg-sage-soft text-sage-foreground'
                          : 'border-border bg-surface text-ink-muted hover:bg-surface-muted',
                      )}
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                      <span>{occ}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <UserCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h1 className="font-display text-3xl font-semibold text-ink">
                  Create your AI avatar
                </h1>
                <p className="text-sm text-ink-muted">
                  A face photo and full-body reference photo unlock virtual try-on previews in Outfit Studio. You can set it up right after finishing or do it later.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => void handleComplete('/app/avatar')}
                  disabled={saveMutation.isPending}
                >
                  Create my avatar now
                </Button>
                <Button type="button" variant="outline" onClick={() => setStep(5)}>
                  I’ll do this later
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-soft text-sage-foreground">
                <Sparkles className="h-7 w-7" />
              </div>
              <h1 className="font-display text-3xl font-semibold text-ink">Your studio is ready</h1>
              <p className="mx-auto max-w-md text-sm text-ink-muted">
                We saved {selectedStyles.length} style preferences and {selectedOccasions.length} occasions. Head to your dashboard to start building outfits.
              </p>
              <Button
                size="lg"
                onClick={() => void handleComplete('/app/dashboard')}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? 'Opening dashboard...' : 'Open Dashboard'}
              </Button>
            </div>
          )}

          {step < 5 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
              >
                Back
              </Button>
              <div className="flex items-center gap-2">
                {step > 1 && step < 4 && (
                  <Button type="button" variant="ghost" onClick={() => setStep((s) => s + 1)}>
                    Skip
                  </Button>
                )}
                {step < 4 && (
                  <Button type="button" onClick={() => setStep((s) => s + 1)}>
                    Continue
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
