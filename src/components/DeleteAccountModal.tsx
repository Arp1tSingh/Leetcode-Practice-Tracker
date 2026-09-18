'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { signOut } from 'next-auth/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { deleteAccountAction } from '@/lib/actions';

export function DeleteAccountModal({
  isOpen,
  onClose,
  userId,
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setConfirmInput('');
      setError(null);
      setIsDeleting(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, isDeleting]);

  if (!isOpen || !mounted) return null;

  const handleDelete = async () => {
    if (confirmInput.trim() !== 'DELETE' || isDeleting) return;
    setIsDeleting(true);
    setError(null);

    try {
      const res = await deleteAccountAction(userId);
      if (res.error) {
        setError(res.error);
        setIsDeleting(false);
      } else {
        await signOut({ callbackUrl: '/login?deleted=true' });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      className="fixed inset-0 z-[10000] overflow-y-auto bg-background/80 backdrop-blur-md p-4 flex justify-center items-center animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md my-auto rounded-3xl border border-destructive/40 shadow-2xl bg-card text-foreground overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-7 space-y-5">
          
          <div className="flex items-start justify-between gap-3">
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

            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors disabled:opacity-50 cursor-pointer"
              aria-label="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive leading-relaxed">
            <strong>Warning:</strong> Deleting your account will immediately and permanently wipe all your saved LeetCode problems, flashcard review logs, FSRS progress, and streaks.
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground block">
              To confirm deletion, please type <strong className="text-destructive font-mono uppercase">DELETE</strong> below:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="DELETE"
              disabled={isDeleting}
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/60 focus:border-destructive focus:ring-1 focus:ring-destructive outline-none text-sm font-mono transition-all placeholder:text-muted-foreground/40"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/40">
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border/60 text-xs font-semibold hover:bg-secondary/60 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={confirmInput.trim() !== 'DELETE' || isDeleting}
              onClick={handleDelete}
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
  );
}
