import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import SyncLeetcodeSection from "@/components/SyncLeetcodeSection";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardMetrics } from "./DashboardMetrics";
import { DashboardQueue } from "./DashboardQueue";

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

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">LeetCode Spaced Repetition (FSRS) Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session.user.name?.split(' ')[0] || 'Developer'}! Here's your overview for today.</p>
      </div>
      
      <Suspense fallback={<Skeleton className="w-full h-32" />}>
        <DashboardMetrics userId={userId} />
      </Suspense>

      <SyncLeetcodeSection userId={userId} initialUsername={user?.leetcodeUsername || null} />

      <div className="glass p-6 rounded-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold tracking-tight">Today's Recommended Queue</h2>
          <Link href="/problems" className="text-sm font-medium text-primary hover:underline underline-offset-4">
            Manage Problems &rarr;
          </Link>
        </div>
        
        <Suspense fallback={<Skeleton className="w-full h-64" />}>
          <DashboardQueue userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}
