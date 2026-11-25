import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Layers,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  Shirt,
  Sparkles,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavItemConfig {
  label: string;
  to: string;
  icon: LucideIcon;
}

export interface NavGroupConfig {
  title: string;
  items: NavItemConfig[];
}

export const APP_NAV_GROUPS: NavGroupConfig[] = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'My Style',
    items: [
      { label: 'My Avatar', to: '/app/avatar', icon: UserCheck },
      { label: 'My Wardrobe', to: '/app/wardrobe', icon: Shirt },
      { label: 'Outfit Studio', to: '/app/outfit-studio', icon: Sparkles },
      { label: 'Saved Outfits', to: '/app/outfits', icon: Layers },
      { label: 'AI Stylist', to: '/app/stylist', icon: MessageSquareText },
      { label: 'Outfit Calendar', to: '/app/calendar', icon: CalendarDays },
    ],
  },
  {
    title: 'Insights',
    items: [{ label: 'Wardrobe Analytics', to: '/app/analytics', icon: BarChart3 }],
  },
  {
    title: 'Account',
    items: [
      { label: 'Subscription & Credits', to: '/app/subscription', icon: CreditCard },
      { label: 'Settings', to: '/app/settings/profile', icon: Settings },
    ],
  },
];

export const MOBILE_BOTTOM_NAV: NavItemConfig[] = [
  { label: 'Home', to: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Wardrobe', to: '/app/wardrobe', icon: Shirt },
  { label: 'Studio', to: '/app/outfit-studio', icon: Sparkles },
  { label: 'Outfits', to: '/app/outfits', icon: Layers },
  { label: 'Stylist', to: '/app/stylist', icon: MessageSquareText },
];
