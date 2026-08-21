"use client";

import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { BrainCircuit, AlertCircle } from "lucide-react";

type ReviewProp = {
  id: string;
  dateStr: string;
  timeStr: string;
  titleSlug: string | null;
  leetcodeId: number;
  title: string;
  rating: number;
  timeTakenMinutes: number | null;
  solvedFromScratch: boolean;
  neededHint: boolean;
  rememberedPattern: boolean;
  bugsMistakes: number;
  difficultyPerceived: string;
};

const ratingMap: Record<number, { label: string, color: string }> = {
  1: { label: 'Again', color: 'text-red-500 bg-red-500/10' },
  2: { label: 'Hard', color: 'text-orange-500 bg-orange-500/10' },
  3: { label: 'Good', color: 'text-green-500 bg-green-500/10' },
  4: { label: 'Easy', color: 'text-blue-500 bg-blue-500/10' },
};

export default function ReviewsTableClient({ reviews }: { reviews: ReviewProp[] }) {
  const tableRef = useRef<HTMLTableElement>(null);
  
  const virtualizer = useWindowVirtualizer({
    count: reviews.length,
    estimateSize: () => 64, // Approx height of a review row
    overscan: 5,
    scrollMargin: tableRef.current?.offsetTop ?? 0,
  });

  return (
    <div className="overflow-x-auto w-full">
      <table ref={tableRef} className="w-full text-sm text-left whitespace-nowrap">
        <thead className="bg-secondary/30 text-muted-foreground font-medium border-b border-border/50 sticky top-16 z-40 shadow-sm">
          <tr>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Problem</th>
            <th className="px-6 py-4">Rating</th>
            <th className="px-6 py-4">Time</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Pattern</th>
            <th className="px-6 py-4">Bugs</th>
            <th className="px-6 py-4">Difficulty</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {reviews.length === 0 && (
            <tr>
              <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                No reviews found. Start practicing to see your history here!
              </td>
            </tr>
          )}

          {virtualizer.getVirtualItems().length > 0 && (
            <tr style={{ height: `${virtualizer.getVirtualItems()[0]?.start ?? 0}px` }}>
              <td colSpan={8} />
            </tr>
          )}

          {virtualizer.getVirtualItems().map((virtualRow) => {
            const review = reviews[virtualRow.index];
            const ratingInfo = ratingMap[review.rating] || { label: 'Unknown', color: 'text-muted-foreground bg-muted' };
            
            return (
              <tr 
                key={virtualRow.key} 
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-6 py-4 text-muted-foreground">
                  <div className="flex flex-col">
                    <span>{review.dateStr}</span>
                    <span className="text-xs">{review.timeStr}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">
                  <a 
                    href={`https://leetcode.com/problems/${review.titleSlug}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline hover:text-primary transition-colors"
                  >
                    {review.leetcodeId}. {review.title}
                  </a>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ratingInfo.color}`}>
                    {ratingInfo.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {review.timeTakenMinutes ? `${review.timeTakenMinutes}m` : '-'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {review.solvedFromScratch && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium" title="Solved from Scratch">Scratch</span>
                    )}
                    {review.neededHint && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium" title="Needed Hint">Hint</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {review.rememberedPattern ? (
                    <span className="text-emerald-500 flex items-center gap-1"><BrainCircuit className="w-3.5 h-3.5" /> Yes</span>
                  ) : (
                    <span className="text-destructive flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> No</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={review.bugsMistakes > 0 ? "text-destructive font-medium" : "text-muted-foreground"}>
                    {review.bugsMistakes}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`
                    ${review.difficultyPerceived === 'Hard' ? 'text-red-500' : ''}
                    ${review.difficultyPerceived === 'Medium' ? 'text-orange-500' : ''}
                    ${review.difficultyPerceived === 'Easy' ? 'text-emerald-500' : ''}
                  `}>
                    {review.difficultyPerceived}
                  </span>
                </td>
              </tr>
            );
          })}

          {virtualizer.getVirtualItems().length > 0 && (
            <tr style={{ height: `${virtualizer.getTotalSize() - (virtualizer.getVirtualItems()[virtualizer.getVirtualItems().length - 1]?.end ?? 0)}px` }}>
              <td colSpan={8} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
