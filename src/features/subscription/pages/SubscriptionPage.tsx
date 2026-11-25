import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Info, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { CREDIT_RULES, SUBSCRIPTION_PLANS } from '@/config/brand.config';
import { subscriptionService } from '@/services/subscription.service';
import { formatCurrencyInr, formatShortDate } from '@/lib/format';
import type { SubscriptionPlanId } from '@/types';

export default function SubscriptionPage() {
  const qc = useQueryClient();
  const [pendingPlan, setPendingPlan] = useState<SubscriptionPlanId | null>(null);

  const subQuery = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionService.getSummary(),
  });

  const changePlanMutation = useMutation({
    mutationFn: (planId: SubscriptionPlanId) => subscriptionService.changePlan(planId),
    onSuccess: (res) => {
      qc.setQueryData(['subscription'], res);
      void qc.invalidateQueries({ queryKey: ['auth'] });
      setPendingPlan(null);
      toast.success(`Switched to ${res.summary.plan} plan (Demo mode)`);
    },
  });

  const topUpMutation = useMutation({
    mutationFn: () => subscriptionService.purchaseTopUpPack(20),
    onSuccess: (res) => {
      qc.setQueryData(['subscription'], res);
      toast.success('Added 20 demo AI credits');
    },
  });

  if (subQuery.isLoading || !subQuery.data) {
    return <LoadingSkeleton cards={3} />;
  }

  const { summary, history } = subQuery.data;
  const usagePct =
    summary.creditsIncluded > 0
      ? Math.min(100, Math.round((summary.creditsRemaining / summary.creditsIncluded) * 100))
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription & Credits"
        description="Manage your studio tier, monitor monthly AI generation credits, and review credit usage."
      />

      {/* Demo mode notice */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-warning/30 bg-warning-soft/60 p-4 text-xs text-warning">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <strong>Payments are in demo mode.</strong> Plan pricing (configured in{' '}
          <code>brand.config.ts</code>) and checkout actions simulate billing changes locally until a payment gateway is connected.
        </p>
      </div>

      {/* Current Plan & Credit Usage */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="p-6 lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                Current Plan
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-ink">{summary.plan}</h3>
            </div>
            <Badge variant="sage">{summary.status}</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">Remaining AI credits</span>
              <span className="font-semibold text-ink">
                {summary.creditsRemaining} / {summary.creditsIncluded}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${usagePct}%` }}
              />
            </div>
            {summary.renewsAt && (
              <p className="text-xs text-ink-subtle">
                Next credit refresh: {formatShortDate(summary.renewsAt)}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => topUpMutation.mutate()}
              disabled={topUpMutation.isPending}
            >
              <Sparkles className="h-4 w-4 text-accent" />
              {topUpMutation.isPending ? 'Adding...' : 'Add +20 demo credits'}
            </Button>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-5 space-y-3">
          <h3 className="text-sm font-semibold text-ink">Credit Rules (Configurable Mock Rules)</h3>
          <ul className="space-y-2 text-sm text-ink-muted">
            <li className="flex justify-between border-b border-border pb-2">
              <span>Outfit Studio try-on</span>
              <span className="font-semibold text-ink">{CREDIT_RULES.tryOnGenerationCost} credit</span>
            </li>
            <li className="flex justify-between border-b border-border pb-2">
              <span>Avatar Studio generation</span>
              <span className="font-semibold text-ink">{CREDIT_RULES.avatarGenerationCost} credits</span>
            </li>
            <li className="flex justify-between border-b border-border pb-2">
              <span>Garment upload & cleanup</span>
              <span className="font-semibold text-sage-foreground">Free ({CREDIT_RULES.garmentProcessingCost})</span>
            </li>
            <li className="flex justify-between">
              <span>AI Stylist conversation</span>
              <span className="font-semibold text-sage-foreground">Free ({CREDIT_RULES.stylistChatCost})</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = plan.id === summary.plan;
          return (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between p-6 ${
                plan.highlighted ? 'border-accent ring-1 ring-accent/30' : ''
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
                  {isCurrent && <Badge variant="sage">Current</Badge>}
                </div>
                <p className="text-sm text-ink-muted">{plan.tagline}</p>
                <p className="text-3xl font-semibold text-ink">
                  {formatCurrencyInr(plan.monthlyPriceInr)}
                  <span className="text-sm font-normal text-ink-muted"> / month</span>
                </p>
                <ul className="space-y-2 pt-2">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-ink-muted">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className="mt-6 w-full"
                variant={isCurrent ? 'secondary' : plan.highlighted ? 'default' : 'outline'}
                disabled={isCurrent}
                onClick={() => setPendingPlan(plan.id)}
              >
                {isCurrent ? 'Active plan' : `Switch to ${plan.name}`}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Credit Usage History */}
      <Card className="p-5 space-y-4">
        <h3 className="text-base font-semibold text-ink">Credit Usage History</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-subtle">
                <th className="py-2.5 pr-4 font-medium">Action</th>
                <th className="py-2.5 pr-4 font-medium">Reference</th>
                <th className="py-2.5 pr-4 font-medium">Date</th>
                <th className="py-2.5 pr-4 font-medium text-right">Credits</th>
                <th className="py-2.5 font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.map((entry) => (
                <tr key={entry.id}>
                  <td className="py-3 pr-4 font-medium text-ink">{entry.action}</td>
                  <td className="py-3 pr-4 text-ink-muted">{entry.referenceLabel ?? '—'}</td>
                  <td className="py-3 pr-4 text-ink-muted">{formatShortDate(entry.createdAt)}</td>
                  <td
                    className={`py-3 pr-4 text-right font-semibold ${
                      entry.creditsDelta > 0 ? 'text-sage-foreground' : 'text-ink'
                    }`}
                  >
                    {entry.creditsDelta > 0 ? `+${entry.creditsDelta}` : entry.creditsDelta}
                  </td>
                  <td className="py-3 text-right text-ink-muted">{entry.balanceAfter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(pendingPlan)}
        onOpenChange={(open) => !open && setPendingPlan(null)}
        title={`Confirm ${pendingPlan ?? ''} plan change (Demo)`}
        description="This simulates a subscription tier change in demo mode and resets your monthly mock credit balance to the selected plan allowance."
        confirmLabel="Confirm demo switch"
        isLoading={changePlanMutation.isPending}
        onConfirm={async () => {
          if (pendingPlan) {
            await changePlanMutation.mutateAsync(pendingPlan);
          }
        }}
      />
    </div>
  );
}
