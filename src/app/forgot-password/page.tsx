'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { requestPasswordResetAction } from '@/lib/actions';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ email?: string; devResetUrl?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await requestPasswordResetAction(identifier);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccessData({ email: res.email, devResetUrl: res.devResetUrl });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Password Recovery</h1>
          <p className="text-muted-foreground text-sm">
            Recover access using your registered recovery email.
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl overflow-hidden border border-border/50 animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both shadow-2xl p-6 sm:p-8">
          
          {successData ? (
            <div className="text-center space-y-4 py-2 animate-in fade-in duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-foreground">Check Your Email</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We've sent a password reset link to your recovery address:
                </p>
                <div className="inline-block px-3 py-1 rounded-lg bg-secondary/80 font-mono text-sm font-semibold text-primary border border-border/60">
                  {successData.email}
                </div>
              </div>

              <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-xs mx-auto">
                The link is valid for <strong>1 hour</strong>. Don't forget to check your spam or promotional folder if it doesn't appear promptly.
              </p>

              {successData.devResetUrl && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs text-left space-y-1">
                  <div className="font-semibold flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" /> Dev Mode Reset Link:
                  </div>
                  <a href={successData.devResetUrl} className="underline break-all text-[11px]">
                    {successData.devResetUrl}
                  </a>
                </div>
              )}

              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-xs hover:bg-secondary/80 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Username or Recovery Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your username or email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  />
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We'll verify your account and dispatch a reset link to the recovery email linked to your profile.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 active:scale-[0.98] shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center border-t border-border/40">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
