'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Search, 
  X, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Plus, 
  Layers, 
  BookOpen, 
  Filter,
  Check,
  RefreshCw
} from 'lucide-react';
import { 
  getAllUserProblemsForCustomReviewAction, 
  addProblemToTodayQueueAction, 
  addProblemAction, 
  CustomReviewProblemItem 
} from '@/lib/actions';

export function CustomReviewModal({
  isOpen,
  onClose,
  userId,
  onQueueUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onQueueUpdated?: () => void;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'new'>('library');

  // Library items state
  const [problems, setProblems] = useState<CustomReviewProblemItem[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_in_queue' | 'in_queue'>('all');

  // Queue adding state
  const [addingProblemId, setAddingProblemId] = useState<string | null>(null);
  const [justAddedIds, setJustAddedIds] = useState<Set<string>>(new Set());

  // Add new problem form state
  const [newProblemId, setNewProblemId] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [newProblemError, setNewProblemError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch problems when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setLoadingProblems(true);
    getAllUserProblemsForCustomReviewAction(userId)
      .then((res) => {
        if (res.problems) {
          setProblems(res.problems);
        }
      })
      .catch((err) => {
        console.error('Failed to load problems for custom review:', err);
      })
      .finally(() => {
        setLoadingProblems(false);
      });
  }, [isOpen, userId]);

  // Modal ESC key listener and scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Handle adding an existing problem to today's queue
  const handleAddToQueue = async (problemId: string) => {
    setAddingProblemId(problemId);
    try {
      const res = await addProblemToTodayQueueAction(userId, problemId);
      if (res.success) {
        setJustAddedIds((prev) => new Set(prev).add(problemId));
        setProblems((prev) =>
          prev.map((p) => (p.id === problemId ? { ...p, isDueToday: true } : p))
        );
        if (onQueueUpdated) onQueueUpdated();
      }
    } catch (err) {
      console.error('Failed to add problem to queue:', err);
    } finally {
      setAddingProblemId(null);
    }
  };

  // Handle adding a brand new problem and starting review
  const handleAddNewAndReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const idNum = parseInt(newProblemId.trim(), 10);
    if (isNaN(idNum) || idNum <= 0) {
      setNewProblemError('Please enter a valid positive problem number.');
      return;
    }

    setAddingNew(true);
    setNewProblemError(null);

    try {
      const res = await addProblemAction(userId, idNum, 'need_practice');
      if (res.problemId) {
        onClose();
        router.push(`/review/${res.problemId}`);
      } else if (res.error) {
        setNewProblemError(res.error);
      }
    } catch (err: any) {
      setNewProblemError(err.message || 'Failed to fetch problem.');
    } finally {
      setAddingNew(false);
    }
  };

  // Filtered problems computation
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      // Difficulty match
      if (difficultyFilter !== 'All' && p.difficulty !== difficultyFilter) {
        return false;
      }

      // Status match
      if (statusFilter === 'not_in_queue' && p.isDueToday) {
        return false;
      }
      if (statusFilter === 'in_queue' && !p.isDueToday) {
        return false;
      }

      // Search query match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const idStr = p.leetcodeId.toString();
      const titleMatch = p.title.toLowerCase().includes(q);
      const idMatch = idStr === q || idStr.includes(q) || `#${idStr}`.includes(q);
      const patternMatch = p.pattern ? p.pattern.toLowerCase().includes(q) : false;
      const difficultyMatch = p.difficulty.toLowerCase().includes(q);

      return titleMatch || idMatch || patternMatch || difficultyMatch;
    });
  }, [problems, searchQuery, difficultyFilter, statusFilter]);

  if (!isOpen || !mounted) return null;

  const notInQueueCount = problems.filter((p) => !p.isDueToday).length;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-review-title"
      className="fixed inset-0 z-[9999] overflow-y-auto bg-background/80 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start sm:items-center animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col rounded-3xl border border-border/70 shadow-2xl overflow-hidden bg-card text-foreground animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border/50 bg-secondary/20">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="custom-review-title" className="text-lg sm:text-xl font-bold tracking-tight">
                  Review Other Questions
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                  On-Demand
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Practice any problem immediately or add it to today&apos;s active queue
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border/50 bg-secondary/10 px-5 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>From Your Library ({problems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'new'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add & Review New LeetCode</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {activeTab === 'library' ? (
            <>
              {/* Search Bar & Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by problem name, # number, pattern, or difficulty..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-xs sm:text-sm transition-all placeholder:text-muted-foreground/50"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer ${
                        statusFilter === 'all'
                          ? 'bg-primary text-primary-foreground border-primary font-semibold'
                          : 'bg-secondary/40 text-muted-foreground hover:text-foreground border-border/50'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('not_in_queue')}
                      className={`px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer ${
                        statusFilter === 'not_in_queue'
                          ? 'bg-primary text-primary-foreground border-primary font-semibold'
                          : 'bg-secondary/40 text-muted-foreground hover:text-foreground border-border/50'
                      }`}
                    >
                      Not in Today&apos;s Queue ({notInQueueCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('in_queue')}
                      className={`px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer ${
                        statusFilter === 'in_queue'
                          ? 'bg-primary text-primary-foreground border-primary font-semibold'
                          : 'bg-secondary/40 text-muted-foreground hover:text-foreground border-border/50'
                      }`}
                    >
                      Due Today ({problems.length - notInQueueCount})
                    </button>
                  </div>

                  {/* Difficulty selector */}
                  <div className="flex items-center gap-1">
                    {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficultyFilter(diff)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                          difficultyFilter === diff
                            ? diff === 'Easy'
                              ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                              : diff === 'Medium'
                              ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                              : diff === 'Hard'
                              ? 'bg-rose-500/20 text-rose-500 border-rose-500/40'
                              : 'bg-secondary text-foreground border-border'
                            : 'bg-transparent text-muted-foreground hover:text-foreground border-transparent'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Problems Results List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {loadingProblems ? (
                  <div className="text-center py-12 space-y-2">
                    <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-muted-foreground">Loading your problems...</p>
                  </div>
                ) : filteredProblems.length === 0 ? (
                  <div className="text-center py-10 px-4 space-y-3 bg-secondary/15 rounded-2xl border border-dashed border-border/60">
                    <p className="text-sm font-medium text-foreground">
                      No problems found matching your filters.
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Try searching with different keywords, or switch to the &quot;Add &amp; Review New&quot; tab to import a new question.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('new')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add New LeetCode Problem
                    </button>
                  </div>
                ) : (
                  filteredProblems.map((problem) => {
                    const diffBadge =
                      problem.difficulty === 'Easy'
                        ? 'badge-easy'
                        : problem.difficulty === 'Medium'
                        ? 'badge-medium'
                        : problem.difficulty === 'Hard'
                        ? 'badge-hard'
                        : 'bg-secondary text-secondary-foreground';

                    const isAddingThis = addingProblemId === problem.id;
                    const wasJustAdded = justAddedIds.has(problem.id);
                    const formattedDue = problem.due
                      ? new Date(problem.due).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : null;

                    return (
                      <div
                        key={problem.id}
                        className="p-3 sm:p-3.5 rounded-2xl bg-secondary/20 hover:bg-secondary/40 border border-border/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        {/* Problem info */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-muted-foreground">
                              #{problem.leetcodeId}
                            </span>
                            <h4 className="text-sm font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                              {problem.title}
                            </h4>
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${diffBadge}`}>
                              {problem.difficulty}
                            </span>
                            {problem.pattern && (
                              <span className="px-2 py-0.2 rounded-md bg-secondary text-secondary-foreground text-[10px] font-medium truncate max-w-[140px]">
                                {problem.pattern}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            {problem.isDueToday ? (
                              <span className="inline-flex items-center gap-1 text-amber-500 font-semibold">
                                <Clock className="w-3 h-3" /> Due in Today&apos;s Queue
                              </span>
                            ) : formattedDue ? (
                              <span>Scheduled: {formattedDue} • {problem.reps} reps • Stability: {problem.stability.toFixed(1)}d</span>
                            ) : (
                              <span>Not reviewed yet</span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          {/* Add to Today's Queue button */}
                          {!problem.isDueToday && !wasJustAdded ? (
                            <button
                              type="button"
                              onClick={() => handleAddToQueue(problem.id)}
                              disabled={isAddingThis}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border/60 hover:bg-secondary/80 text-xs font-medium text-foreground transition-all cursor-pointer disabled:opacity-50"
                              title="Add to today's recommended queue"
                            >
                              {isAddingThis ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Plus className="w-3 h-3 text-primary" />
                              )}
                              <span>+ Today&apos;s Queue</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-semibold">
                              <Check className="w-3 h-3" />
                              In Queue
                            </span>
                          )}

                          {/* Review Now button */}
                          <Link
                            href={`/review/${problem.id}`}
                            onClick={onClose}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-xs active:scale-[0.98]"
                          >
                            <span>Review Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* Add New LeetCode Problem & Review Tab */
            <form onSubmit={handleAddNewAndReview} className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">
                    Add &amp; Repeat Any LeetCode Problem
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter the problem number from LeetCode (e.g., <strong>1</strong> for Two Sum, <strong>15</strong> for 3Sum, or <strong>206</strong> for Reverse Linked List). We will automatically pull title, difficulty, and algorithmic topic tags, add it to your library, and immediately launch a focus review session.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  LeetCode Problem Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProblemId}
                    onChange={(e) => setNewProblemId(e.target.value)}
                    placeholder="e.g. 1"
                    disabled={addingNew}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
                  />
                  <button
                    type="submit"
                    disabled={addingNew || !newProblemId.trim()}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    {addingNew ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Add &amp; Review Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {newProblemError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium animate-in fade-in">
                  {newProblemError}
                </div>
              )}
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-border/50 bg-secondary/20 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            Reviews outside the scheduled queue update your FSRS memory intervals immediately.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border/60 text-xs font-semibold hover:bg-secondary/60 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
