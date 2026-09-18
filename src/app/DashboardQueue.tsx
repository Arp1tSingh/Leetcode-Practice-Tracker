import { getReviewQueueData } from "@/lib/queue";
import { DashboardQueueClient } from "./DashboardQueueClient";

export async function DashboardQueue({ userId }: { userId: string }) {
  const queueData = await getReviewQueueData(userId);

  return (
    <DashboardQueueClient
      userId={userId}
      initialCards={queueData.cards}
      initialTotalOverdue={queueData.totalOverdueCount}
      initialBacklogRemaining={queueData.backlogRemaining}
      initialCompletedToday={queueData.completedTodayCount}
      initialDailyLimit={queueData.dailyLimit}
    />
  );
}
