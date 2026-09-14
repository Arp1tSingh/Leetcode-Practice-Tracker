'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in zoom-in duration-500">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4 max-w-md">
        An unexpected error occurred while loading this page. Our servers might be experiencing a hiccup.
      </p>

      {/* Debug details to pinpoint errors in production */}
      <div className="mb-6 max-w-lg w-full bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-left font-mono text-xs text-destructive overflow-auto max-h-48">
        <p className="font-semibold mb-1">Error Details:</p>
        <p className="break-all">{error.message || 'No error message available'}</p>
        {error.digest && (
          <p className="mt-2 text-muted-foreground">Digest: <span className="text-foreground">{error.digest}</span></p>
        )}
      </div>

      <button
        onClick={() => reset()}
        className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm active:scale-95"
      >
        <RefreshCcw className="w-4 h-4 mr-2" />
        Try again
      </button>
    </div>
  );
}
