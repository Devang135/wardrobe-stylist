import type { SubscriptionPlanId } from '@/types';

export interface PlanConfig {
  id: SubscriptionPlanId;
  name: string;
  tagline: string;
  /** Configurable demo pricing in INR */
  monthlyPriceInr: number;
  monthlyCredits: number;
  maxWardrobeItems: number | 'UNLIMITED';
  features: string[];
  highlighted?: boolean;
}

/**
 * Central brand, theme, credit-rule, and demo-pricing configuration.
 * Edit this file to rebrand or adjust plan limits across the entire app.
 */
export const BRAND_CONFIG = {
  appName: 'Wardrobe AI',
  shortMark: 'W',
  tagline: 'Personal Styling Studio',
  supportEmail: 'hello@wardrobe-studio.example',
  demoBannerText:
    'Demo mode active — AI generation, image cleanup, email links, and payments are simulated via local mock services.',
  disclaimerText:
    'AI previews are illustrative and may not reproduce exact fit, fabric or details.',
} as const;

export const CREDIT_RULES = {
  avatarGenerationCost: 2,
  tryOnGenerationCost: 1,
  garmentProcessingCost: 0,
  stylistChatCost: 0,
} as const;

/**
 * Illustrative demo subscription tiers (configurable mock values).
 */
export const SUBSCRIPTION_PLANS: PlanConfig[] = [
  {
    id: 'FREE',
    name: 'Free',
    tagline: 'For exploring your digital closet',
    monthlyPriceInr: 0,
    monthlyCredits: 10,
    maxWardrobeItems: 30,
    features: [
      'Up to 30 wardrobe items',
      '10 AI generation credits / month',
      '1 personal AI avatar',
      'Outfit Studio & calendar planner',
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    tagline: 'For weekly styling & regular lookbooks',
    monthlyPriceInr: 399,
    monthlyCredits: 60,
    maxWardrobeItems: 'UNLIMITED',
    highlighted: true,
    features: [
      'Unlimited wardrobe items',
      '60 AI generation credits / month',
      'Priority try-on & avatar regeneration',
      'Full AI Stylist & wardrobe analytics',
    ],
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    tagline: 'For power stylists & heavy try-ons',
    monthlyPriceInr: 799,
    monthlyCredits: 160,
    maxWardrobeItems: 'UNLIMITED',
    features: [
      'Unlimited wardrobe items',
      '160 AI generation credits / month',
      'Multi-look studio comparisons',
      'Early access to seasonal styling capsules',
    ],
  },
];

export const THEME_TOKENS = {
  canvas: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceMuted: '#F3EFE9',
  ink: '#1C1917',
  inkMuted: '#57534E',
  inkSubtle: '#78716C',
  accent: '#B55D42',
  accentHover: '#9D4D34',
  accentSoft: '#F6E8E2',
  sage: '#5B705A',
  sageSoft: '#EBF0EA',
  border: '#E6E0D6',
} as const;
