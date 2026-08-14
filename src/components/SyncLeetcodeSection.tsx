'use client';

import { useState, useRef } from 'react';
import { setLeetcodeUsername, syncLeetcodeProfile, importCsvData } from '@/lib/actions';
import { RefreshCw, Upload, Save, UserCircle } from 'lucide-react';

export default function SyncLeetcodeSection({ userId, initialUsername }: { userId: string, initialUsername: string | null }) {
  const [username, setUsername] = useState(initialUsername || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveUsername = async () => {
    setIsSaving(true);
    setMessage('');
    const res = await setLeetcodeUsername(userId, username);
    if (res.error) {
      setMessage(`Error: ${res.error}`);
    } else {
      setMessage('Username saved!');
    }
    setIsSaving(false);
  };

  const handleSync = async () => {
    if (!username) {
      setMessage('Please save a username first.');
      return;
    }
    setIsSyncing(true);
    setMessage('Syncing...');
    const res = await syncLeetcodeProfile(userId);
    if (res.error) {
      setMessage(`Sync error: ${res.error}`);
    } else {
      setMessage(res.message || 'Sync complete.');
    }
    setIsSyncing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage('Reading CSV...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setMessage('Importing problems... (this may take a minute)');
      const res = await importCsvData(userId, text);
      if (res.error) {
        setMessage(`Import error: ${res.error}`);
      } else {
        setMessage(res.message || 'Import complete.');
      }
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    };
    reader.onerror = () => {
      setMessage('Failed to read file.');
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="glass p-6 rounded-2xl">
      <h2 className="text-xl font-bold tracking-tight mb-6">Integrations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              Syncs your 20 most recent accepted submissions. Make sure your profile is public.
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
