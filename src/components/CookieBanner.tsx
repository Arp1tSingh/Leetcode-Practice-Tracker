'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, Check } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('lc_fsrs_cookie_consent');
      if (!consent) {
        // Small delay so it doesn't abruptly pop up immediately on first paint
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage errors (e.g. private mode)
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('lc_fsrs_cookie_consent', 'accepted');
    } catch {}
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('lc_fsrs_cookie_consent', 'essential_only');
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-500"
    >
      <div className="glass border border-border/70 shadow-2xl p-5 rounded-2xl backdrop-blur-xl bg-card/90">
        <div className="flex items-start gap-3.5 mb-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary flex-shrink-0 mt-0.5">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Cookie & Privacy Preferences
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use strictly necessary cookies to keep you signed in, alongside anonymous telemetry to measure system performance. See our{' '}
              <Link
                href="/privacy"
                className="text-primary hover:underline font-medium inline-flex items-center"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
          <button
            onClick={handleDecline}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            Accept
          </button>
        </div>
      </div>
    </aside>
  );
}
