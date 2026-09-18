'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { 
  X, 
  User, 
  ExternalLink, 
  LogOut, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import SyncLeetcodeSection from './SyncLeetcodeSection';
import { ContactModal } from './ContactModal';
import { deleteAccountAction } from '@/lib/actions';

export interface ProfileUser {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  leetcodeUsername?: string | null;
}

export function ProfileModal({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: ProfileUser;
}) {
  const [currentLcUsername, setCurrentLcUsername] = useState(user.leetcodeUsername || null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Delete account modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentLcUsername(user.leetcodeUsername || null);
  }, [user.leetcodeUsername]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDeleteModalOpen) {
          setIsDeleteModalOpen(false);
        } else if (isContactOpen) {
          setIsContactOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, isDeleteModalOpen, isContactOpen]);

  const handleDeleteAccount = async () => {
    if (deleteConfirmInput.trim() !== 'DELETE') return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await deleteAccountAction(user.id);
      if (res.error) {
        setDeleteError(res.error);
        setIsDeleting(false);
      } else {
        await signOut({ callbackUrl: '/login?deleted=true' });
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const displayName = user.name || user.username || 'Developer';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-[9999] overflow-y-auto bg-background/80 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start sm:items-center animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleteModalOpen) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col rounded-3xl border border-border/70 shadow-2xl overflow-hidden bg-card text-foreground animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border/50 bg-secondary/20">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shadow-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="profile-modal-title" className="text-xl font-bold tracking-tight">
                  {displayName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck className="w-3 h-3" />
                  Account
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                {user.email && <span>{user.email}</span>}
                {user.email && <span className="opacity-40">•</span>}
                {currentLcUsername ? (
                  <a
                    href={`https://leetcode.com/u/${currentLcUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    LeetCode: @{currentLcUsername}
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    LeetCode not connected
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            aria-label="Close profile modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-7">
          <div className="space-y-2">
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              Integrations & Synchronization
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Configure your LeetCode username for automated background sync on visit, bulk import past problem solutions from CSV, or use the one-click bookmarklet sync tool.
            </p>
          </div>

          <SyncLeetcodeSection
            userId={user.id}
            initialUsername={currentLcUsername}
            embedded={true}
            onUsernameSaved={(newUsername) => setCurrentLcUsername(newUsername)}
          />

          {/* Danger Zone */}
          <div className="pt-6 border-t border-destructive/20 space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-xs font-bold tracking-wider uppercase">Danger Zone</h3>
            </div>

            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Delete Account</h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                  Permanently delete your account and wipe all stored data including problems, spaced repetition review logs, and statistics. This action is irreversible.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setDeleteConfirmInput('');
                  setIsDeleteModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold transition-all shadow-sm active:scale-[0.98] shrink-0 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 border-t border-border/50 bg-secondary/20">
          <button
            type="button"
            onClick={() => setIsContactOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-border/50 transition-colors w-full sm:w-auto justify-center cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-500" />
            Contact for Help
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border/60 text-sm font-medium hover:bg-secondary/60 transition-colors cursor-pointer"
            >
              Close
            </button>
            <Link
              href="/signout"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Link>
          </div>
        </div>
      </div>

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        userName={displayName}
        userEmail={user.email}
        leetcodeUsername={currentLcUsername}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen &&
        createPortal(
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="fixed inset-0 z-[10000] overflow-y-auto bg-background/80 backdrop-blur-md p-4 flex justify-center items-center animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isDeleting) {
                setIsDeleteModalOpen(false);
              }
            }}
          >
            <div className="relative w-full max-w-md my-auto rounded-3xl border border-destructive/40 shadow-2xl bg-card text-foreground overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 sm:p-7 space-y-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shrink-0 shadow-sm">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 id="delete-account-title" className="text-lg font-bold text-foreground">
                      Delete Account Permanently?
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive leading-relaxed">
                  <strong>Warning:</strong> Deleting your account will immediately and permanently purge all your registered problems, review logs, FSRS spaced repetition progress, and settings.
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground block">
                    To confirm deletion, please type <strong className="text-destructive font-mono uppercase">DELETE</strong> below:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmInput}
                    onChange={(e) => setDeleteConfirmInput(e.target.value)}
                    placeholder="DELETE"
                    disabled={isDeleting}
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 focus:border-destructive focus:ring-1 focus:ring-destructive outline-none text-sm font-mono transition-all placeholder:text-muted-foreground/40"
                  />
                </div>

                {deleteError && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium animate-in fade-in">
                    {deleteError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/40">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-border/60 text-xs font-semibold hover:bg-secondary/60 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={deleteConfirmInput.trim() !== 'DELETE' || isDeleting}
                    onClick={handleDeleteAccount}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold transition-all shadow-sm active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Permanently Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>,
    document.body
  );
}
