"use client";

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
            {patterns.length > 0 && Math.max(...patterns.map(p => p.masteryScore)) > 0 
              ? [...patterns].sort((a,b) => b.masteryScore - a.masteryScore)[0].name 
              : 'None Yet'}
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

      <div className="glass rounded-2xl border border-border/50">
        <div className="overflow-x-auto w-full rounded-2xl">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-secondary/40 text-muted-foreground font-medium border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Pattern</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Total Problems</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Mastery Score</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Weakness Level</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Hint Rate</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Avg Time</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Target Time</th>
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

              {patterns.map((p) => {
                return (
                  <tr 
                    key={p.name} 
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
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
