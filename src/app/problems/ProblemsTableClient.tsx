"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, ArrowRight } from 'lucide-react';

export type ProblemProp = {
  id: string;
  leetcodeId: number;
  title: string;
  difficulty: string;
  pattern: string | null;
  firstSolvedStr: string;
  lastReviewStr: string;
  stateText: string;
  reps: number;
  lapses: number;
  scratchPercentage: number;
  hintPercentage: number;
  avgTimeStr: string;
  nextReviewStr: string;
  stabilityStr: string;
  scheduledDays: number;
};

export default function ProblemsTableClient({ problems }: { problems: ProblemProp[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      if (difficultyFilter !== 'All' && p.difficulty !== difficultyFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const idStr = p.leetcodeId.toString();
      const titleMatch = p.title.toLowerCase().includes(q);
      const idMatch = idStr === q || idStr.includes(q) || `#${idStr}`.includes(q);
      const patternMatch = p.pattern ? p.pattern.toLowerCase().includes(q) : false;
      const diffMatch = p.difficulty.toLowerCase().includes(q);

      return titleMatch || idMatch || patternMatch || diffMatch;
    });
  }, [problems, searchQuery, difficultyFilter]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-border/50 bg-card">
      {/* Search & Filter Toolbar */}
      <div className="p-4 border-b border-border/50 bg-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by name, #ID, or pattern..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-xs sm:text-sm transition-all placeholder:text-muted-foreground/50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                difficultyFilter === diff
                  ? diff === 'Easy'
                    ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                    : diff === 'Medium'
                    ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                    : diff === 'Hard'
                    ? 'bg-rose-500/20 text-rose-500 border-rose-500/40'
                    : 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary/40 text-muted-foreground hover:text-foreground border-border/50'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
          <thead className="text-xs uppercase text-muted-foreground border-b border-border/50 bg-secondary/40">
            <tr>
              <th className="px-4 py-4 font-semibold tracking-wider">ID</th>
              <th className="px-4 py-4 font-semibold tracking-wider">Problem Name</th>
              <th className="px-4 py-4 font-semibold tracking-wider">Difficulty</th>
              <th className="px-4 py-4 font-semibold tracking-wider">Pattern</th>
              <th className="px-4 py-4 font-semibold tracking-wider">First Solved</th>
              <th className="px-4 py-4 font-semibold tracking-wider">Last Review</th>
              <th className="px-4 py-4 font-semibold tracking-wider">State</th>
              <th className="px-4 py-4 font-semibold tracking-wider">Reps (Lapses)</th>
              <th className="px-4 py-4 font-semibold tracking-wider">Scratch %</th>
              <th className="px-4 py-4 font-semibold tracking-wider">Hint %</th>
              <th className="px-4 py-4 font-semibold tracking-wider">Avg Time</th>
              <th className="px-4 py-4 font-semibold tracking-wider">Next Review</th>
              <th className="px-4 py-4 font-semibold tracking-wider">S (D)</th>
              <th className="px-4 py-4 font-semibold tracking-wider">Interval</th>
              <th className="px-4 py-4 font-semibold tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredProblems.length === 0 && (
              <tr>
                <td colSpan={15} className="px-4 py-12 text-center text-muted-foreground bg-background/50">
                  <p className="font-medium text-base mb-1">No matching problems found.</p>
                  <p className="text-sm">Try clearing your search query or difficulty filter.</p>
                </td>
              </tr>
            )}
            
            {filteredProblems.map((p) => {
              const difficultyClass = p.difficulty === 'Easy' ? 'badge-easy' : p.difficulty === 'Medium' ? 'badge-medium' : p.difficulty === 'Hard' ? 'badge-hard' : 'bg-secondary text-secondary-foreground';
              
              return (
                <tr 
                  key={p.id} 
                  className="bg-background/50 hover:bg-background transition-colors group virtual-row"
                >
                  <td className="px-4 py-3 font-medium text-muted-foreground">{p.leetcodeId}</td>
                  <td className="px-4 py-3 font-semibold truncate max-w-[200px]" title={p.title}>{p.title}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${difficultyClass}`}>
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.pattern ? (
                      <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md text-xs font-medium truncate max-w-[150px] inline-block" title={p.pattern}>
                        {p.pattern}
                      </span>
                    ) : <span className="text-muted-foreground/50">-</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.firstSolvedStr}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.lastReviewStr}</td>
                  <td className="px-4 py-3"><span className="text-xs font-medium">{p.stateText}</span></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.reps} ({p.lapses})</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.scratchPercentage}%</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.hintPercentage}%</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.avgTimeStr}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.nextReviewStr}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.stabilityStr}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.scheduledDays}d</td>
                  <td className="px-4 py-3 text-right">
                    <Link 
                      href={`/review/${p.id}`}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-xs text-xs cursor-pointer"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
