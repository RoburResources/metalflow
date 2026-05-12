// Offline storage using IndexedDB for sync capability
const DB_NAME = 'MXRenewables';
const STORE_NAME = 'dockets';
const DB_VERSION = 1;

let db = null;

export async function initOfflineDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => { db = req.result; resolve(db); };
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(STORE_NAME)) {
        d.createObjectStore(STORE_NAME, { keyPath: 'ticket_no' });
      }
    };
  });
}

export async function saveDocketOffline(docket) {
  if (!db) await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put({ ...docket, synced: false, timestamp: Date.now() });
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(docket.ticket_no);
  });
}

export async function getPendingDockets() {
  if (!db) await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result.filter(d => !d.synced));
  });
}

export async function markDocketSynced(ticket_no) {
  if (!db) await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(ticket_no);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const docket = req.result;
      if (docket) {
        docket.synced = true;
        const updateReq = store.put(docket);
        updateReq.onerror = () => reject(updateReq.error);
        updateReq.onsuccess = () => resolve();
      }
    };
  });
}

export async function clearOfflineDB() {
  if (!db) await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });
}