import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import SyncLeetcodeSection from "@/components/SyncLeetcodeSection";
import { BookOpen, Target, Activity, CheckCircle2 } from "lucide-react";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const userId = (session.user as any).id;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leetcodeUsername: true }
  });

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

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">LeetCode Spaced Repetition (FSRS) Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session.user.name?.split(' ')[0] || 'Developer'}! Here's your overview for today.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
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

      <SyncLeetcodeSection userId={userId} initialUsername={user?.leetcodeUsername || null} />

      <div className="glass p-6 rounded-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold tracking-tight">Today's Recommended Queue</h2>
          <Link href="/problems" className="text-sm font-medium text-primary hover:underline underline-offset-4">
            Manage Problems &rarr;
          </Link>
        </div>
        
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold mb-1">You're all caught up!</h3>
            <p className="text-muted-foreground max-w-sm">You have reviewed all your scheduled problems for today. Great job!</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border/50 uppercase tracking-wider">
                  <th className="pb-3 font-medium">Rank</th>
                  <th className="pb-3 font-medium">Problem ID</th>
                  <th className="pb-3 font-medium">Problem Name</th>
                  <th className="pb-3 font-medium">Difficulty</th>
                  <th className="pb-3 font-medium">Pattern</th>
                  <th className="pb-3 font-medium">Retrievability</th>
                  <th className="pb-3 font-medium">Priority</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {queue.map((problem, idx) => {
                  const difficultyClass = problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard';
                  const elapsedDays = problem.lastReview ? (now.getTime() - problem.lastReview.getTime()) / (1000 * 60 * 60 * 24) : 0;
                  const R = problem.stability > 0 ? Math.exp(Math.log(0.9) * (elapsedDays / problem.stability)) * 100 : 0;
                  
                  return (
                    <tr key={problem.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="py-4 text-muted-foreground font-medium">#{idx + 1}</td>
                      <td className="py-4 text-muted-foreground">{problem.leetcodeId}</td>
                      <td className="py-4 font-semibold">{problem.title}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${difficultyClass}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="py-4">
                        {problem.pattern && (
                          <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md text-xs font-medium">
                            {problem.pattern}
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {problem.state === 0 ? 'N/A' : `${R.toFixed(1)}%`}
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-md text-xs font-medium">
                          High
                        </span>
                      </td>
                      <td className="py-4 text-right">
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
        )}
      </div>
    </div>
  );
}
