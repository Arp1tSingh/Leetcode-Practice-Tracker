import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export async function DashboardQueue({ userId }: { userId: string }) {
  const now = new Date();
  // Today's Queue
  const queue = await prisma.problem.findMany({
    where: {
      userId,
      nextReview: {
        lte: now,
      },
    },
    orderBy: {
      nextReview: 'asc',
    },
  });

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold mb-1">You're all caught up!</h3>
        <p className="text-muted-foreground max-w-sm">You have reviewed all your scheduled problems for today. Great job!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="text-xs text-muted-foreground border-b border-border/50 uppercase tracking-wider">
            <th className="pb-3 px-4 font-medium">Rank</th>
            <th className="pb-3 px-4 font-medium">Problem ID</th>
            <th className="pb-3 px-4 font-medium">Problem Name</th>
            <th className="pb-3 px-4 font-medium">Difficulty</th>
            <th className="pb-3 px-4 font-medium">Pattern</th>
            <th className="pb-3 px-4 font-medium">Retrievability</th>
            <th className="pb-3 px-4 font-medium">Priority</th>
            <th className="pb-3 px-4 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {queue.map((problem, idx) => {
            const difficultyClass = problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard';
            const elapsedDays = problem.lastReview ? (now.getTime() - problem.lastReview.getTime()) / (1000 * 60 * 60 * 24) : 0;
            const R = problem.stability > 0 ? Math.exp(Math.log(0.9) * (elapsedDays / problem.stability)) * 100 : 0;
            
            return (
              <tr key={problem.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-4 py-4 text-muted-foreground font-medium">#{idx + 1}</td>
                <td className="px-4 py-4 text-muted-foreground">{problem.leetcodeId}</td>
                <td className="px-4 py-4 font-semibold">{problem.title}</td>
                <td className="px-4 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${difficultyClass}`}>
                    {problem.difficulty}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {problem.pattern && (
                    <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md text-xs font-medium">
                      {problem.pattern}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {problem.state === 0 ? 'N/A' : `${R.toFixed(1)}%`}
                </td>
                <td className="px-4 py-4">
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-md text-xs font-medium">
                    High
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <Link 
                    href={`/review/${problem.id}`}
                    className="inline-flex items-center justify-center px-4 py-1.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all active:scale-95 shadow-sm text-xs"
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
  )
}
