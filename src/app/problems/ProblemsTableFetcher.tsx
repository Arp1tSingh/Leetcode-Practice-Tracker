import { prisma } from "@/lib/prisma";
import ProblemsTableClient from "./ProblemsTableClient";

export default async function ProblemsTableFetcher({ userId }: { userId: string }) {
  const rawProblems = await prisma.problem.findMany({
    where: { userId },
    include: { reviews: true },
    orderBy: {
      leetcodeId: 'asc',
    },
  });

  const problems = rawProblems.map(p => {
    const firstSolvedDate = p.reviews.length > 0 ? new Date(Math.min(...p.reviews.map(r => r.reviewedAt.getTime()))) : null;
    const solvedFromScratchCount = p.reviews.filter(r => r.solvedFromScratch).length;
    const hintCount = p.reviews.filter(r => r.neededHint).length;
    
    const scratchPercentage = p.reviews.length > 0 ? Math.round((solvedFromScratchCount / p.reviews.length) * 100) : 0;
    const hintPercentage = p.reviews.length > 0 ? Math.round((hintCount / p.reviews.length) * 100) : 0;
    
    const times = p.reviews.map(r => r.timeTakenMinutes).filter(t => t !== null) as number[];
    const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

    return {
      id: p.id,
      leetcodeId: p.leetcodeId,
      title: p.title,
      difficulty: p.difficulty,
      pattern: p.pattern,
      firstSolvedStr: firstSolvedDate ? firstSolvedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
      lastReviewStr: p.lastReview ? p.lastReview.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
      stateText: p.state === 0 ? 'New' : p.state === 1 ? 'Learning' : p.state === 2 ? 'Review' : 'Relearning',
      reps: p.reps,
      lapses: p.lapses,
      scratchPercentage,
      hintPercentage,
      avgTimeStr: avgTime > 0 ? `${avgTime}m` : '-',
      nextReviewStr: p.nextReview ? p.nextReview.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Now',
      stabilityStr: `${p.stability.toFixed(1)} (${p.difficultyWeight.toFixed(1)})`,
      scheduledDays: p.scheduledDays
    };
  });

  return <ProblemsTableClient problems={problems} />;
}
