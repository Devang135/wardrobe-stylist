import { lazy, Suspense } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import { ProtectedAppLayout } from '@/features/auth/components/AuthGuard';
import { SettingsLayout } from '@/features/settings/components/SettingsLayout';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

const LandingPage = lazy(() => import('@/features/auth/pages/LandingPage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const SignupPage = lazy(() => import('@/features/auth/pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const OnboardingPage = lazy(() => import('@/features/onboarding/pages/OnboardingPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const AvatarPage = lazy(() => import('@/features/avatar/pages/AvatarPage'));
const WardrobePage = lazy(() => import('@/features/wardrobe/pages/WardrobePage'));
const WardrobeUploadPage = lazy(() => import('@/features/wardrobe/pages/WardrobeUploadPage'));
const GarmentDetailPage = lazy(() => import('@/features/wardrobe/pages/GarmentDetailPage'));
const OutfitStudioPage = lazy(() => import('@/features/outfit-studio/pages/OutfitStudioPage'));
const SavedOutfitsPage = lazy(() => import('@/features/outfits/pages/SavedOutfitsPage'));
const OutfitDetailPage = lazy(() => import('@/features/outfits/pages/OutfitDetailPage'));
const StylistPage = lazy(() => import('@/features/stylist/pages/StylistPage'));
const CalendarPage = lazy(() => import('@/features/calendar/pages/CalendarPage'));
const AnalyticsPage = lazy(() => import('@/features/analytics/pages/AnalyticsPage'));
const SubscriptionPage = lazy(() => import('@/features/subscription/pages/SubscriptionPage'));
const ProfileSettingsPage = lazy(() => import('@/features/settings/pages/ProfileSettingsPage'));
const PreferencesSettingsPage = lazy(() => import('@/features/settings/pages/PreferencesSettingsPage'));
const NotificationsSettingsPage = lazy(
  () => import('@/features/settings/pages/NotificationsSettingsPage'),
);
const PrivacySettingsPage = lazy(() => import('@/features/settings/pages/PrivacySettingsPage'));
const NotFoundPage = lazy(() => import('@/components/feedback/NotFoundPage'));

function withSuspense(node: JSX.Element) {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl p-6">
            <LoadingSkeleton />
          </div>
        }
      >
        {node}
      </Suspense>
    </ErrorBoundary>
  );
}

export const router = createHashRouter([
  {
    path: '/',
    element: withSuspense(<LandingPage />),
  },
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    path: '/signup',
    element: withSuspense(<SignupPage />),
  },
  {
    path: '/forgot-password',
    element: withSuspense(<ForgotPasswordPage />),
  },
  {
    path: '/app',
    element: <ProtectedAppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'onboarding',
        element: withSuspense(<OnboardingPage />),
      },
      {
        path: 'dashboard',
        element: withSuspense(<DashboardPage />),
      },
      {
        path: 'avatar',
        element: withSuspense(<AvatarPage />),
      },
      {
        path: 'wardrobe',
        element: withSuspense(<WardrobePage />),
      },
      {
        path: 'wardrobe/upload',
        element: withSuspense(<WardrobeUploadPage />),
      },
      {
        path: 'wardrobe/:itemId',
        element: withSuspense(<GarmentDetailPage />),
      },
      {
        path: 'outfit-studio',
        element: withSuspense(<OutfitStudioPage />),
      },
      {
        path: 'outfits',
        element: withSuspense(<SavedOutfitsPage />),
      },
      {
        path: 'outfits/:outfitId',
        element: withSuspense(<OutfitDetailPage />),
      },
      {
        path: 'stylist',
        element: withSuspense(<StylistPage />),
      },
      {
        path: 'calendar',
        element: withSuspense(<CalendarPage />),
      },
      {
        path: 'analytics',
        element: withSuspense(<AnalyticsPage />),
      },
      {
        path: 'subscription',
        element: withSuspense(<SubscriptionPage />),
      },
      {
        path: 'settings',
        element: <SettingsLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/app/settings/profile" replace />,
          },
          {
            path: 'profile',
            element: withSuspense(<ProfileSettingsPage />),
          },
          {
            path: 'preferences',
            element: withSuspense(<PreferencesSettingsPage />),
          },
          {
            path: 'notifications',
            element: withSuspense(<NotificationsSettingsPage />),
          },
          {
            path: 'privacy',
            element: withSuspense(<PrivacySettingsPage />),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
]);
