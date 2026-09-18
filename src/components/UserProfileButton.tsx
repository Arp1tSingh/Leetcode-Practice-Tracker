'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  ExternalLink, 
  LogOut, 
  HelpCircle, 
  Settings2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { ProfileModal, ProfileUser } from './ProfileModal';
import { ContactModal } from './ContactModal';

export function UserProfileButton({
  user,
  className = '',
  mobile = false,
}: {
  user: ProfileUser;
  className?: string;
  mobile?: boolean;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = user.name || user.username || 'Developer';
  const hasLc = Boolean(user.leetcodeUsername);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  if (mobile) {
    return (
      <div className="w-full">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center justify-between w-full p-2.5 rounded-xl bg-secondary/40 hover:bg-secondary border border-border/50 text-sm font-semibold transition-colors ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="truncate">{displayName}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="mt-2 w-full p-3 rounded-2xl bg-card border border-border/80 shadow-lg space-y-2 animate-in fade-in-50 duration-150">
            {/* User Details */}
            <div className="p-2.5 rounded-xl bg-secondary/30 border border-border/40">
              <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
              {user.email && <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>}
              <div className="mt-1 flex items-center gap-1 text-[11px]">
                {hasLc ? (
                  <span className="text-emerald-500 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> @{user.leetcodeUsername}
                  </span>
                ) : (
                  <span className="text-amber-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> LeetCode not linked
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                setIsSyncModalOpen(true);
              }}
              className="flex items-center gap-2.5 w-full p-2.5 rounded-xl hover:bg-secondary/60 text-xs font-medium text-foreground transition-colors text-left"
            >
              <Settings2 className="w-4 h-4 text-primary" />
              <span>LeetCode Integrations & Sync</span>
            </button>

            <button
              onClick={() => {
                setIsDropdownOpen(false);
                setIsContactModalOpen(true);
              }}
              className="flex items-center gap-2.5 w-full p-2.5 rounded-xl hover:bg-secondary/60 text-xs font-medium text-foreground transition-colors text-left"
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Contact for Help</span>
            </button>

            <Link
              href="/signout"
              className="flex items-center gap-2.5 w-full p-2.5 rounded-xl hover:bg-destructive/10 text-xs font-semibold text-destructive transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Link>
          </div>
        )}

        <ProfileModal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
          user={user}
        />

        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          userName={displayName}
          userEmail={user.email}
          leetcodeUsername={user.leetcodeUsername}
        />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary/80 border border-border/50 hover:border-border transition-all cursor-pointer group shadow-xs active:scale-[0.98] ${className}`}
        title="Open Profile & Actions"
        aria-label="Open Profile & Actions"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-secondary-foreground font-semibold truncate max-w-[130px] group-hover:text-foreground">
          {displayName}
        </span>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Rectangular Profile Dropdown Menu */}
      {isDropdownOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-88 max-w-sm bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl z-50 overflow-hidden text-foreground animate-in fade-in zoom-in-95 duration-150"
          style={{ transformOrigin: 'top right' }}
        >
          {/* Header Card */}
          <div className="p-4 border-b border-border/60 bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-base shadow-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Active
                  </span>
                </div>
                {user.email && (
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                )}
              </div>
            </div>

            {/* LeetCode Sync Pill */}
            <div className="mt-3 p-2 rounded-xl bg-background/60 border border-border/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <RefreshCw className="w-3.5 h-3.5 text-primary shrink-0" />
                {hasLc ? (
                  <span className="truncate text-muted-foreground">
                    LeetCode: <strong className="text-foreground">@{user.leetcodeUsername}</strong>
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    LeetCode not linked
                  </span>
                )}
              </div>
              {hasLc && (
                <a
                  href={`https://leetcode.com/u/${user.leetcodeUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors p-1"
                  title="View on LeetCode"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Menu Items (Rectangular Sections) */}
          <div className="p-2 space-y-1">
            
            {/* 1. Manage LeetCode & Sync */}
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                setIsSyncModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/70 text-left transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <Settings2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">Integrations & Sync</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  Bookmarklet, CSV import & username
                </p>
              </div>
            </button>

            {/* 2. Contact for Help (anti-spam protected) */}
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                setIsContactModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/70 text-left transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-foreground">Contact for Help</p>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-primary/10 text-primary uppercase">
                    Support
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  Reach out directly to Arpit
                </p>
              </div>
            </button>
          </div>

          {/* Footer & Sign Out */}
          <div className="p-2 border-t border-border/60 bg-secondary/15 flex items-center justify-between">
            <Link
              href="/privacy"
              onClick={() => setIsDropdownOpen(false)}
              className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 transition-colors"
            >
              Privacy & Legal
            </Link>

            <Link
              href="/signout"
              onClick={() => setIsDropdownOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-destructive hover:bg-destructive/10 border border-destructive/20 transition-all active:scale-[0.98]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Link>
          </div>
        </div>
      )}

      {/* LeetCode Sync Dialog */}
      <ProfileModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        user={user}
      />

      {/* Contact for Help Dialog */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        userName={displayName}
        userEmail={user.email}
        leetcodeUsername={user.leetcodeUsername}
      />
    </div>
  );
}
