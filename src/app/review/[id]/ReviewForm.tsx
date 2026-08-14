'use client';

import { useState, useEffect } from 'react';
import { submitReviewAction } from '@/lib/actions';
import { Rating } from 'ts-fsrs';
import { useRouter } from 'next/navigation';
import { Timer, CheckCircle, HelpCircle } from 'lucide-react';

export default function ReviewForm({ userId, problemId }: { userId: string, problemId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [timeTakenMinutes, setTimeTakenMinutes] = useState<number | ''>('');
  const [solvedFromScratch, setSolvedFromScratch] = useState(true);
  const [neededHint, setNeededHint] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleRatingSubmit = async (rating: Rating) => {
    setLoading(true);
    setError('');
    setIsTimerRunning(false);

    const timeTaken = timeTakenMinutes ? Number(timeTakenMinutes) : Math.ceil(timerSeconds / 60);

    const result = await submitReviewAction(
      userId,
      problemId,
      rating,
      timeTaken,
      neededHint,
      solvedFromScratch
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
      setIsTimerRunning(true);
    } else {
      router.push('/');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Conditions */}
        <div className="flex-1 space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-background transition-colors cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={solvedFromScratch}
                onChange={(e) => setSolvedFromScratch(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-muted-foreground/30 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
              <CheckCircle className="w-3.5 h-3.5 text-primary-foreground absolute opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
            </div>
            <span className="text-sm font-medium group-hover:text-foreground transition-colors">Solved from scratch (no copy-paste)</span>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-background transition-colors cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={neededHint}
                onChange={(e) => setNeededHint(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-muted-foreground/30 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
              <CheckCircle className="w-3.5 h-3.5 text-primary-foreground absolute opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
            </div>
            <span className="text-sm font-medium group-hover:text-foreground transition-colors">Needed a hint / checked solution</span>
          </label>
        </div>

        {/* Timer & Manual Time */}
        <div className="sm:w-64 space-y-3">
          <div
            className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border/50 cursor-pointer hover:bg-secondary transition-colors group"
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            title="Click to pause/resume"
          >
            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
              <Timer className={`w-5 h-5 ${isTimerRunning ? 'animate-pulse text-primary' : ''}`} />
              <span className="text-sm font-medium">Session Timer</span>
            </div>
            <div className={`text-xl font-mono font-bold tracking-tight ${!isTimerRunning && 'opacity-50'}`}>
              {formatTime(timerSeconds)}
            </div>
          </div>

          <div className="relative">
            <input
              type="number"
              value={timeTakenMinutes}
              onChange={(e) => setTimeTakenMinutes(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Manual override (min)"
              className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      <div className="pt-8 border-t border-border/50">
        <div className="flex items-center justify-center gap-2 mb-6">
          <HelpCircle className="w-5 h-5 text-muted-foreground" />
          <p className="text-base font-medium">How well did you recall this problem?</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            disabled={loading}
            onClick={() => handleRatingSubmit(Rating.Again)}
            className="group relative px-4 py-4 rounded-2xl border-2 border-red-500/20 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 hover:border-red-500/40 transition-all disabled:opacity-50 active:scale-95"
          >
            <div className="text-red-700 dark:text-red-400 font-bold text-lg mb-1">Again</div>
            <div className="text-xs font-medium text-red-600/70 dark:text-red-400/70">(1)</div>
          </button>
          <button
            disabled={loading}
            onClick={() => handleRatingSubmit(Rating.Hard)}
            className="group relative px-4 py-4 rounded-2xl border-2 border-orange-500/20 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 hover:border-orange-500/40 transition-all disabled:opacity-50 active:scale-95"
          >
            <div className="text-orange-700 dark:text-orange-400 font-bold text-lg mb-1">Hard</div>
            <div className="text-xs font-medium text-orange-600/70 dark:text-orange-400/70">(2)</div>
          </button>
          <button
            disabled={loading}
            onClick={() => handleRatingSubmit(Rating.Good)}
            className="group relative px-4 py-4 rounded-2xl border-2 border-green-500/20 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 hover:border-green-500/40 transition-all disabled:opacity-50 active:scale-95"
          >
            <div className="text-green-700 dark:text-green-400 font-bold text-lg mb-1">Good</div>
            <div className="text-xs font-medium text-green-600/70 dark:text-green-400/70">(3)</div>
          </button>
          <button
            disabled={loading}
            onClick={() => handleRatingSubmit(Rating.Easy)}
            className="group relative px-4 py-4 rounded-2xl border-2 border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:border-blue-500/40 transition-all disabled:opacity-50 active:scale-95"
          >
            <div className="text-blue-700 dark:text-blue-400 font-bold text-lg mb-1">Easy</div>
            <div className="text-xs font-medium text-blue-600/70 dark:text-blue-400/70">(4)</div>
          </button>
        </div>
      </div>
    </div>
  );
}
