'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Lock, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { verifyResetTokenAction, resetPasswordAction } from '@/lib/actions';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [accountUsername, setAccountUsername] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Verify token on load
  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      setTokenError('No reset token was provided in the URL.');
      return;
    }

    verifyResetTokenAction(token).then((res) => {
      setVerifying(false);
      if (res.valid && res.username) {
        setTokenValid(true);
        setAccountUsername(res.username);
      } else {
        setTokenValid(false);
        setTokenError(res.error || 'This reset link is invalid or expired.');
      }
    }).catch(() => {
      setVerifying(false);
      setTokenValid(false);
      setTokenError('Failed to verify token. Please check your network connection.');
    });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (newPassword.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await resetPasswordAction(token, newPassword);
      if (res.error) {
        setFormError(res.error);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="text-center py-10 space-y-3">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground font-medium">Verifying reset token...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Invalid or Expired Link</h2>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            {tokenError || 'This reset token is invalid or has expired.'}
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all"
          >
            Request New Reset Link
          </Link>
          <Link
            href="/login"
            className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4 py-4 animate-in fade-in duration-300">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto shadow-sm">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">Password Reset Successful!</h2>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Your password has been updated. You can now sign in with your new credentials.
          </p>
        </div>
        <div className="pt-3">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-md active:scale-[0.98]"
          >
            Sign In Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-200">
      <div className="p-3 rounded-xl bg-secondary/30 border border-border/40 text-xs text-muted-foreground">
        Resetting password for: <strong className="text-foreground">@{accountUsername}</strong>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">New Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 pr-10 rounded-xl bg-background border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <span className="text-[11px] text-muted-foreground">Minimum 6 characters</span>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Confirm New Password</label>
        <input
          type={showPassword ? 'text' : 'password'}
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl bg-background border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
        />
      </div>

      {formError && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 active:scale-[0.98] shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none cursor-pointer mt-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>Update Password</span>
          </>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Set New Password</h1>
          <p className="text-muted-foreground text-sm">
            Choose a new secure password for your account.
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl overflow-hidden border border-border/50 animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both shadow-2xl p-6 sm:p-8">
          <Suspense fallback={
            <div className="text-center py-10">
              <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>

      </div>
    </div>
  );
}
