import { prisma } from "@/lib/prisma";
import { BookOpen, Target, Activity, CheckCircle2 } from "lucide-react";

export async function DashboardMetrics({ userId }: { userId: string }) {
  "use cache";
  
  // Top Metrics
  const totalProblems = await prisma.problem.count({
    where: { userId },
  });

  const reviewsCompleted = await prisma.review.count({
    where: { userId },
  });

  const allActiveProblems = await prisma.problem.findMany({
    where: { userId, state: { not: 0 } },
    select: { lastReview: true, stability: true }
  });

  const now = new Date();
  let avgRetrievability = 0;
  if (allActiveProblems.length > 0) {
    const sumR = allActiveProblems.reduce((acc, p) => {
      const elapsedDays = p.lastReview ? (now.getTime() - p.lastReview.getTime()) / (1000 * 60 * 60 * 24) : 0;
      const R = p.stability > 0 ? Math.exp(Math.log(0.9) * (elapsedDays / p.stability)) : 0;
      return acc + R;
    }, 0);
    avgRetrievability = (sumR / allActiveProblems.length) * 100;
  }

  const dueTodayCount = await prisma.problem.count({
    where: {
      userId,
      nextReview: {
        lte: now,
      },
    },
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div className="p-5 rounded-2xl glass card-hover flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground">Total Problems</h2>
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <p className="text-3xl font-bold tracking-tight">{totalProblems}</p>
      </div>
      
      <div className="p-5 rounded-2xl glass card-hover flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground">Reviews Completed</h2>
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <p className="text-3xl font-bold tracking-tight">{reviewsCompleted}</p>
      </div>

      <div className="p-5 rounded-2xl glass card-hover flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground">Avg Retrievability</h2>
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-3xl font-bold tracking-tight">{avgRetrievability.toFixed(1)}</p>
          <span className="text-sm text-muted-foreground font-medium">%</span>
        </div>
      </div>

      <div className="p-5 rounded-2xl glass card-hover flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground">Due Today / Urgent</h2>
          <div className="p-2 bg-rose-500/10 rounded-lg">
            <Target className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">{dueTodayCount}</p>
        </div>
      </div>
    </div>
  )
}
