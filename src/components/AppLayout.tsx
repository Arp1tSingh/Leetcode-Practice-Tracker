import { Suspense } from "react";
import AuthHeader from "./AuthHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<header className="sticky top-0 z-50 w-full h-16 glass border-b border-border/40" />}>
        <AuthHeader />
      </Suspense>
      <main className="flex-1 container mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>
    </>
  );
}
