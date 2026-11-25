import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from '@/features/auth/schemas/auth.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';

export default function ForgotPasswordPage() {
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    const res = await authService.requestPasswordReset(values.email);
    setConfirmation(res.message);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email associated with your account to receive password reset instructions."
    >
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        {confirmation ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-sage-soft p-4 text-sage-foreground">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">Reset instructions (Simulated Demo)</p>
                <p className="text-xs opacity-90">{confirmation}</p>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link to="/login">Return to sign in</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="reset-email">Email address</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="alex@example.com"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Send reset instructions'}
            </Button>
          </form>
        )}
      </div>

      <p className="text-center text-sm text-ink-muted">
        Remembered your password?{' '}
        <Link to="/login" className="font-medium text-accent hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
