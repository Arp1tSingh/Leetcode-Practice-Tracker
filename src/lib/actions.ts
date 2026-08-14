'use server';

import { prisma } from './prisma';
import { scheduler } from './fsrs';
import { getProblemByFrontendId, getProblemByTitleSlug } from './leetcode';
import { revalidatePath } from 'next/cache';
import { Card, Rating, Grade } from 'ts-fsrs';
import { LeetCode } from 'leetcode-query';

export async function addProblemAction(userId: string, frontendId: number) {
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

    // 4. Create Prisma record with empty FSRS state
    await prisma.problem.create({
      data: {
        userId,
        leetcodeId: frontendId,
        title: leetcodeData.title,
        titleSlug: leetcodeData.titleSlug,
        difficulty: leetcodeData.difficulty,
        pattern: patterns,
        // Default FSRS values
        state: 0,
        stability: 0,
        difficultyWeight: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        reps: 0,
        lapses: 0,
        learningSteps: 0,
        nextReview: new Date(), // Due immediately
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

export async function importCsvData(userId: string, csvContent: string) {
  try {
    const lines = csvContent.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) throw new Error("CSV is empty or missing headers");
    
    // Support common header names for LeetCode IDs
    const headers = lines[0].toLowerCase().split(',').map(h => h.replace(/["']/g, '').trim());
    const idIndex = headers.findIndex(h => h === 'id' || h === 'questionid' || h === 'frontend_question_id' || h === 'question id');
    
    if (idIndex === -1) throw new Error("CSV must contain an 'id' or 'questionId' column");
    
    let addedCount = 0;
    for (let i = 1; i < lines.length; i++) {
      // Naive CSV split that handles basic commas (will break on commas inside quotes, but fine for simple IDs)
      const cols = lines[i].split(',');
      const idStr = cols[idIndex]?.replace(/["']/g, '').trim();
      if (!idStr) continue;
      
      const frontendId = parseInt(idStr, 10);
      if (!isNaN(frontendId)) {
        // Use our existing addProblemAction logic
        const res = await addProblemAction(userId, frontendId);
        if (res.success) addedCount++;
      }
    }
    
    revalidatePath('/');
    revalidatePath('/problems');
    return { success: true, added: addedCount, message: `Successfully imported ${addedCount} problems from CSV.` };
  } catch (error: any) {
    return { error: error.message || 'Failed to parse CSV.' };
  }
}

export async function setLeetcodeUsername(userId: string, username: string) {
  try {
    if (!username) throw new Error("Username cannot be empty");
    await prisma.user.update({
      where: { id: userId },
      data: { leetcodeUsername: username }
    });
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to set username.' };
  }
}

export async function syncLeetcodeProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.leetcodeUsername) throw new Error("No LeetCode username set");

    const lc = new LeetCode();
    const submissions = await lc.recent_submissions(user.leetcodeUsername, 20);
    
    // API limitation: limits to 20 or might fail if profile is private
    if (!submissions || submissions.length === 0) {
      return { success: true, added: 0, message: "No recent submissions found or profile is private." };
    }

    const accepted = submissions.filter(s => s.statusDisplay === 'Accepted');
    let addedCount = 0;

    for (const sub of accepted) {
      // 1. Fetch details to get frontend ID and tags
      const leetcodeData = await getProblemByTitleSlug(sub.titleSlug);
      const frontendId = parseInt(leetcodeData.questionFrontendId, 10);
      
      // 2. Check if it already exists
      const existing = await prisma.problem.findUnique({
        where: {
          userId_leetcodeId: {
            userId,
            leetcodeId: frontendId,
          }
        }
      });
      
      if (!existing) {
        const patterns = leetcodeData.topicTags.map((tag: any) => tag.name).join(', ');
        
        // Use submission time as last review
        const submissionDate = new Date(parseInt(sub.timestamp, 10) * 1000);
        // We'll set due for 1 day later
        const nextReview = new Date(submissionDate.getTime() + 24 * 60 * 60 * 1000);
        
        await prisma.problem.create({
          data: {
            userId,
            leetcodeId: frontendId,
            title: leetcodeData.title,
            titleSlug: leetcodeData.titleSlug,
            difficulty: leetcodeData.difficulty,
            pattern: patterns,
            // Assume state as learning (0) or review (2). Let's set as new/learning.
            state: 0,
            stability: 0,
            difficultyWeight: 0,
            elapsedDays: 0,
            scheduledDays: 0,
            reps: 0,
            lapses: 0,
            learningSteps: 0,
            lastReview: submissionDate,
            nextReview: nextReview,
          }
        });
        
        addedCount++;
      }
    }

    revalidatePath('/');
    revalidatePath('/problems');
    return { success: true, added: addedCount, message: `Successfully synced ${addedCount} new problems.` };
  } catch (error: any) {
    return { error: error.message || 'Failed to sync LeetCode profile.' };
  }
}

