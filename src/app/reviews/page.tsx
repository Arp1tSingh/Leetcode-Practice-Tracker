import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Clock, Code2, BrainCircuit, AlertCircle, TrendingUp } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const reviews = await prisma.review.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      problem: true,
    },
    orderBy: {
      reviewedAt: 'desc',
    },
  });

  const ratingMap: Record<number, { label: string, color: string }> = {
    1: { label: 'Again', color: 'text-red-500 bg-red-500/10' },
    2: { label: 'Hard', color: 'text-orange-500 bg-orange-500/10' },
    3: { label: 'Good', color: 'text-green-500 bg-green-500/10' },
    4: { label: 'Easy', color: 'text-blue-500 bg-blue-500/10' },
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review History</h1>
          <p className="text-muted-foreground mt-1">Detailed log of your practice sessions.</p>
        </div>
        <Link href="/" className="inline-flex items-center justify-center rounded-xl bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <div className="glass rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-secondary/30 text-muted-foreground font-medium border-b border-border/50">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Problem</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Pattern</th>
                <th className="px-6 py-4">Bugs</th>
                <th className="px-6 py-4">Difficulty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {reviews.map((review) => {
                const ratingInfo = ratingMap[review.rating] || { label: 'Unknown', color: 'text-muted-foreground bg-muted' };
                return (
                  <tr key={review.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex flex-col">
                        <span>{format(new Date(review.reviewedAt), 'MMM d, yyyy')}</span>
                        <span className="text-xs">{format(new Date(review.reviewedAt), 'h:mm a')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <a 
                        href={`https://leetcode.com/problems/${review.problem.titleSlug}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline hover:text-primary transition-colors"
                      >
                        {review.problem.leetcodeId}. {review.problem.title}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ratingInfo.color}`}>
                        {ratingInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {review.timeTakenMinutes ? `${review.timeTakenMinutes}m` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {review.solvedFromScratch && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium" title="Solved from Scratch">Scratch</span>
                        )}
                        {review.neededHint && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium" title="Needed Hint">Hint</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {review.rememberedPattern ? (
                        <span className="text-emerald-500 flex items-center gap-1"><BrainCircuit className="w-3.5 h-3.5" /> Yes</span>
                      ) : (
                        <span className="text-destructive flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> No</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={review.bugsMistakes > 0 ? "text-destructive font-medium" : "text-muted-foreground"}>
                        {review.bugsMistakes}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        ${review.difficultyPerceived === 'Hard' ? 'text-red-500' : ''}
                        ${review.difficultyPerceived === 'Medium' ? 'text-orange-500' : ''}
                        ${review.difficultyPerceived === 'Easy' ? 'text-emerald-500' : ''}
                      `}>
                        {review.difficultyPerceived}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    No reviews found. Start practicing to see your history here!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
