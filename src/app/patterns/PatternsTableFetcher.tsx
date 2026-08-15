import { prisma } from "@/lib/prisma";
import PatternsTableClient from "./PatternsTableClient";

export default async function PatternsTableFetcher({ userId }: { userId: string }) {
  const problems = await prisma.problem.findMany({
    where: { userId },
    include: {
      reviews: true,
    }
  });

  const patternMap = new Map<string, {
    totalProblems: number,
    reviewsCount: number,
    totalStability: number,
    stabilityCount: number,
    hintCount: number,
    bugsCount: number,
    totalTime: number,
    timeCount: number,
    hardCount: number,
  }>();

  problems.forEach(p => {
    if (!p.pattern) return;
    const patterns = p.pattern.split(',').map(s => s.trim()).filter(Boolean);
    
    patterns.forEach(ptn => {
      if (!patternMap.has(ptn)) {
        patternMap.set(ptn, {
          totalProblems: 0,
          reviewsCount: 0,
          totalStability: 0,
          stabilityCount: 0,
          hintCount: 0,
          bugsCount: 0,
          totalTime: 0,
          timeCount: 0,
          hardCount: 0,
        });
      }
      
      const stats = patternMap.get(ptn)!;
      stats.totalProblems += 1;
      
      if (p.stability > 0) {
        stats.totalStability += p.stability;
        stats.stabilityCount += 1;
      }

      p.reviews.forEach(r => {
        stats.reviewsCount += 1;
        if (r.neededHint) stats.hintCount += 1;
        stats.bugsCount += r.bugsMistakes;
        if (r.timeTakenMinutes) {
          stats.totalTime += r.timeTakenMinutes;
          stats.timeCount += 1;
        }
        if (r.difficultyPerceived === 'Hard' || r.rating === 1 || r.rating === 2) {
          stats.hardCount += 1;
        }
      });
    });
  });

  const patternData = Array.from(patternMap.entries()).map(([name, stats]) => {
    const avgStability = stats.stabilityCount > 0 ? stats.totalStability / stats.stabilityCount : 0;
    const masteryScore = Math.min(100, Math.round((avgStability / 30) * 100));
    const hintRate = stats.reviewsCount > 0 ? (stats.hintCount / stats.reviewsCount) * 100 : 0;
    const avgTime = stats.timeCount > 0 ? Math.round(stats.totalTime / stats.timeCount) : 0;
    const bugRate = stats.reviewsCount > 0 ? Math.min(100, (stats.bugsCount / stats.reviewsCount) * 20) : 0;
    const weaknessLevel = Math.round(((100 - masteryScore) * 0.4) + (hintRate * 0.4) + (bugRate * 0.2));
    const hardRatio = stats.reviewsCount > 0 ? stats.hardCount / stats.reviewsCount : 0;
    const targetTime = Math.round(15 + (hardRatio * 20));

    return {
      name,
      totalProblems: stats.totalProblems,
      masteryScore,
      weaknessLevel,
      hintRate: Math.round(hintRate),
      avgTime,
      targetTime,
    };
  });

  patternData.sort((a, b) => b.weaknessLevel - a.weaknessLevel);

  return <PatternsTableClient patterns={patternData} />;
}
