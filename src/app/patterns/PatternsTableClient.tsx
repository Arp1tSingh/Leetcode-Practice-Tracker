"use client";

import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { AlertTriangle, BrainCircuit, Target } from "lucide-react";

type PatternProp = {
  name: string;
  totalProblems: number;
  masteryScore: number;
  weaknessLevel: number;
  hintRate: number;
  avgTime: number;
  targetTime: number;
};

export default function PatternsTableClient({ patterns }: { patterns: PatternProp[] }) {
  const tableRef = useRef<HTMLTableElement>(null);
  
  const virtualizer = useWindowVirtualizer({
    count: patterns.length,
    estimateSize: () => 64,
    overscan: 5,
    scrollMargin: tableRef.current?.offsetTop ?? 0,
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass p-6 rounded-2xl border border-border/50 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Top Weakness</p>
          <p className="text-xl font-bold mt-1 text-foreground">
            {patterns.length > 0 ? patterns[0].name : 'N/A'}
          </p>
        </div>

        <div className="glass p-6 rounded-2xl border border-border/50 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
            <BrainCircuit className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Highest Mastery</p>
          <p className="text-xl font-bold mt-1 text-foreground">
            {patterns.length > 0 ? [...patterns].sort((a,b) => b.masteryScore - a.masteryScore)[0].name : 'N/A'}
          </p>
        </div>

        <div className="glass p-6 rounded-2xl border border-border/50 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
            <Target className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Patterns Tracked</p>
          <p className="text-3xl font-bold tracking-tight mt-1 text-foreground">
            {patterns.length}
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table ref={tableRef} className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-secondary/30 text-muted-foreground font-medium border-b border-border/50 sticky top-16 z-40 shadow-sm">
              <tr>
                <th className="px-6 py-4">Pattern</th>
                <th className="px-6 py-4">Total Problems</th>
                <th className="px-6 py-4">Mastery Score</th>
                <th className="px-6 py-4">Weakness Level</th>
                <th className="px-6 py-4">Hint Rate</th>
                <th className="px-6 py-4">Avg Time</th>
                <th className="px-6 py-4">Target Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {patterns.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No patterns analyzed yet. Practice some problems to see stats here!
                  </td>
                </tr>
              )}

              {virtualizer.getVirtualItems().length > 0 && (
                <tr style={{ height: `${virtualizer.getVirtualItems()[0]?.start ?? 0}px` }}>
                  <td colSpan={7} />
                </tr>
              )}

              {virtualizer.getVirtualItems().map((virtualRow) => {
                const p = patterns[virtualRow.index];
                
                return (
                  <tr 
                    key={virtualRow.key} 
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-foreground">
                      {p.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      {p.totalProblems}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all" 
                            style={{ width: `${p.masteryScore}%` }}
                          />
                        </div>
                        <span className="font-bold text-emerald-500">{p.masteryScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              p.weaknessLevel > 70 ? 'bg-red-500' : 
                              p.weaknessLevel > 40 ? 'bg-orange-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${p.weaknessLevel}%` }}
                          />
                        </div>
                        <span className={`font-bold ${
                          p.weaknessLevel > 70 ? 'text-red-500' : 
                          p.weaknessLevel > 40 ? 'text-orange-500' : 'text-emerald-500'
                        }`}>{p.weaknessLevel}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={p.hintRate > 50 ? 'text-orange-500 font-medium' : 'text-muted-foreground'}>
                        {p.hintRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {p.avgTime}m
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {p.targetTime}m
                    </td>
                  </tr>
                );
              })}

              {virtualizer.getVirtualItems().length > 0 && (
                <tr style={{ height: `${virtualizer.getTotalSize() - (virtualizer.getVirtualItems()[virtualizer.getVirtualItems().length - 1]?.end ?? 0)}px` }}>
                  <td colSpan={7} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
