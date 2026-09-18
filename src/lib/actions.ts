'use server';

import { prisma } from './prisma';
import { scheduler } from './fsrs';
import { getProblemByFrontendId, getProblemByTitleSlug, getRecentSubmissions } from './leetcode';
import { revalidatePath } from 'next/cache';
import { Card, Rating, Grade, createEmptyCard } from 'ts-fsrs';
import { LeetCode } from 'leetcode-query';

export async function addProblemAction(
  userId: string, 
  frontendId: number,
  calibration: 'confident' | 'need_practice' = 'need_practice'
) {
  try {
    // 1. Check if problem already exists
    const existing = await prisma.problem.findUnique({
      where: {
        userId_leetcodeId: {
          userId,
          leetcodeId: frontendId,
        }
      }
    });

    if (existing) {
      return { error: 'Problem already added to your queue.' };
    }

    // 2. Fetch LeetCode data
    const leetcodeData = await getProblemByFrontendId(frontendId);
    
    // 3. Extract patterns (topic tags)
    const patterns = leetcodeData.topicTags.map((tag: any) => tag.name).join(', ');

    // 4. Determine initial FSRS state based on calibration
    const now = new Date();
    let initialFSRS = {
      state: 0,
      stability: 0,
      difficultyWeight: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      learningSteps: 0,
      lastReview: null as Date | null,
      due: now,
      nextReview: now,
    };

    if (calibration === 'confident') {
      const empty = createEmptyCard();
      const fsrsRes = scheduler.next(empty, now, Rating.Easy);
      const c = fsrsRes.card;
      initialFSRS = {
        state: c.state,
        stability: c.stability,
        difficultyWeight: c.difficulty,
        elapsedDays: c.elapsed_days,
        scheduledDays: c.scheduled_days,
        reps: c.reps,
        lapses: c.lapses,
        learningSteps: c.learning_steps,
        lastReview: c.last_review || now,
        due: c.due,
        nextReview: c.due,
      };
    }

    // 5. Create Prisma record
    await prisma.problem.create({
      data: {
        userId,
        leetcodeId: frontendId,
        title: leetcodeData.title,
        titleSlug: leetcodeData.titleSlug,
        difficulty: leetcodeData.difficulty,
        pattern: patterns,
        status: 'ACTIVE',
        ...initialFSRS,
      }
    });

    revalidatePath('/');
    revalidatePath('/problems');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to add problem.' };
  }
}

export async function submitReviewAction(
  userId: string,
  problemId: string,
  rating: Rating,
  timeTakenMinutes?: number,
  neededHint: boolean = false,
  solvedFromScratch: boolean = true,
  rememberedPattern: boolean = true,
  bugsMistakes: number = 0,
  difficultyPerceived: string = "Medium"
) {
  try {
    // 1. Fetch current problem
    const problem = await prisma.problem.findUnique({
      where: { id: problemId }
    });

    if (!problem) throw new Error('Problem not found');
    if (problem.userId !== userId) throw new Error('Unauthorized');

    // 2. Map to ts-fsrs Card
    const card: Card = {
      due: problem.nextReview || new Date(),
      stability: problem.stability,
      difficulty: problem.difficultyWeight,
      elapsed_days: problem.elapsedDays,
      scheduled_days: problem.scheduledDays,
      reps: problem.reps,
      lapses: problem.lapses,
      learning_steps: (problem as any).learningSteps || 0,
      state: problem.state as any,
      last_review: problem.lastReview || undefined,
    };

    // 3. Call scheduler.next
    const now = new Date();
    const result = scheduler.next(card, now, rating as Grade);
    const nextCard = result.card;

    // 4. Update Problem record
    await prisma.problem.update({
      where: { id: problemId },
      data: {
        state: nextCard.state,
        stability: nextCard.stability,
        difficultyWeight: nextCard.difficulty,
        elapsedDays: nextCard.elapsed_days,
        scheduledDays: nextCard.scheduled_days,
        reps: nextCard.reps,
        lapses: nextCard.lapses,
        learningSteps: nextCard.learning_steps,
        lastReview: nextCard.last_review,
        nextReview: nextCard.due,
        due: nextCard.due,
        status: 'ACTIVE',
      }
    });

    // 5. Create Review log
    await prisma.review.create({
      data: {
        problemId,
        userId,
        rating,
        timeTakenMinutes,
        solvedFromScratch,
        neededHint,
        rememberedPattern,
        bugsMistakes,
        difficultyPerceived,
        state: nextCard.state,
        stability: nextCard.stability,
        difficultyWeight: nextCard.difficulty,
      }
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to submit review.' };
  }
}

export async function importCsvBatchAction(
  userId: string, 
  problemIds: number[],
  calibration: 'confident' | 'need_practice' = 'need_practice'
) {
  try {
    if (!problemIds || problemIds.length === 0) {
      return { success: true, added: 0 };
    }

    let addedCount = 0;
    for (const frontendId of problemIds) {
      if (isNaN(frontendId) || frontendId <= 0) continue;
      
      const res = await addProblemAction(userId, frontendId, calibration);
      if (res.success) addedCount++;
    }
    
    revalidatePath('/');
    revalidatePath('/problems');
    return { success: true, added: addedCount, message: `Successfully imported ${addedCount} problems.` };
  } catch (error: any) {
    return { error: error.message || 'Failed to process CSV batch.' };
  }
}

export async function setLeetcodeUsername(userId: string, username: string) {
  try {
    const trimmedUsername = username?.trim();
    if (!trimmedUsername) throw new Error("Username cannot be empty");
    await prisma.user.update({
      where: { id: userId },
      data: { leetcodeUsername: trimmedUsername }
    });
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to set username.' };
  }
}

// Server-side safeguards: In-memory rate limiting and concurrency locking per user
const syncCooldownMap = new Map<string, number>();
const syncLockSet = new Set<string>();

export async function syncLeetcodeProfile(
  userId: string, 
  isManual: boolean = false,
  calibration: 'confident' | 'need_practice' = 'need_practice'
) {
  // Safeguard 1: Prevent concurrent syncs for the same user
  if (syncLockSet.has(userId)) {
    return { success: true, message: 'Sync already in progress...' };
  }

  // Safeguard 2: Server-side cooldown (15 minutes for auto-sync, 30 seconds for manual clicks)
  const lastSyncTime = syncCooldownMap.get(userId) || 0;
  const cooldownPeriod = isManual ? 30 * 1000 : 15 * 60 * 1000;
  
  if (Date.now() - lastSyncTime < cooldownPeriod) {
    const waitMins = Math.ceil((cooldownPeriod - (Date.now() - lastSyncTime)) / 60000);
    return { 
      success: true, 
      rateLimited: true, 
      message: `Sync is on cooldown. Please wait ${waitMins}m.` 
    };
  }

  syncLockSet.add(userId);

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.leetcodeUsername) throw new Error("No LeetCode username set");

    const username = user.leetcodeUsername.trim();
    const submissions = await getRecentSubmissions(username, 20);
    
    // API limitation: limits to 20 or might fail if profile is private
    if (!submissions || submissions.length === 0) {
      syncCooldownMap.set(userId, Date.now());
      return { success: true, added: 0, message: "No recent submissions found or profile is private." };
    }

    const accepted = submissions.filter((s: any) => s.statusDisplay === 'Accepted');
    if (accepted.length === 0) {
      syncCooldownMap.set(userId, Date.now());
      return { success: true, added: 0, message: "No accepted submissions found." };
    }

    // Safeguard 3: Pre-filter existing problems in 1 database query
    const existingProblems = await prisma.problem.findMany({
      where: {
        userId,
        titleSlug: { in: accepted.map((s: any) => s.titleSlug) }
      },
      select: { titleSlug: true }
    });
    const existingSlugs = new Set(existingProblems.map(p => p.titleSlug));
    const newSubs = accepted.filter((s: any) => !existingSlugs.has(s.titleSlug));

    let addedCount = 0;

    for (const sub of newSubs) {
      // Fetch details only for genuinely new problems
      const leetcodeData = await getProblemByTitleSlug(sub.titleSlug);
      const frontendId = parseInt(leetcodeData.questionFrontendId, 10);
      
      const patterns = leetcodeData.topicTags?.map((tag: any) => tag.name).join(', ') || 'Unknown';
      const submissionDate = new Date(parseInt(sub.timestamp, 10) * 1000);
      const standardNextReview = new Date(submissionDate.getTime() + 24 * 60 * 60 * 1000);
      
      let initialFSRS = {
        state: 0,
        stability: 0,
        difficultyWeight: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        reps: 0,
        lapses: 0,
        learningSteps: 0,
        lastReview: submissionDate,
        due: standardNextReview,
        nextReview: standardNextReview,
      };

      if (calibration === 'confident') {
        const empty = createEmptyCard();
        const fsrsRes = scheduler.next(empty, submissionDate, Rating.Easy);
        const c = fsrsRes.card;
        initialFSRS = {
          state: c.state,
          stability: c.stability,
          difficultyWeight: c.difficulty,
          elapsedDays: c.elapsed_days,
          scheduledDays: c.scheduled_days,
          reps: c.reps,
          lapses: c.lapses,
          learningSteps: c.learning_steps,
          lastReview: c.last_review || submissionDate,
          due: c.due,
          nextReview: c.due,
        };
      }

      await prisma.problem.create({
        data: {
          userId,
          leetcodeId: frontendId,
          title: leetcodeData.title,
          titleSlug: leetcodeData.titleSlug,
          difficulty: leetcodeData.difficulty || 'Medium',
          pattern: patterns,
          status: 'ACTIVE',
          ...initialFSRS,
        }
      });
      
      addedCount++;
    }

    syncCooldownMap.set(userId, Date.now());

    if (addedCount > 0) {
      revalidatePath('/');
      revalidatePath('/problems');
    }

    return { 
      success: true, 
      added: addedCount, 
      message: addedCount > 0 ? `Successfully synced ${addedCount} new problem${addedCount > 1 ? 's' : ''}.` : 'All recent problems are already tracked.' 
    };
  } catch (error: any) {
    return { error: error.message || 'Failed to sync LeetCode profile.' };
  } finally {
    syncLockSet.delete(userId);
  }
}

