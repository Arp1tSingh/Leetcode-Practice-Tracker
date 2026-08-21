import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReviewForm from "./ReviewForm";
import Link from "next/link";
import { ExternalLink, X, BrainCircuit } from "lucide-react";

export const instant = false;

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }
  const { id } = await params;
  const userId = (session.user as any).id;

  const problem = await prisma.problem.findUnique({
    where: { id },
  });

  if (!problem || problem.userId !== userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Problem not found</h1>
        <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all shadow-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const difficultyClass = problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : problem.difficulty === 'Hard' ? 'badge-hard' : 'bg-secondary text-secondary-foreground';

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Focus Session</h1>
        </div>
        <Link 
          href="/" 
          className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          title="Exit Session"
        >
          <X className="w-5 h-5" />
        </Link>
      </div>
      
      <div className="glass p-8 rounded-3xl modern-shadow relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">{problem.leetcodeId}. {problem.title}</h2>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${difficultyClass}`}>
                {problem.difficulty}
              </span>
              {problem.pattern && (
                <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                  {problem.pattern}
                </span>
              )}
            </div>
          </div>
          <a 
            href={`https://leetcode.com/problems/${problem.titleSlug}/`} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl font-medium transition-colors whitespace-nowrap"
          >
            Solve on LeetCode <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <ReviewForm userId={userId} problemId={problem.id} />
      </div>
    </div>
  );
}
