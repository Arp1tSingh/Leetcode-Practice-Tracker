import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SyncLeetcodeSection from "@/components/SyncLeetcodeSection";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardMetrics } from "./DashboardMetrics";
import { DashboardQueue } from "./DashboardQueue";
import { LandingPage } from "@/components/landing/LandingPage";
import AppLayout from "@/components/AppLayout";

export const instant = false;

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <LandingPage />;
  }

  const userId = (session.user as any).id;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leetcodeUsername: true }
  });

  return (
    <AppLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">LeetCode Spaced Repetition (FSRS) Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user.name?.split(' ')[0] || 'Developer'}! Here's your overview for today.</p>
        </div>
        
        <Suspense fallback={<Skeleton className="w-full h-32" />}>
          <DashboardMetrics userId={userId} />
        </Suspense>

        <SyncLeetcodeSection userId={userId} initialUsername={user?.leetcodeUsername || null} />

        <div className="glass p-4 sm:p-6 rounded-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold tracking-tight">Today's Recommended Queue</h2>
            <Link href="/problems" className="text-sm font-medium text-primary hover:underline underline-offset-4 self-start sm:self-auto">
              Manage Problems &rarr;
            </Link>
          </div>
          
          <Suspense fallback={<Skeleton className="w-full h-64" />}>
            <DashboardQueue userId={userId} />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  );
}
