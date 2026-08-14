'use client';

import { useState } from 'react';
import { addProblemAction } from '@/lib/actions';
import { Plus } from 'lucide-react';

export default function AddProblemForm({ userId }: { userId: string }) {
  const [problemId, setProblemId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const idNum = parseInt(problemId, 10);
    if (isNaN(idNum)) {
      setError('Please enter a valid problem number.');
      setLoading(false);
      return;
    }

    const result = await addProblemAction(userId, idNum);
    if (result.error) {
      setError(result.error);
    } else {
      setProblemId('');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="e.g. 1 (for Two Sum)"
          className="flex-1 h-11 rounded-xl border border-input bg-background/50 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground max-w-sm"
          value={problemId}
          onChange={(e) => setProblemId(e.target.value)}
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={loading || !problemId}
          className="h-11 px-6 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          {loading ? 'Adding...' : 'Add Problem'}
        </button>
      </form>
      {error && (
        <p className="text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
