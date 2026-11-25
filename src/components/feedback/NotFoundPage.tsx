import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-canvas px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-ink-muted">
        <Compass className="h-6 w-6" />
      </div>
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-ink-muted">
        The studio route you requested does not exist or may have moved.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button asChild>
          <Link to="/app/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
