import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddProblemForm from "./AddProblemForm";
import { ListPlus } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ProblemsTableFetcher from "./ProblemsTableFetcher";

export const instant = false;

export default async function ProblemsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const userId = (session.user as any).id;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Problem Directory</h1>
        <p className="text-muted-foreground">Manage and track your LeetCode problems.</p>
      </div>
      
      <div className="glass p-4 sm:p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <ListPlus className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-bold tracking-tight">Add a new Problem</h2>
        </div>
        <AddProblemForm userId={userId} />
      </div>

      <div className="glass rounded-2xl overflow-hidden border-border/50">
        <Suspense fallback={<Skeleton className="w-full h-[500px]" />}>
          <ProblemsTableFetcher userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}
