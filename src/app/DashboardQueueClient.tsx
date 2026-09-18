'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Layers, 
  PlusCircle, 
  Sliders, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { QueuedCard, fetchMoreBacklogCardsAction, updateDailyReviewLimitAction } from '@/lib/queue';

export interface DashboardQueueClientProps {
  userId: string;
  initialCards: QueuedCard[];
  initialTotalOverdue: number;
  initialBacklogRemaining: number;
  initialCompletedToday: number;
  initialDailyLimit: number;
}

export function DashboardQueueClient({
  userId,
  initialCards,
  initialTotalOverdue,
  initialBacklogRemaining,
  initialCompletedToday,
  initialDailyLimit,
}: DashboardQueueClientProps) {
  const [cards, setCards] = useState<QueuedCard[]>(initialCards);
  const [backlogRemaining, setBacklogRemaining] = useState(initialBacklogRemaining);
  const [totalOverdueCount, setTotalOverdueCount] = useState(initialTotalOverdue);
  const [completedToday, setCompletedToday] = useState(initialCompletedToday);
  const [dailyLimit, setDailyLimit] = useState(initialDailyLimit);
  
  const [isPending, startTransition] = useTransition();
  const [showLimitSettings, setShowLimitSettings] = useState(false);
  const [tempLimit, setTempLimit] = useState(initialDailyLimit);

  // Progress calculation
  const progressPercent = dailyLimit > 0 ? Math.min(100, Math.round((completedToday / dailyLimit) * 100)) : 0;
  const isGoalReached = completedToday >= dailyLimit;

  const handleReviewMore = () => {
    startTransition(async () => {
      try {
        const res = await fetchMoreBacklogCardsAction(userId, cards.length, 3);
        setCards(res.cards);
        setBacklogRemaining(res.backlogRemaining);
        setTotalOverdueCount(res.totalOverdueCount);
      } catch (err) {
        console.error('Failed to load more cards:', err);
      }
    });
  };

  const handleSaveLimit = () => {
    startTransition(async () => {
      try {
        const res = await updateDailyReviewLimitAction(userId, tempLimit);
        if (res.dailyLimit) {
          setDailyLimit(res.dailyLimit);
          setShowLimitSettings(false);
        }
      } catch (err) {
        console.error('Failed to update daily limit:', err);
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Paced Queue Header & Daily Progress Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-secondary/30 border border-border/60 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Progress title */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                Today&apos;s Review Goal
              </span>
              {isGoalReached && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Goal Reached!
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground font-semibold">{completedToday} of {dailyLimit}</strong> completed today
              {cards.length > 0 && ` • ${cards.length} ready in today's active batch`}
            </p>
          </div>

          {/* Controls: Backlog indicator & Daily Limit Adjuster */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Subtle, anxiety-free Backlog Resting Badge */}
            {backlogRemaining > 0 && (
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-secondary/80 text-muted-foreground border border-border/60"
                title={`${backlogRemaining} cards are resting in your backlog and will be scheduled automatically over the coming days.`}
              >
                <Layers className="w-3.5 h-3.5 text-primary" />
                <span>{backlogRemaining} additional cards resting in backlog</span>
              </div>
            )}

            {/* Review +3 more from backlog button */}
            {backlogRemaining > 0 && (
              <button
                type="button"
                onClick={handleReviewMore}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                title="Voluntarily pull 3 more cards from the backlog into your active queue"
              >
                <PlusCircle className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
                <span>Review +3 more from backlog</span>
              </button>
            )}

            {/* Quick Limit Settings button */}
            <button
              type="button"
              onClick={() => setShowLimitSettings(!showLimitSettings)}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-border/50 transition-colors"
              title="Configure Daily Review Limit"
              aria-label="Configure Daily Review Limit"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary/70 h-2.5 rounded-full overflow-hidden p-0.5 border border-border/40">
          <div 
            className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Limit Settings Popover / Drawer */}
        {showLimitSettings && (
          <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-md flex flex-wrap items-center justify-between gap-3 animate-in fade-in-50 duration-150">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground">Daily Review Cap</p>
              <p className="text-[11px] text-muted-foreground">
                Set how many problems you want in your daily active queue (default: 6)
              </p>
            </div>

            <div className="flex items-center gap-2">
              {[4, 6, 8, 10, 15].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTempLimit(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    tempLimit === preset
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary/40 text-muted-foreground hover:text-foreground border-border/60'
                  }`}
                >
                  {preset}
                </button>
              ))}

              <button
                type="button"
                onClick={handleSaveLimit}
                disabled={isPending || tempLimit === dailyLimit}
                className="ml-2 px-3 py-1 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-xs"
              >
                {isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Queue State: Empty vs Cards */}
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1 max-w-md">
            <h3 className="text-lg font-bold text-foreground">
              {isGoalReached 
                ? "You've finished your daily review target!" 
                : "You're all caught up for right now!"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {backlogRemaining > 0 ? (
                <>
                  You have cleared today&apos;s active batch. <strong>{backlogRemaining} cards</strong> are resting in your backlog. 
                  Take a well-deserved rest, or review a few more if you have extra time!
                </>
              ) : (
                "You have no pending problem reviews in your queue. Great job staying on top of your practice routine!"
              )}
            </p>
          </div>

          {backlogRemaining > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleReviewMore}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition-all active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                Review +3 more from backlog ({backlogRemaining} resting)
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
          <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border/50 uppercase tracking-wider bg-secondary/20">
                <th className="py-3.5 px-4 font-semibold">Rank</th>
                <th className="py-3.5 px-4 font-semibold">ID</th>
                <th className="py-3.5 px-4 font-semibold">Problem Name</th>
                <th className="py-3.5 px-4 font-semibold">Difficulty</th>
                <th className="py-3.5 px-4 font-semibold">Pattern</th>
                <th className="py-3.5 px-4 font-semibold" title="FSRS Retrievability R(t): estimated percentage chance of recall right now">
                  Retrievability
                </th>
                <th className="py-3.5 px-4 font-semibold">Urgency</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {cards.map((problem, idx) => {
                const difficultyClass = 
                  problem.difficulty === 'Easy' ? 'badge-easy' : 
                  problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard';

                // Retrievability styling
                const R = problem.retrievability;
                const retrievabilityColor = 
                  R <= 0 ? 'text-rose-500 font-bold' :
                  R < 50 ? 'text-rose-500 font-bold' :
                  R < 75 ? 'text-amber-500 font-medium' : 
                  'text-emerald-500 font-medium';

                // Priority Badge based on retrievability and days overdue
                let priorityLabel = 'Normal';
                let priorityClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
                
                if (R < 35 || problem.daysOverdue >= 5) {
                  priorityLabel = 'Critical';
                  priorityClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
                } else if (R < 65 || problem.daysOverdue >= 2) {
                  priorityLabel = 'High';
                  priorityClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
                }

                return (
                  <tr key={problem.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-4 text-muted-foreground font-semibold">
                      #{idx + 1}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground font-medium">
                      {problem.leetcodeId}
                    </td>
                    <td className="px-4 py-4 font-semibold text-foreground">
                      <a 
                        href={`https://leetcode.com/problems/${problem.titleSlug}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline hover:text-primary transition-colors"
                        title={problem.title}
                      >
                        {problem.title}
                      </a>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${difficultyClass}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {problem.pattern ? (
                        <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md text-xs font-medium truncate max-w-[150px] inline-block" title={problem.pattern}>
                          {problem.pattern}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs ${retrievabilityColor}`}>
                          {problem.state === 0 ? 'New (0%)' : `${R.toFixed(1)}%`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${priorityClass}`}>
                        {priorityLabel}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link 
                        href={`/review/${problem.id}`}
                        className="inline-flex items-center justify-center gap-1 px-4 py-1.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-xs text-xs"
                      >
                        Review
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
