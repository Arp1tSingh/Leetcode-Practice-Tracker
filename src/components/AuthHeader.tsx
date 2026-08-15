import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function AuthHeader() {
  const session = await getServerSession(authOptions);
  
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 will-change-transform transform-gpu">
      <div className="container mx-auto max-w-5xl h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">LF</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline-block tracking-tight">LeetCode FSRS</span>
          </Link>
          {session?.user && (
            <nav className="flex gap-6 text-sm font-medium">
              <a href="/" className="text-muted-foreground transition-colors hover:text-foreground">Dashboard</a>
              <Link href="/problems" className="text-muted-foreground transition-colors hover:text-foreground">Problems</Link>
              <Link href="/reviews" className="text-muted-foreground transition-colors hover:text-foreground">Reviews</Link>
              <Link href="/patterns" className="text-muted-foreground transition-colors hover:text-foreground">Pattern Mastery</Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <ThemeToggle />
          {session?.user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-secondary-foreground font-bold">{session.user.name}</span>
              </div>
              <a href="/api/auth/signout" className="text-muted-foreground hover:text-foreground transition-colors">Sign out</a>
            </>
          ) : (
            <a href="/api/auth/signin" className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm transition-colors hover:bg-primary/90">
              Sign in
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
