'use client';

import { useEffect } from 'react';
import { syncLeetcodeProfile } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export function AutoSyncHandler({ userId, leetcodeUsername }: { userId: string; leetcodeUsername: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!leetcodeUsername) return;

    const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes safeguard
    const storageKey = `lc_last_auto_sync_${userId}`;
    const lastSync = localStorage.getItem(storageKey);

    if (!lastSync || Date.now() - parseInt(lastSync, 10) > COOLDOWN_MS) {
      localStorage.setItem(storageKey, Date.now().toString());

      syncLeetcodeProfile(userId, false)
        .then((res) => {
          if (res.added && res.added > 0) {
            router.refresh();
          }
        })
        .catch((err) => {
          console.error('Auto-sync background error:', err);
        });
    }
  }, [userId, leetcodeUsername, router]);

  return null;
}
