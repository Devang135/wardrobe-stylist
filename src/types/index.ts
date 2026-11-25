export type GarmentCategory =
  | 'TOP'
  | 'BOTTOM'
  | 'ONE_PIECE'
  | 'OUTERWEAR'
  | 'FOOTWEAR'
  | 'ACCESSORY'
  | 'TRADITIONAL';

export type ProcessingStatus =
  | 'PENDING'
  | 'UPLOADING'
  | 'PROCESSING'
  | 'READY'
  | 'FAILED'
  | 'ARCHIVED';

export type SubscriptionPlanId = 'FREE' | 'PRO' | 'PREMIUM';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatarUrl?: string;
  plan: SubscriptionPlanId;
  onboardingCompleted: boolean;
  stylePreferences: string[];
  commonOccasions: string[];
  preferredColors: string[];
  preferredFits: string[];
  preferredSeasons: string[];
  units: 'METRIC' | 'IMPERIAL';
  createdAt: string;
}

export interface NotificationPreferences {
  generationComplete: boolean;
  productUpdates: boolean;
  weeklyInsights: boolean;
  marketingEmails: boolean;
}

export interface Garment {
  id: string;
  userId: string;
  name: string;
  category: GarmentCategory;
  subcategory: string;
  imageUrl: string;
  originalImageUrl?: string;
  color: string;
  colorHex: string;
  secondaryColor?: string;
  pattern?: string;
  brand?: string;
  size?: string;
  material?: string;
  styleTags: string[];
  occasionTags: string[];
  seasonTags: string[];
  favorite: boolean;
  status: ProcessingStatus;
  wearCount: number;
  purchasePriceInr?: number;
  createdAt: string;
  notes?: string;
}

export interface AvatarVersion {
  id: string;
  imageUrl: string;
  createdAt: string;
  label: string;
}

export interface AvatarProfile {
  id: string;
  userId: string;
  faceReferenceUrl?: string;
  bodyReferenceUrl?: string;
  avatarImageUrl?: string;
  status: 'NOT_STARTED' | 'UPLOADED' | 'GENERATING' | 'READY' | 'FAILED';
  versions: AvatarVersion[];
  activeVersionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Outfit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  generatedImageUrl: string;
  garmentIds: string[];
  tags: string[];
  occasion?: string;
  season?: string;
  favorite: boolean;
  wearCount: number;
  lastWornAt?: string;
  createdAt: string;
  notes?: string;
}

export type AiJobType = 'AVATAR' | 'GARMENT_PROCESSING' | 'TRY_ON' | 'STYLIST';

export type AiJobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface AiJob {
  id: string;
  type: AiJobType;
  status: AiJobStatus;
  progressMessage?: string;
  resultUrl?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface SubscriptionSummary {
  plan: SubscriptionPlanId;
  creditsRemaining: number;
  creditsIncluded: number;
  renewsAt?: string;
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIAL';
}

export interface CreditUsageEntry {
  id: string;
  action: string;
  creditsDelta: number;
  balanceAfter: number;
  createdAt: string;
  referenceLabel?: string;
}

export interface CalendarOutfitPlan {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  outfitId: string;
  occasion: string;
  notes?: string;
}

export interface StylistRecommendation {
  id: string;
  title: string;
  rationale: string;
  occasion: string;
  tags: string[];
  garmentIds: string[];
}

export interface StylistMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  recommendations?: StylistRecommendation[];
}

export interface AnalyticsOverview {
  totalItems: number;
  activeItems: number;
  archivedItems: number;
  totalOutfits: number;
  utilizationRate: number;
  categoryBreakdown: Array<{ category: GarmentCategory; label: string; count: number }>;
  mostWornGarments: Garment[];
  leastWornGarments: Garment[];
  outfitsByOccasion: Array<{ occasion: string; count: number }>;
  generationActivity: Array<{ month: string; tryOns: number; savedOutfits: number }>;
  costPerWearLeaders: Array<{
    garmentId: string;
    name: string;
    wearCount: number;
    purchasePriceInr: number;
    costPerWearInr: number;
  }>;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  href?: string;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
}

export interface TryOnRequestPayload {
  avatarId: string;
  topId?: string;
  bottomId?: string;
  onePieceId?: string;
  outerwearId?: string;
  footwearId?: string;
  accessoryIds: string[];
}

export interface TryOnResult {
  jobId: string;
  previewUrl: string;
  garmentIds: string[];
  creditsCharged: number;
  createdAt: string;
}

export interface ApiErrorShape {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string>;
}
