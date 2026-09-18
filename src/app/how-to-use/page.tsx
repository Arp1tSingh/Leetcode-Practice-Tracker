import { Metadata } from "next";
import Link from "next/link";
import { 
  BrainCircuit, 
  RefreshCw, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Layers, 
  Code2, 
  ChevronRight,
  Flame,
  Award
} from "lucide-react";

export const metadata: Metadata = {
  title: "How to Use LeetCode FSRS | Simple Guide",
  description: "Learn how to use spaced repetition (FSRS) to permanently remember coding interview problems in just 15 minutes a day.",
};

export default function HowToUsePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Beginner Guide • 4-Minute Read</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          How to Use <span className="text-primary">LeetCode FSRS</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Stop solving 200+ problems only to forget how you did them a month later. 
          Here is how to build permanent recall with just 15 minutes a day.
        </p>

        {/* Quick Nav Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <a href="#why-fsrs" className="text-xs font-medium px-3 py-1.5 rounded-full bg-secondary/60 hover:bg-secondary border border-border/50 transition-colors">
            1. Why FSRS?
          </a>
          <a href="#workflow" className="text-xs font-medium px-3 py-1.5 rounded-full bg-secondary/60 hover:bg-secondary border border-border/50 transition-colors">
            2. The 4-Step Routine
          </a>
          <a href="#ratings" className="text-xs font-medium px-3 py-1.5 rounded-full bg-secondary/60 hover:bg-secondary border border-border/50 transition-colors">
            3. Rating Cheat Sheet
          </a>
          <a href="#patterns" className="text-xs font-medium px-3 py-1.5 rounded-full bg-secondary/60 hover:bg-secondary border border-border/50 transition-colors">
            4. Pattern Mastery
          </a>
          <a href="#faq" className="text-xs font-medium px-3 py-1.5 rounded-full bg-secondary/60 hover:bg-secondary border border-border/50 transition-colors">
            5. FAQs
          </a>
        </div>
      </div>

      {/* Section 1: Why FSRS? (The Core Idea) */}
      <section id="why-fsrs" className="glass p-6 sm:p-8 rounded-3xl border border-border/60 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              The Core Problem: Why Grinding Fails
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Understanding the "Forgetting Curve" in simple terms
            </p>
          </div>
        </div>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Human memory is designed to discard information it doesn't use regularly. When you solve a difficult LeetCode problem, 
          you understand it today. But within <strong>7 to 14 days</strong>, your brain forgets up to 80% of the nuanced logic.
        </p>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-2">
            <div className="flex items-center gap-2 text-destructive font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>The Typical Way (Cramming)</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Solve 50 problems in 2 weeks → Stop for a month → Interview comes → You see a problem you solved before, but can't recall the edge cases or state transitions. Frustration.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>The FSRS Way (Spaced Repetition)</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Solve once → FSRS schedules review on <strong>Day 1, Day 4, Day 14, Day 45</strong> (right before you are about to forget it). The problem embeds into long-term intuition forever.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-secondary/30 border border-border/40 flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground font-semibold">What is FSRS?</strong> It stands for <em>Free Spaced Repetition Scheduler</em> — a modern, state-of-the-art memory algorithm. It dynamically measures how difficult a problem is for <em>you specifically</em>, and schedules reviews at the mathematically optimal moment.
          </div>
        </div>
      </section>

      {/* Section 2: The 4-Step Routine */}
      <section id="workflow" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              The 4-Step Daily Routine (15 Minutes)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              How to use this website day-to-day
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Step 1 */}
          <div className="glass p-6 rounded-2xl border border-border/60 flex flex-col sm:flex-row items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0 text-sm">
              1
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                Solve Problems on LeetCode as Usual
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                You do <strong>not</strong> have to write code on this website. Keep using LeetCode's code runner, compiler, and discussion tabs. Just solve or submit normally.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass p-6 rounded-2xl border border-border/60 flex flex-col sm:flex-row items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0 text-sm">
              2
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary" />
                Sync Your Solved Problems
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                There are 3 easy ways to get your problems into your practice tracker:
              </p>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 list-disc list-inside pt-1">
                <li><strong className="text-foreground">Auto-Sync (Recommended):</strong> Add your LeetCode username in your profile dropdown. Every time you open this app, your recent accepted solutions sync automatically!</li>
                <li><strong className="text-foreground">1-Click Bookmarklet:</strong> Drag our bookmarklet button to your browser bar and click it while on LeetCode.</li>
                <li><strong className="text-foreground">CSV Bulk Import:</strong> Upload historical spreadsheets from your profile dropdown.</li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass p-6 rounded-2xl border border-border/60 flex flex-col sm:flex-row items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0 text-sm">
              3
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Check Your "Due Today" Queue
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Every morning, open the <strong>Dashboard</strong>. The app will present only the problems that are <strong>due for review today</strong> (usually 3 to 8 problems).
                Click on the problem name to open it, and spend 3–5 minutes recalling how to solve it.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="glass p-6 rounded-2xl border border-border/60 flex flex-col sm:flex-row items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0 text-sm">
              4
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Log Your Honest Rating
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Click <strong>"Log Review"</strong> and grade your recall using one of the 4 buttons (Again, Hard, Good, Easy). 
                FSRS takes this feedback, recalculates memory stability, and sets the next review date.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Rating Cheat Sheet */}
      <section id="ratings" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              How to Choose Your Rating (Cheat Sheet)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Honesty is your secret weapon. There is zero penalty for rating a problem poorly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Again */}
          <div className="p-5 rounded-2xl bg-card border border-red-500/30 space-y-2 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                1 • Again
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">Interval: Tomorrow (1d)</span>
            </div>
            <h4 className="text-sm font-bold text-foreground">Complete Blank / Looked at Solution</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Choose this if you were stuck, couldn't remember the data structure or algorithm, or had to check the editorial or hints.
            </p>
          </div>

          {/* Hard */}
          <div className="p-5 rounded-2xl bg-card border border-orange-500/30 space-y-2 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">
                2 • Hard
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">Interval: 2 - 4 days</span>
            </div>
            <h4 className="text-sm font-bold text-foreground">Struggled / Needed Heavy Hints</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Choose this if you remembered the rough idea, but had bugs, struggled with boundary conditions, or took a long time to get it right.
            </p>
          </div>

          {/* Good */}
          <div className="p-5 rounded-2xl bg-card border border-emerald-500/30 space-y-2 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                3 • Good
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">Interval: 1 - 2 weeks</span>
            </div>
            <h4 className="text-sm font-bold text-foreground">Standard Recall / Smooth Solve</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Choose this if you recalled the pattern without help, wrote the solution with normal effort, and passed with reasonable speed.
            </p>
          </div>

          {/* Easy */}
          <div className="p-5 rounded-2xl bg-card border border-blue-500/30 space-y-2 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                4 • Easy
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">Interval: 3 - 6+ weeks</span>
            </div>
            <h4 className="text-sm font-bold text-foreground">Trivial / Instant Intuition</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Choose this if the solution felt second nature and you could do it in your sleep. FSRS will push the review far into the future.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Pattern Mastery */}
      <section id="patterns" className="glass p-6 sm:p-8 rounded-3xl border border-border/60 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Pattern Mastery: Targeted Practice
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Stop solving random problems — fix your specific algorithmic blind spots
            </p>
          </div>
        </div>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Interview questions aren't unique; they are variations of around <strong>20 core algorithmic patterns</strong> (like Two Pointers, Monotonic Stack, Topological Sort, or DP).
        </p>

        <div className="p-4 rounded-2xl bg-secondary/30 border border-border/40 space-y-2">
          <h4 className="text-sm font-bold text-foreground">How to use the Pattern Mastery tab:</h4>
          <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
            <li><strong>Check your Weakness Score:</strong> If your <em>Dynamic Programming</em> score is 25% while your <em>Array / Hash Map</em> score is 90%, focus your new problem practice strictly on DP.</li>
            <li><strong>Monitor Hint Rates:</strong> A pattern with a 60%+ hint rate means you're relying on solutions rather than intuition.</li>
            <li><strong>Target Times:</strong> Track whether your average solve time is trending down towards interview benchmark speed (15–20 minutes).</li>
          </ul>
        </div>
      </section>

      {/* Section 5: FAQs */}
      <section id="faq" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Everything you need to know to get the most out of the tracker
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-1.5">
            <h4 className="text-sm font-bold text-foreground">Do I have to re-code every problem from scratch during a review?</h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Not necessarily! For complex or long problems, you can do a <strong>mental walkthrough</strong>: explain the data structure, invariant, time/space complexity, and edge cases to yourself. If you hesitate on the implementation, code it out on LeetCode.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-1.5">
            <h4 className="text-sm font-bold text-foreground">Is my LeetCode password required?</h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <strong>Never.</strong> We only use your public LeetCode username to fetch your recent accepted submissions via public APIs. We never ask for, store, or have access to your LeetCode credentials.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-1.5">
            <h4 className="text-sm font-bold text-foreground">What happens if I miss a few days or go on vacation?</h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Don't worry! Your due queue simply accumulates. FSRS accurately measures elapsed time, so if you review a problem late, it calculates the delay and adjusts future stability accordingly. Just pick back up at your own pace.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-1.5">
            <h4 className="text-sm font-bold text-foreground">How many problems will I have to review each day?</h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              If you solve 1 to 2 new problems a day, you will typically have <strong>4 to 8 reviews per day</strong>. Because intervals quickly expand to weeks and months, the daily workload remains light and sustainable indefinitely.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-primary/15 via-primary/5 to-secondary border border-primary/20 text-center space-y-4">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">
          Ready to retain every algorithm you learn?
        </h3>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Start your daily spaced repetition loop today. Check your dashboard to see which problems are ready for review.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/problems"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border/60 text-foreground font-semibold text-sm transition-all"
          >
            Explore Problem Directory
          </Link>
        </div>
      </div>

    </div>
  );
}
