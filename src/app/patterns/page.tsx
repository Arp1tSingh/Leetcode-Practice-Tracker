import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Target, AlertTriangle, TrendingUp, BrainCircuit } from "lucide-react";

export default async function PatternsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  // 1. Fetch all problems and their reviews for the user
  const problems = await prisma.problem.findMany({
    where: { userId: session.user.id },
    include: {
      reviews: true,
    }
  });

  // 2. Group by pattern (Note: pattern string might contain multiple comma-separated patterns, we'll split them)
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

  // 3. Compute metrics for each pattern
  const patternData = Array.from(patternMap.entries()).map(([name, stats]) => {
    // Mastery Score: Based on stability. Let's say stability of 30 days = 100% mastery.
    const avgStability = stats.stabilityCount > 0 ? stats.totalStability / stats.stabilityCount : 0;
    const masteryScore = Math.min(100, Math.round((avgStability / 30) * 100));

    // Hint Rate
    const hintRate = stats.reviewsCount > 0 ? (stats.hintCount / stats.reviewsCount) * 100 : 0;

    // Avg Time
    const avgTime = stats.timeCount > 0 ? Math.round(stats.totalTime / stats.timeCount) : 0;

    // Weakness Level Calculation
    // Formula: (100 - masteryScore) * 0.4 + (hintRate) * 0.4 + (bugs / reviews * 10) * 0.2
    const bugRate = stats.reviewsCount > 0 ? Math.min(100, (stats.bugsCount / stats.reviewsCount) * 20) : 0;
    const weaknessLevel = Math.round(((100 - masteryScore) * 0.4) + (hintRate * 0.4) + (bugRate * 0.2));

    // Target Time (heuristic: based on weakness, if weak target is higher? Or target is lower to push speed?)
    // Let's set a baseline target of 15 mins for easy, 25 for medium, 35 for hard (based on hardCount proportion)
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

  // Sort by weakness level descending
  patternData.sort((a, b) => b.weaknessLevel - a.weaknessLevel);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pattern Mastery</h1>
          <p className="text-muted-foreground mt-1">Identify your weakest problem patterns and track improvements.</p>
        </div>
        <Link href="/" className="inline-flex items-center justify-center rounded-xl bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-6 rounded-2xl border border-border/50 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Top Weakness</p>
          <p className="text-xl font-bold mt-1 text-foreground">
            {patternData.length > 0 ? patternData[0].name : 'N/A'}
          </p>
        </div>

        <div className="glass p-6 rounded-2xl border border-border/50 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
            <BrainCircuit className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Highest Mastery</p>
          <p className="text-xl font-bold mt-1 text-foreground">
            {patternData.length > 0 ? [...patternData].sort((a,b) => b.masteryScore - a.masteryScore)[0].name : 'N/A'}
          </p>
        </div>

        <div className="glass p-6 rounded-2xl border border-border/50 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
            <Target className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Patterns Tracked</p>
          <p className="text-3xl font-bold tracking-tight mt-1 text-foreground">
            {patternData.length}
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-secondary/30 text-muted-foreground font-medium border-b border-border/50">
              <tr>
                <th className="px-6 py-4">Pattern</th>
                <th className="px-6 py-4">Total Problems</th>
                <th className="px-6 py-4">Mastery Score</th>
                <th className="px-6 py-4">Weakness Level</th>
                <th className="px-6 py-4">Hint Rate</th>
                <th className="px-6 py-4">Avg Time</th>
                <th className="px-6 py-4">Target Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {patternData.map((p, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">
                    {p.name}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-medium">
                    {p.totalProblems}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all" 
                          style={{ width: `${p.masteryScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-emerald-500">{p.masteryScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            p.weaknessLevel > 70 ? 'bg-red-500' : 
                            p.weaknessLevel > 40 ? 'bg-orange-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${p.weaknessLevel}%` }}
                        />
                      </div>
                      <span className={`font-bold ${
                        p.weaknessLevel > 70 ? 'text-red-500' : 
                        p.weaknessLevel > 40 ? 'text-orange-500' : 'text-emerald-500'
                      }`}>{p.weaknessLevel}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={p.hintRate > 50 ? 'text-orange-500 font-medium' : 'text-muted-foreground'}>
                      {p.hintRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {p.avgTime}m
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {p.targetTime}m
                  </td>
                </tr>
              ))}
              {patternData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No patterns analyzed yet. Practice some problems to see stats here!
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
