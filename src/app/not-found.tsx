import Link from 'next/link';
import { Compass, Home, BookOpen, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-8 flex items-center justify-center">
        <div className="absolute h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-border/50 bg-secondary/40 shadow-2xl backdrop-blur-xl">
          <Compass className="h-12 w-12 text-primary animate-pulse" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-3.5 py-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-4">
        404 Error • Missing Loop
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-3">
        Page Not Found
      </h1>

      <p className="max-w-md text-base text-muted-foreground mb-8 leading-relaxed">
        The problem or review path you are looking for does not exist, has been rescheduled, or was moved.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <Link
          href="/problems"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/40 px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary/70 hover:border-border active:scale-[0.98]"
        >
          <BookOpen className="h-4 w-4" />
          Browse Problems
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
