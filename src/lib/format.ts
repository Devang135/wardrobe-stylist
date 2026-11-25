import { format, formatDistanceToNow, parseISO } from 'date-fns';
import type { GarmentCategory } from '@/types';

export function formatShortDate(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return iso;
  }
}

export function formatRelativeDate(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function formatCurrencyInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getGreetingByHour(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export const CATEGORY_LABELS: Record<GarmentCategory, string> = {
  TOP: 'Tops',
  BOTTOM: 'Bottoms',
  ONE_PIECE: 'One-piece',
  OUTERWEAR: 'Outerwear',
  FOOTWEAR: 'Footwear',
  ACCESSORY: 'Accessories',
  TRADITIONAL: 'Traditional',
};

export const CATEGORY_SINGULAR: Record<GarmentCategory, string> = {
  TOP: 'Top',
  BOTTOM: 'Bottom',
  ONE_PIECE: 'One-piece',
  OUTERWEAR: 'Outerwear',
  FOOTWEAR: 'Footwear',
  ACCESSORY: 'Accessory',
  TRADITIONAL: 'Traditional',
};
