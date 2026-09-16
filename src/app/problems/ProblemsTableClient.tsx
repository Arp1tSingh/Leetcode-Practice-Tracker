"use client";

import Link from 'next/link';

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
  return (
    <div className="overflow-x-auto w-full rounded-2xl">
      <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
        <thead className="text-xs uppercase text-muted-foreground border-b border-border/50">
          <tr>
            <th className="px-4 py-4 font-semibold tracking-wider sticky top-16 z-30 bg-secondary/95 backdrop-blur-md">ID</th>
            <th className="px-4 py-4 font-semibold tracking-wider sticky top-16 z-30 bg-secondary/95 backdrop-blur-md">Problem Name</th>
            <th className="px-4 py-4 font-semibold tracking-wider sticky top-16 z-30 bg-secondary/95 backdrop-blur-md">Difficulty</th>
            <th className="px-4 py-4 font-semibold tracking-wider sticky top-16 z-30 bg-secondary/95 backdrop-blur-md">Pattern</th>
            <th className="px-4 py-4 font-semibold tracking-wider sticky top-16 z-30 bg-secondary/95 backdrop-blur-md">First Solved</th>
            <th className="px-4 py-4 font-semibold tracking-wider sticky top-16 z-30 bg-secondary/95 backdrop-blur-md">Last Review</th>
            <th className="px-4 py-4 font-semibold tracking-wider sticky top-16 z-30 bg-secondary/95 backdrop-blur-md">State</th>
            <th className="px-4 py-4 font-semibold tracking-wider sticky top-16 z-30 bg-secondary/95 backdrop-blur-md">Reps (Lapses)</th>
            <th className="px-4 py-4 font-semibold tracking-wider sticky top-16 z-30 bg-secondary/95 backdrop-blur-md">Scratch %</th>
            <th className="px-4 py-4 font-semibold tracking-wider sticky top-16 z-30 bg-secondary/95 backdrop-blur-md">Hint %</th>
            <th className="px-4 py-4 font-semibold tracking-wider sticky top-16 z-30 bg-secondary/95 backdrop-blur-md">Avg Time</th>
            <th className="px-4 py-4 font-semibold tracking-wider sticky top-16 z-30 bg-secondary/95 backdrop-blur-md">Next Review</th>
            <th className="px-4 py-4 font-semibold tracking-wider sticky top-16 z-30 bg-secondary/95 backdrop-blur-md">S (D)</th>
            <th className="px-4 py-4 font-semibold tracking-wider sticky top-16 z-30 bg-secondary/95 backdrop-blur-md">Interval</th>
            <th className="px-4 py-4 font-semibold tracking-wider sticky top-16 z-30 bg-secondary/95 backdrop-blur-md text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {problems.length === 0 && (
            <tr>
              <td colSpan={15} className="px-4 py-12 text-center text-muted-foreground bg-background/50">
                <p className="font-medium text-base mb-1">No problems tracked yet.</p>
                <p className="text-sm">Add one above or sync your profile on the dashboard.</p>
              </td>
            </tr>
          )}
          
          {problems.map((p) => {
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
                    className="inline-flex items-center justify-center px-3 py-1 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all active:scale-95 shadow-sm text-xs"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
