import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, RefreshCw, BrainCircuit, Target, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Thank You | Account Setup Complete',
  description: 'Welcome to LeetCode FSRS. Your spaced repetition practice loop is primed and ready.',
};

export default function ThankYouPage() {
  const steps = [
    {
      icon: RefreshCw,
      title: '1. Sync Recent Submissions',
      desc: 'Connect your LeetCode username from the dashboard to pull in your recent accepted solutions automatically.',
    },
    {
      icon: BrainCircuit,
      title: '2. Complete Daily Reviews',
      desc: 'Review problems due today and rate your recall (Again, Hard, Good, Easy). The FSRS model adapts the intervals dynamically.',
    },
    {
      icon: Target,
      title: '3. Eliminate Blind Spots',
      desc: 'Use the Pattern Mastery view to pinpoint weak areas like Monotonic Stacks, DP, or Graphs before your interviews.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="absolute h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-xl">
          <CheckCircle2 className="h-10 w-10" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-3.5 py-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-4">
        <Sparkles className="h-3.5 w-3.5 text-primary" /> Setup Complete
      </div>

      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
        Welcome to the Loop!
      </h1>

      <p className="max-w-xl mx-auto text-base sm:text-lg text-muted-foreground mb-10 leading-relaxed">
        Your spaced repetition workspace is ready. You now have a proven memory system behind every coding problem you solve.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-10">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="glass p-5 rounded-2xl border border-border/60 space-y-2">
              <div className="p-2 w-fit rounded-xl bg-primary/10 text-primary mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-sm text-foreground">{s.title}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/problems"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/40 px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary/70 hover:border-border active:scale-[0.98]"
        >
          View Problem Directory
        </Link>
      </div>
    </div>
  );
}
