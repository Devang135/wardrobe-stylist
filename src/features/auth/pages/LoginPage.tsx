import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/auth.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthActions } from '@/hooks/useAuth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [googleMessage, setGoogleMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { loginMutation, demoLoginMutation } = useAuthActions();

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/app/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'alex.sharma@wardrobe-studio.example',
      password: 'Password123',
      rememberMe: true,
    },
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync({ email: values.email, password: values.password });
      toast.success('Signed in to your demo studio');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to sign in');
    }
  };

  const handleDemoAccess = async () => {
    await demoLoginMutation.mutateAsync();
    toast.success('Entered demo account as Alex Sharma');
    navigate('/app/dashboard', { replace: true });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your digital closet, personal avatar, and saved outfits."
    >
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-5">
        <Button
          type="button"
          variant="sage"
          className="w-full"
          onClick={() => void handleDemoAccess()}
          disabled={demoLoginMutation.isPending}
        >
          <Sparkles className="h-4 w-4" />
          {demoLoginMutation.isPending ? 'Loading demo wardrobe...' : 'Enter Demo Account (Alex)'}
        </Button>

        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-border" />
          <span className="mx-3 shrink text-xs uppercase tracking-wider text-ink-subtle">
            or sign in with email
          </span>
          <div className="flex-grow border-t border-border" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              {...register('email')}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <Link to="/forgot-password" className="text-xs font-medium text-accent hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="pr-10"
                {...register('password')}
                aria-invalid={Boolean(errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-subtle hover:text-ink"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember-me"
              checked={Boolean(rememberMe)}
              onCheckedChange={(checked) => setValue('rememberMe', checked === true)}
            />
            <Label htmlFor="remember-me" className="text-sm font-normal text-ink-muted cursor-pointer">
              Remember me on this device
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || loginMutation.isPending}>
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() =>
            setGoogleMessage(
              'Google OAuth is not configured in this frontend demo build. Use email sign-in or "Enter Demo Account".',
            )
          }
        >
          Continue with Google
        </Button>

        {googleMessage && (
          <p role="status" className="rounded-xl border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning">
            {googleMessage}
          </p>
        )}
      </div>

      <p className="text-center text-sm text-ink-muted">
        New to Wardrobe AI?{' '}
        <Link to="/signup" className="font-medium text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
