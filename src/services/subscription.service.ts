import { SUBSCRIPTION_PLANS } from '@/config/brand.config';
import { delay, mockDb } from '@/mocks/mock-db';
import { httpRequest } from '@/services/http-client';
import { USE_MOCK_API } from '@/services/service-config';
import type { CreditUsageEntry, SubscriptionPlanId, SubscriptionSummary } from '@/types';

export const subscriptionService = {
  async getSummary(): Promise<{
    summary: SubscriptionSummary;
    history: CreditUsageEntry[];
  }> {
    if (!USE_MOCK_API) {
      return httpRequest<{ summary: SubscriptionSummary; history: CreditUsageEntry[] }>(
        '/api/subscription',
      );
    }
    await delay(160);
    return {
      summary: { ...mockDb.subscription },
      history: [...mockDb.creditHistory],
    };
  },

  async changePlan(planId: SubscriptionPlanId): Promise<{
    summary: SubscriptionSummary;
    history: CreditUsageEntry[];
  }> {
    if (!USE_MOCK_API) {
      return httpRequest<{ summary: SubscriptionSummary; history: CreditUsageEntry[] }>(
        '/api/subscription/plan',
        { method: 'POST', body: { planId } },
      );
    }
    await delay(420);
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId) ?? SUBSCRIPTION_PLANS[0];
    const nextSummary: SubscriptionSummary = {
      plan: plan.id,
      creditsIncluded: plan.monthlyCredits,
      creditsRemaining: plan.monthlyCredits,
      renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
    };
    mockDb.subscription = nextSummary;
    if (mockDb.user) {
      mockDb.user = { ...mockDb.user, plan: plan.id };
    }
    mockDb.creditHistory.unshift({
      id: `crd_${Date.now()}`,
      action: `Switched to ${plan.name} plan (Demo)`,
      creditsDelta: plan.monthlyCredits,
      balanceAfter: plan.monthlyCredits,
      createdAt: new Date().toISOString(),
      referenceLabel: 'Demo Checkout',
    });
    return {
      summary: { ...mockDb.subscription },
      history: [...mockDb.creditHistory],
    };
  },

  async purchaseTopUpPack(credits = 20): Promise<{
    summary: SubscriptionSummary;
    history: CreditUsageEntry[];
  }> {
    if (!USE_MOCK_API) {
      return httpRequest<{ summary: SubscriptionSummary; history: CreditUsageEntry[] }>(
        '/api/subscription/credits',
        { method: 'POST', body: { credits } },
      );
    }
    await delay(350);
    mockDb.subscription.creditsRemaining += credits;
    mockDb.creditHistory.unshift({
      id: `crd_${Date.now()}`,
      action: `Added ${credits} top-up credits (Demo)`,
      creditsDelta: credits,
      balanceAfter: mockDb.subscription.creditsRemaining,
      createdAt: new Date().toISOString(),
      referenceLabel: 'Demo Top-up',
    });
    return {
      summary: { ...mockDb.subscription },
      history: [...mockDb.creditHistory],
    };
  },
};
