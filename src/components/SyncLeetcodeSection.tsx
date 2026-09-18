'use client';

import { useState, useRef, useEffect } from 'react';
import { setLeetcodeUsername, syncLeetcodeProfile, importCsvBatchAction } from '@/lib/actions';
import { RefreshCw, Upload, Save, UserCircle, Sparkles } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            const data = results.data as Record<string, string>[];
            if (!data.length) {
              throw new Error("CSV is empty or missing headers");
            }
            
            // Find the ID column
            const headers = Object.keys(data[0]);
            const idCol = headers.find(h => {
              const lower = h.toLowerCase().replace(/["']/g, '').trim();
              return lower === 'id' || lower === 'questionid' || lower === 'frontend_question_id' || lower === 'question id';
            });

            if (!idCol) {
              throw new Error("CSV must contain an 'id' or 'questionId' column");
            }

            const ids = data
              .map(row => parseInt(row[idCol]?.replace(/["']/g, '').trim() || '', 10))
              .filter(id => !isNaN(id) && id > 0);

            if (ids.length === 0) {
              throw new Error("No valid IDs found in the CSV");
            }

            setMessage(`Importing ${ids.length} problems in batches...`);
            
            // Process in chunks of 50
            const chunkSize = 50;
            let totalAdded = 0;
            
            for (let i = 0; i < ids.length; i += chunkSize) {
              const chunk = ids.slice(i, i + chunkSize);
              setMessage(`Importing batch ${Math.floor(i/chunkSize) + 1} of ${Math.ceil(ids.length/chunkSize)}...`);
              
              const res = await importCsvBatchAction(userId, chunk, calibration);
              if (res.error) {
                console.error("Batch error:", res.error);
              } else if (res.added) {
                totalAdded += res.added;
              }
            }

            setMessage(`Import complete. Successfully added ${totalAdded} problems.`);
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
          <div className="flex items-center gap-2 mb-2">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Bulk Import</h3>
          </div>
          
          <div className="space-y-3">
            <label className="block text-xs font-medium text-muted-foreground">Upload CSV</label>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                disabled={isImporting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              />
              <div className="flex items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-xl bg-background/30 hover:bg-background/50 transition-colors group">
                <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                  <Upload className="w-6 h-6" />
                  <span className="text-sm font-medium">{isImporting ? 'Importing...' : 'Click or drag CSV file'}</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Upload a CSV containing an <code>id</code> or <code>questionId</code> column to bulk import problems.
            </p>
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
