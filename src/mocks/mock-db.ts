import {
  SEED_AVATAR,
  SEED_CALENDAR_PLANS,
  SEED_CREDIT_HISTORY,
  SEED_GARMENTS,
  SEED_NOTIFICATIONS,
  SEED_NOTIFICATIONS_PREFS,
  SEED_OUTFITS,
  SEED_STYLIST_MESSAGES,
  SEED_SUBSCRIPTION,
  SEED_USER,
} from '@/mocks/seed';
import type {
  AvatarProfile,
  CalendarOutfitPlan,
  CreditUsageEntry,
  Garment,
  NotificationItem,
  NotificationPreferences,
  Outfit,
  StylistMessage,
  SubscriptionSummary,
  UserProfile,
} from '@/types';

const STORAGE_KEY = 'wardrobe_ai_mock_session_auth';

export interface MockDatabaseState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  notificationPrefs: NotificationPreferences;
  avatar: AvatarProfile | null;
  garments: Garment[];
  outfits: Outfit[];
  subscription: SubscriptionSummary;
  creditHistory: CreditUsageEntry[];
  calendarPlans: CalendarOutfitPlan[];
  stylistMessages: StylistMessage[];
  notifications: NotificationItem[];
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function loadInitialAuth(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function persistAuthFlag(authenticated: boolean): void {
  try {
    if (authenticated) {
      window.localStorage.setItem(STORAGE_KEY, 'true');
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

export const mockDb: MockDatabaseState = {
  isAuthenticated: loadInitialAuth(),
  user: loadInitialAuth() ? clone(SEED_USER) : null,
  notificationPrefs: clone(SEED_NOTIFICATIONS_PREFS),
  avatar: clone(SEED_AVATAR),
  garments: clone(SEED_GARMENTS),
  outfits: clone(SEED_OUTFITS),
  subscription: clone(SEED_SUBSCRIPTION),
  creditHistory: clone(SEED_CREDIT_HISTORY),
  calendarPlans: clone(SEED_CALENDAR_PLANS),
  stylistMessages: clone(SEED_STYLIST_MESSAGES),
  notifications: clone(SEED_NOTIFICATIONS),
};

export function resetMockDbForDemoUser(): void {
  mockDb.isAuthenticated = true;
  mockDb.user = clone(SEED_USER);
  mockDb.notificationPrefs = clone(SEED_NOTIFICATIONS_PREFS);
  mockDb.avatar = clone(SEED_AVATAR);
  mockDb.garments = clone(SEED_GARMENTS);
  mockDb.outfits = clone(SEED_OUTFITS);
  mockDb.subscription = clone(SEED_SUBSCRIPTION);
  mockDb.creditHistory = clone(SEED_CREDIT_HISTORY);
  mockDb.calendarPlans = clone(SEED_CALENDAR_PLANS);
  mockDb.stylistMessages = clone(SEED_STYLIST_MESSAGES);
  mockDb.notifications = clone(SEED_NOTIFICATIONS);
  persistAuthFlag(true);
}

export function resetMockDbForNewUser(name: string, email: string): void {
  const newUserId = `usr_${Date.now()}`;
  mockDb.isAuthenticated = true;
  mockDb.user = {
    id: newUserId,
    name,
    email,
    emailVerified: false,
    plan: 'FREE',
    onboardingCompleted: false,
    stylePreferences: [],
    commonOccasions: [],
    preferredColors: [],
    preferredFits: [],
    preferredSeasons: [],
    units: 'METRIC',
    createdAt: new Date().toISOString(),
  };
  mockDb.notificationPrefs = clone(SEED_NOTIFICATIONS_PREFS);
  mockDb.avatar = {
    id: `avt_${Date.now()}`,
    userId: newUserId,
    status: 'NOT_STARTED',
    versions: [],
  };
  mockDb.garments = [];
  mockDb.outfits = [];
  mockDb.subscription = {
    plan: 'FREE',
    creditsRemaining: 10,
    creditsIncluded: 10,
    status: 'ACTIVE',
  };
  mockDb.creditHistory = [
    {
      id: `crd_${Date.now()}`,
      action: 'Welcome Free plan credits',
      creditsDelta: 10,
      balanceAfter: 10,
      createdAt: new Date().toISOString(),
      referenceLabel: 'Starter Grant',
    },
  ];
  mockDb.calendarPlans = [];
  mockDb.stylistMessages = [];
  mockDb.notifications = [];
  persistAuthFlag(true);
}

export function delay(ms = 320): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
