import { prisma } from "@/lib/prisma";
import ReviewsTableClient from "./ReviewsTableClient";
import { format } from "date-fns";

export default async function ReviewsTableFetcher({ userId }: { userId: string }) {
  const reviews = await prisma.review.findMany({
    where: {
      userId,
    },
    include: {
      problem: true,
    },
    orderBy: {
      reviewedAt: 'desc',
    },
  });

  const serializedReviews = reviews.map(review => ({
    id: review.id,
    dateStr: format(new Date(review.reviewedAt), 'MMM d, yyyy'),
    timeStr: format(new Date(review.reviewedAt), 'h:mm a'),
    titleSlug: review.problem.titleSlug,
    leetcodeId: review.problem.leetcodeId,
    title: review.problem.title,
    rating: review.rating,
    timeTakenMinutes: review.timeTakenMinutes,
    solvedFromScratch: review.solvedFromScratch,
    neededHint: review.neededHint,
    rememberedPattern: review.rememberedPattern,
    bugsMistakes: review.bugsMistakes,
    difficultyPerceived: review.difficultyPerceived,
  }));

  return <ReviewsTableClient reviews={serializedReviews} />;
}
