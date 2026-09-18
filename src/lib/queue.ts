'use server';

import { prisma } from './prisma';
import { revalidatePath } from 'next/cache';
import { calculateRetrievability } from './fsrs';

export interface QueuedCard {
  id: string;
  leetcodeId: number;
  title: string;
  titleSlug: string;
  difficulty: string;
  pattern: string | null;
  state: number;
  stability: number;
  difficultyWeight: number;
  lastReview: Date | null;
  nextReview: Date | null;
  due: Date | null;
  status: string;
  retrievability: number; // R(t) in percent (0 - 100)
  daysOverdue: number;
}

export interface ReviewQueueResponse {
  cards: QueuedCard[];
  totalOverdueCount: number;
  backlogRemaining: number;
  completedTodayCount: number;
  dailyLimit: number;
}

/**
 * Fetches the paced review queue for today.
 * Only selects active cards where due <= NOW(), ranks by lowest retrievability / urgency,
 * and enforces the user's daily review limit.
 */
export async function getReviewQueueData(
  userId: string,
  limitOverride?: number
): Promise<ReviewQueueResponse> {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  // 1. Fetch user settings
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyReviewLimit: true },
  });

  const dailyLimit = user?.dailyReviewLimit && user.dailyReviewLimit > 0 ? user.dailyReviewLimit : 6;
  const effectiveLimit = limitOverride && limitOverride > 0 ? limitOverride : dailyLimit;

  // 2. Query overdue active problems
  const dueProblems = await prisma.problem.findMany({
    where: {
      userId,
      status: 'ACTIVE',
      OR: [
        { due: { lte: now } },
        { nextReview: { lte: now } },
      ],
    },
  });

  // 3. Count reviews completed today
  const completedTodayCount = await prisma.review.count({
    where: {
      userId,
      reviewedAt: { gte: startOfDay },
    },
  });

  // 4. Calculate R(t) and days overdue for each card
  const evaluatedCards: QueuedCard[] = dueProblems.map((problem) => {
    const elapsedDays = problem.lastReview
      ? (now.getTime() - problem.lastReview.getTime()) / (1000 * 60 * 60 * 24)
      : 0;

    const R = calculateRetrievability(problem.stability, elapsedDays);

    const effectiveDue = problem.due || problem.nextReview || now;
    const daysOverdue = Math.max(0, (now.getTime() - effectiveDue.getTime()) / (1000 * 60 * 60 * 24));

    return {
      id: problem.id,
      leetcodeId: problem.leetcodeId,
      title: problem.title,
      titleSlug: problem.titleSlug,
      difficulty: problem.difficulty,
      pattern: problem.pattern,
      state: problem.state,
      stability: problem.stability,
      difficultyWeight: problem.difficultyWeight,
      lastReview: problem.lastReview,
      nextReview: problem.nextReview,
      due: effectiveDue,
      status: problem.status,
      retrievability: R,
      daysOverdue,
    };
  });

  // 5. Sort by urgency:
  // - Lowest retrievability first (cards most forgotten)
  // - Tie-breaker: earliest due date (cards most overdue)
  evaluatedCards.sort((a, b) => {
    if (Math.abs(a.retrievability - b.retrievability) > 0.05) {
      return a.retrievability - b.retrievability;
    }
    const dueTimeA = a.due ? a.due.getTime() : 0;
    const dueTimeB = b.due ? b.due.getTime() : 0;
    return dueTimeA - dueTimeB;
  });

  const totalOverdueCount = evaluatedCards.length;
  const cards = evaluatedCards.slice(0, effectiveLimit);
  const backlogRemaining = Math.max(0, totalOverdueCount - cards.length);

  return {
    cards,
    totalOverdueCount,
    backlogRemaining,
    completedTodayCount,
    dailyLimit,
  };
}

/**
 * Server action to update the user's preferred daily review limit.
 */
export async function updateDailyReviewLimitAction(userId: string, newLimit: number) {
  try {
    const clampedLimit = Math.max(2, Math.min(50, Math.round(newLimit)));
    await prisma.user.update({
      where: { id: userId },
      data: { dailyReviewLimit: clampedLimit },
    });
    revalidatePath('/');
    return { success: true, dailyLimit: clampedLimit };
  } catch (error: any) {
    return { error: error.message || 'Failed to update daily review limit.' };
  }
}

/**
 * Server action to fetch additional cards from the backlog on demand.
 */
export async function fetchMoreBacklogCardsAction(
  userId: string,
  currentCount: number,
  additionalCount: number = 3
): Promise<ReviewQueueResponse> {
  return getReviewQueueData(userId, currentCount + additionalCount);
}
