import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PatternsTableFetcher from "./PatternsTableFetcher";

export default async function PatternsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

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

      <Suspense fallback={<Skeleton className="w-full h-[500px]" />}>
        <PatternsTableFetcher userId={session.user.id} />
      </Suspense>
    </div>
  );
}
