import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { signupSchema, type SignupFormValues } from '@/features/auth/schemas/auth.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthActions } from '@/hooks/useAuth';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { registerMutation } = useAuthActions();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const passwordVal = watch('password');
  const acceptTerms = watch('acceptTerms');

  const strengthChecks = [
    { label: '8+ characters', ok: passwordVal.length >= 8 },
    { label: '1 uppercase letter', ok: /[A-Z]/.test(passwordVal) },
    { label: '1 number', ok: /[0-9]/.test(passwordVal) },
  ];

  const onSubmit = async (values: SignupFormValues) => {
    try {
      await registerMutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      toast.success('Account created! Let’s personalize your studio.');
      navigate('/app/onboarding', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <AuthLayout
      title="Create your wardrobe"
      subtitle="Start organizing your clothes, build your personal avatar, and preview outfits."
    >
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="signup-name">Full name</Label>
            <Input id="signup-name" placeholder="Alex Sharma" {...register('name')} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="alex@example.com"
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                className="pr-10"
                {...register('password')}
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
            <div className="flex flex-wrap gap-2 pt-1">
              {strengthChecks.map((check) => (
                <span
                  key={check.label}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    check.ok
                      ? 'bg-sage-soft text-sage-foreground'
                      : 'bg-surface-muted text-ink-subtle'
                  }`}
                >
                  {check.label}
                </span>
              ))}
            </div>
            {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signup-confirm">Confirm password</Label>
            <Input
              id="signup-confirm"
              type={showPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <Checkbox
                id="accept-terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setValue('acceptTerms', checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="accept-terms" className="text-xs font-normal leading-relaxed text-ink-muted cursor-pointer">
                I agree to the Terms of Service and Privacy Policy, and understand uploaded photos are processed in demo mode only.
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-xs text-danger">{errors.acceptTerms.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || registerMutation.isPending}>
            {registerMutation.isPending ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
