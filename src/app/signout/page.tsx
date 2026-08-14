'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogOut, ArrowLeft, BookOpen } from 'lucide-react';

export default function SignOutPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6 shadow-lg shadow-destructive/10">
            <BookOpen className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Sign Out</h1>
          <p className="text-muted-foreground">Are you sure you want to log out of your session?</p>
        </div>

        {/* Action Card */}
        <div className="glass p-8 rounded-3xl border border-border/50 animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both shadow-2xl flex flex-col gap-4">
          
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full py-3.5 rounded-xl bg-destructive text-destructive-foreground font-semibold text-sm transition-all hover:bg-destructive/90 active:scale-[0.98] shadow-md flex items-center justify-center gap-2 group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Yes, Sign me out
          </button>

          <button
            onClick={() => router.back()}
            className="w-full py-3.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm transition-all hover:bg-secondary/80 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Cancel, return to app
          </button>

        </div>
      </div>
    </div>
  );
}
