import { base44 } from '@/api/base44Client';

export async function syncPendingDockets() {
  let pending = [];
  try {
    pending = await getPendingDockets();
    if (!pending.length) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;

    for (const docket of pending) {
      try {
        await base44.entities.DriverDocket.create(docket);
        await removePendingDocket(docket.id);
        synced++;
      } catch (error) {
        console.error('Failed to sync docket:', docket.id, error);
        failed++;
      }
    }

    return { synced, failed };
  } catch (error) {
    console.error('Offline sync error:', error);
    return { synced: 0, failed: pending.length };
  }
}

export function setupOfflineSync() {
  // Sync when connection is restored
  const handleOnline = async () => {
    const result = await syncPendingDockets();
    if (result.synced > 0) {
      console.log(`Synced ${result.synced} pending dockets`);
    }
  };

  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}

async function getPendingDockets() {
  const data = localStorage.getItem('pending_dockets');
  return data ? JSON.parse(data) : [];
}

async function removePendingDocket(id) {
  const pending = await getPendingDockets();
  const updated = pending.filter(d => d.id !== id);
  localStorage.setItem('pending_dockets', JSON.stringify(updated));
}