import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu } from "@/components/MobileMenu";
import { UserProfileButton } from "@/components/UserProfileButton";
import { prisma } from "@/lib/prisma";

export default async function AuthHeader() {
  const session = await getServerSession(authOptions);
  
  let dbUser = null;
  if (session?.user) {
    const userId = (session.user as any).id;
    dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { leetcodeUsername: true, email: true, username: true, name: true }
    });
  }

  const profileUser = session?.user ? {
    id: (session.user as any).id,
    name: session.user.name || dbUser?.name || dbUser?.username || 'Developer',
    username: dbUser?.username || null,
    email: session.user.email || dbUser?.email || null,
    leetcodeUsername: dbUser?.leetcodeUsername || null,
  } : null;
  
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/40 bg-background/95 will-change-transform transform-gpu">
      <div className="container mx-auto max-w-7xl h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          <MobileMenu isLoggedIn={!!session?.user} user={profileUser} />
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">LF</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline-block tracking-tight">LeetCode FSRS</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            {session?.user ? (
              <>
                <a href="/" className="text-muted-foreground transition-colors hover:text-foreground">Dashboard</a>
                <Link href="/problems" className="text-muted-foreground transition-colors hover:text-foreground">Problems</Link>
                <Link href="/reviews" className="text-muted-foreground transition-colors hover:text-foreground">Reviews</Link>
                <Link href="/patterns" className="text-muted-foreground transition-colors hover:text-foreground">Pattern Mastery</Link>
                <Link href="/how-to-use" className="text-muted-foreground transition-colors hover:text-foreground">How to Use</Link>
              </>
            ) : (
              <>
                <Link href="/how-to-use" className="text-muted-foreground transition-colors hover:text-foreground">How to Use</Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3 md:gap-4 text-sm font-medium">
          <ThemeToggle />
          {profileUser ? (
            <UserProfileButton user={profileUser} />
          ) : (
            <a href="/api/auth/signin" className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm transition-colors hover:bg-primary/90 whitespace-nowrap">
              Sign in
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
