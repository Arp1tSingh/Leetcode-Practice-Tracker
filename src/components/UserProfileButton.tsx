'use client';

import { useState } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { ProfileModal, ProfileUser } from './ProfileModal';

export function UserProfileButton({
  user,
  className = '',
  mobile = false,
}: {
  user: ProfileUser;
  className?: string;
  mobile?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const displayName = user.name || user.username || 'Developer';

  if (mobile) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center justify-between w-full p-2.5 rounded-xl bg-secondary/40 hover:bg-secondary border border-border/50 text-sm font-semibold transition-colors ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="truncate">{displayName} (Profile & Sync)</span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>

        <ProfileModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          user={user}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary/80 border border-border/50 hover:border-border transition-all cursor-pointer group shadow-sm active:scale-[0.98] ${className}`}
        title="Open Profile & Integrations"
        aria-label="Open Profile & Integrations"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-secondary-foreground font-semibold truncate max-w-[130px] group-hover:text-foreground">
          {displayName}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-y-0.5 transition-transform" />
      </button>

      <ProfileModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        user={user}
      />
    </>
  );
}
