import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AddProblemForm from "./AddProblemForm";
import { ListPlus } from "lucide-react";

export default async function ProblemsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const userId = (session.user as any).id;

  const problems = await prisma.problem.findMany({
    where: { userId },
    include: { reviews: true },
    orderBy: {
      leetcodeId: 'asc',
    },
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Problem Directory</h1>
        <p className="text-muted-foreground">Manage and track your LeetCode problems.</p>
      </div>
      
      <div className="glass p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-6">
          <ListPlus className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-bold tracking-tight">Add a new Problem</h2>
        </div>
        <AddProblemForm userId={userId} />
      </div>

      <div className="glass rounded-2xl overflow-hidden border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
            <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground">
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
                const stateText = p.state === 0 ? 'New' : p.state === 1 ? 'Learning' : p.state === 2 ? 'Review' : 'Relearning';
                
                // Aggregations
                const firstSolvedDate = p.reviews.length > 0 ? new Date(Math.min(...p.reviews.map(r => r.reviewedAt.getTime()))) : null;
                const solvedFromScratchCount = p.reviews.filter(r => r.solvedFromScratch).length;
                const hintCount = p.reviews.filter(r => r.neededHint).length;
                
                const scratchPercentage = p.reviews.length > 0 ? Math.round((solvedFromScratchCount / p.reviews.length) * 100) : 0;
                const hintPercentage = p.reviews.length > 0 ? Math.round((hintCount / p.reviews.length) * 100) : 0;
                
                const times = p.reviews.map(r => r.timeTakenMinutes).filter(t => t !== null) as number[];
                const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
                
                return (
                  <tr key={p.id} className="bg-background/50 hover:bg-background transition-colors group">
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
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {firstSolvedDate ? firstSolvedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {p.lastReview ? p.lastReview.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium">{stateText}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {p.reps} ({p.lapses})
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {scratchPercentage}%
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {hintPercentage}%
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {avgTime > 0 ? `${avgTime}m` : '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {p.nextReview ? new Date(p.nextReview).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Now'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {p.stability.toFixed(1)} ({p.difficultyWeight.toFixed(1)})
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {p.scheduledDays}d
                    </td>
                    <td className="px-4 py-3 text-right">
                       <a 
                        href={`/review/${p.id}`}
                        className="inline-flex items-center justify-center px-3 py-1 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all active:scale-95 shadow-sm text-xs"
                      >
                        Review
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
