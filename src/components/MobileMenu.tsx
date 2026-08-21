"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isLoggedIn) return null;

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background/95 border-b border-border/40 p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-2">
          <Link 
            href="/" 
            className="text-sm font-medium p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            href="/problems" 
            className="text-sm font-medium p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Problems
          </Link>
          <Link 
            href="/reviews" 
            className="text-sm font-medium p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Reviews
          </Link>
          <Link 
            href="/patterns" 
            className="text-sm font-medium p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Pattern Mastery
          </Link>
        </div>
      )}
    </div>
  );
}
