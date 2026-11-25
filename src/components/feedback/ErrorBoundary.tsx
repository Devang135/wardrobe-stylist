import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || 'An unexpected rendering error occurred.' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Route ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-soft text-danger">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-ink">Unable to display this view</h2>
          <p className="mt-2 max-w-md text-sm text-ink-muted">{this.state.message}</p>
          <Button
            className="mt-5"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            Reload view
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
