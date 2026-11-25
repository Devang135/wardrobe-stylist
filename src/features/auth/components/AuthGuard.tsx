import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useAuth';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { AppShell } from '@/components/layout/AppShell';

export function ProtectedAppLayout() {
  const location = useLocation();
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl p-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (location.pathname === '/app/onboarding') {
    return <Outlet />;
  }

  return <AppShell user={user} />;
}
