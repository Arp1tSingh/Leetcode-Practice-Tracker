'use client';

import { useState, useRef, useEffect } from 'react';
import { setLeetcodeUsername, syncLeetcodeProfile, importCsvBatchAction, CsvProblemInput } from '@/lib/actions';
import { 
  RefreshCw, 
  Upload, 
  Save, 
  UserCircle, 
  Sparkles, 
  FileSpreadsheet, 
  Download, 
  ChevronDown, 
  CheckCircle2, 
  Info,
  FileText 
} from 'lucide-react';
import BookmarkletCard from '@/components/BookmarkletCard';

export default function SyncLeetcodeSection({ 
  userId, 
  initialUsername,
  embedded = false,
  onUsernameSaved,
}: { 
  userId: string; 
  initialUsername: string | null;
  embedded?: boolean;
  onUsernameSaved?: (newUsername: string) => void;
}) {
  const [username, setUsername] = useState(initialUsername || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [calibration, setCalibration] = useState<'confident' | 'need_practice'>('confident');
  const [message, setMessage] = useState('');
  const [showFormatGuide, setShowFormatGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadSampleCsv = () => {
    const csvContent = 
`Problem ID,Problem Name,Difficulty,Pattern
1,Two Sum,Easy,Array
20,Valid Parentheses,Easy,Stack
15,3Sum,Medium,Two Pointers
200,Number of Islands,Medium,Graph BFS/DFS
146,LRU Cache,Medium,Design
`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leetcode_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Automatic background sync on visit with 15-minute cooldown safeguard
  useEffect(() => {
    if (!initialUsername) return;

    const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes safeguard
    const storageKey = `lc_last_auto_sync_${userId}`;
    const lastSync = localStorage.getItem(storageKey);

    if (!lastSync || Date.now() - parseInt(lastSync, 10) > COOLDOWN_MS) {
      localStorage.setItem(storageKey, Date.now().toString());

      syncLeetcodeProfile(userId, false, calibration).then((res) => {
        if (res.added && res.added > 0) {
          setMessage(`Auto-synced: Added ${res.added} newly solved problem${res.added > 1 ? 's' : ''} from LeetCode!`);
        }
      }).catch((err) => {
        console.error("Auto-sync background error:", err);
      });
    }
  }, [userId, initialUsername, calibration]);

  const handleSaveUsername = async () => {
    setIsSaving(true);
    setMessage('');
    const res = await setLeetcodeUsername(userId, username);
    if (res.error) {
      setMessage(`Error: ${res.error}`);
    } else {
      setMessage('Username saved!');
      onUsernameSaved?.(username);
    }
    setIsSaving(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setMessage('Syncing with LeetCode...');
    const res = await syncLeetcodeProfile(userId, true, calibration);
    if (res.error) {
      setMessage(`Error: ${res.error}`);
    } else {
      setMessage(res.message || 'Sync complete.');
    }
    setIsSyncing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage('Parsing CSV...');

    import('papaparse').then((Papa) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const rawData = results.data as Record<string, string>[];
            if (!rawData.length) {
              throw new Error("The uploaded CSV file is empty or has no rows.");
            }
            
            const headers = Object.keys(rawData[0]);
            const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').trim();

            // Find ID column: matches 'id', 'problem id', 'question id', 'frontend_question_id', '#', etc.
            const idCol = headers.find(h => {
              const n = normalize(h);
              return ['id', 'problemid', 'questionid', 'frontendquestionid', 'frontendid', 'number', 'no', 'leetcodeid'].includes(n);
            });

            if (!idCol) {
              throw new Error("Could not find an ID column. Please ensure your CSV includes a 'Problem ID', 'id', 'questionId', or '#' column.");
            }

            // Find optional rich metadata columns (speeds up import and avoids external LeetCode network calls)
            const titleCol = headers.find(h => {
              const n = normalize(h);
              return ['title', 'problemname', 'name', 'problem', 'questiontitle', 'question'].includes(n);
            });

            const diffCol = headers.find(h => {
              const n = normalize(h);
              return ['difficulty', 'level', 'diff'].includes(n);
            });

            const patternCol = headers.find(h => {
              const n = normalize(h);
              return ['pattern', 'primarytopic', 'topic', 'topics', 'tag', 'tags', 'category'].includes(n);
            });

            const slugCol = headers.find(h => {
              const n = normalize(h);
              return ['slug', 'titleslug', 'url', 'leetcodeurl', 'link'].includes(n);
            });

            const parsedItems: CsvProblemInput[] = [];

            for (const row of rawData) {
              const rawId = row[idCol]?.replace(/[^0-9]/g, '').trim();
              const leetcodeId = parseInt(rawId || '', 10);
              if (isNaN(leetcodeId) || leetcodeId <= 0) continue;

              let titleSlug: string | undefined = undefined;
              if (slugCol && row[slugCol]) {
                const slugMatch = row[slugCol].match(/\/problems\/([^/?#]+)/);
                if (slugMatch) {
                  titleSlug = slugMatch[1];
                } else if (!row[slugCol].includes('/')) {
                  titleSlug = row[slugCol].trim();
                }
              }

              let difficulty = diffCol ? row[diffCol]?.trim() : undefined;
              if (difficulty) {
                const lower = difficulty.toLowerCase();
                if (lower.includes('easy')) difficulty = 'Easy';
                else if (lower.includes('hard')) difficulty = 'Hard';
                else if (lower.includes('med')) difficulty = 'Medium';
              }

              parsedItems.push({
                leetcodeId,
                title: titleCol ? row[titleCol]?.trim() : undefined,
                titleSlug,
                difficulty,
                pattern: patternCol ? row[patternCol]?.trim() : undefined,
              });
            }

            if (parsedItems.length === 0) {
              throw new Error("No valid problems with numeric IDs were found in the uploaded file.");
            }

            const hasDetails = parsedItems.some(p => p.title);
            setMessage(`Found ${parsedItems.length} problem(s) in CSV (${hasDetails ? 'with details' : 'IDs only'}). Importing in batches...`);
            
            // Process in chunks of 50
            const chunkSize = 50;
            let totalAdded = 0;
            
            for (let i = 0; i < parsedItems.length; i += chunkSize) {
              const chunk = parsedItems.slice(i, i + chunkSize);
              setMessage(`Importing batch ${Math.floor(i/chunkSize) + 1} of ${Math.ceil(parsedItems.length/chunkSize)} (${chunk.length} items)...`);
              
              const res = await importCsvBatchAction(userId, chunk, calibration);
              if (res.error) {
                console.error("Batch error:", res.error);
              } else if (res.added !== undefined) {
                totalAdded += res.added;
              }
            }

            setMessage(`Import complete! Added ${totalAdded} new problem(s) to your review queue.`);
          } catch (err: any) {
            setMessage(`Import error: ${err.message}`);
          } finally {
            setIsImporting(false);
            if (fileInputRef.current) {
              fileInputRef.current.value = ''; // Reset input
            }
          }
        },
        error: (error) => {
          setMessage(`Parse error: ${error.message}`);
          setIsImporting(false);
        }
      });
    }).catch(err => {
      setMessage('Failed to load CSV parser.');
      setIsImporting(false);
    });
  };

  return (
    <div className={embedded ? "space-y-6" : "glass p-4 sm:p-6 rounded-2xl"}>
      {!embedded && (
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight">Connect LeetCode Integrations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add your LeetCode username to automatically sync your solved submissions into your review loop, or bulk import problem history.
          </p>
        </div>
      )}

      {/* Historical Calibration Preference Widget */}
      <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Historical Import Calibration</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {calibration === 'confident'
              ? 'Confident: Problems start with higher stability; initial reviews are pushed out 8–15 days to avoid Day 1 backlog flood.'
              : 'Need Practice: Problems start with immediate due dates to begin active review right away.'}
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-background/80 p-1 border border-border/60 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setCalibration('confident')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              calibration === 'confident'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🌟 Confident (Paced)
          </button>
          <button
            type="button"
            onClick={() => setCalibration('need_practice')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              calibration === 'need_practice'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🎯 Need Practice (Immediate)
          </button>
        </div>
      </div>
      
      <div className={embedded ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 lg:grid-cols-3 gap-8"}>
        {/* Username Sync */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCircle className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-sm">LeetCode Profile</h3>
          </div>
          
          <div className="space-y-3">
            <label htmlFor="lc-username" className="block text-xs font-medium text-muted-foreground">Username</label>
            <div className="flex gap-2">
              <input
                id="lc-username"
                type="text"
                className="flex-1 h-11 rounded-xl border border-input bg-background/50 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="e.g. neetcode"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <button 
                onClick={handleSaveUsername}
                disabled={isSaving || username === initialUsername}
                className="h-11 px-4 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
            
            <button 
              onClick={handleSync}
              disabled={isSyncing || !initialUsername}
              className="w-full h-11 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Recent Submissions'}
            </button>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Automatically syncs your newest submissions on visit (15m cooldown), or click above to sync immediately.
            </p>
          </div>
        </div>

        {/* CSV Import */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Bulk Import (CSV)</h3>
            </div>
            <button
              type="button"
              onClick={downloadSampleCsv}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary/80 hover:bg-secondary text-[11px] font-semibold text-secondary-foreground border border-border/50 transition-colors cursor-pointer"
              title="Download pre-formatted sample CSV"
            >
              <Download className="w-3 h-3 text-primary" />
              <span>Sample CSV</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Expected Format Helper Widget */}
            <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Expected Columns</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFormatGuide(!showFormatGuide)}
                  className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{showFormatGuide ? 'Hide details' : 'View format'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showFormatGuide ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Column tags */}
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-semibold border border-emerald-500/20">
                  Problem ID <strong className="text-red-500 text-[9px] uppercase">*Required</strong>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-background/80 text-muted-foreground font-mono border border-border/50">
                  Problem Name <span className="text-[9px] opacity-70">(Optional)</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-background/80 text-muted-foreground font-mono border border-border/50">
                  Difficulty <span className="text-[9px] opacity-70">(Optional)</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-background/80 text-muted-foreground font-mono border border-border/50">
                  Pattern <span className="text-[9px] opacity-70">(Optional)</span>
                </span>
              </div>

              {/* Collapsible Format Table */}
              {showFormatGuide && (
                <div className="pt-2 border-t border-border/40 space-y-2 text-xs animate-in fade-in duration-150">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    First row must contain column headers (case-insensitive):
                  </p>

                  <div className="overflow-x-auto rounded-lg border border-border/50 text-[11px]">
                    <table className="w-full text-left">
                      <thead className="bg-secondary/50 text-foreground font-semibold border-b border-border/50">
                        <tr>
                          <th className="p-1.5">Column</th>
                          <th className="p-1.5">Accepted Headers</th>
                          <th className="p-1.5">Example</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 text-muted-foreground text-[10px]">
                        <tr>
                          <td className="p-1.5 font-semibold text-foreground">ID <span className="text-red-500">*</span></td>
                          <td className="p-1.5 font-mono">Problem ID, id, questionId, #</td>
                          <td className="p-1.5 font-mono text-emerald-500 font-bold">1</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-semibold text-foreground">Name</td>
                          <td className="p-1.5 font-mono">Problem Name, Title, Name</td>
                          <td className="p-1.5 text-foreground">Two Sum</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-semibold text-foreground">Difficulty</td>
                          <td className="p-1.5 font-mono">Difficulty, Level</td>
                          <td className="p-1.5">Easy, Medium, Hard</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-semibold text-foreground">Pattern</td>
                          <td className="p-1.5 font-mono">Pattern, Primary Topic, Topic, Tags</td>
                          <td className="p-1.5">Array, Hash Table</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
                    💡 If <code>Title</code> & <code>Difficulty</code> are provided, your CSV imports in under 1 second without waiting for LeetCode API lookups!
                  </p>
                </div>
              )}
            </div>

            {/* Upload dropzone */}
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                disabled={isImporting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              />
              <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-xl bg-background/30 hover:bg-background/50 hover:border-primary/50 transition-all group">
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors">
                  <Upload className="w-5 h-5 group-hover:scale-110 transition-transform text-primary" />
                  <span className="text-xs font-semibold">{isImporting ? 'Importing...' : 'Click or drag your CSV file here'}</span>
                  <span className="text-[10px] text-muted-foreground">Supported format: .csv</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bookmarklet Sync */}
        <div className="h-full">
          <BookmarkletCard />
        </div>
      </div>
      
      {message && (
        <div className="mt-6 p-4 rounded-xl bg-primary/10 text-primary text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          {message}
        </div>
      )}
    </div>
  );
}
