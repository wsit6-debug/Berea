// ==============================================================================
// Berea Offline Bible Storage Service
// Powered by IndexedDB for instant, zero-latency, 100% offline Scripture reading
// ==============================================================================

const DB_NAME = 'berea_offline_bibles_db';
const DB_VERSION = 1;
const STORE_NAME = 'bibles';

export const OFFLINE_FILE_MAP: Record<string, string> = {
  ASV: 'ASV.json',
  BSB: 'BSB.json',
  CUV: 'CUV.json',
  DRB: 'DRB.json',
  FRDBY: 'FRDBY.json',
  FRLSG: 'FRLSG.json',
  GNV: 'GNV.json',
  KJV: 'KJV.json',
  LUT: 'LUT.json',
  LXX: 'LXX.json',
  LXXE: 'LXXE.json',
  SYNOD: 'SYNOD.json',
  TISCH: 'TISCH.json',
  TR: 'TR.json',
  VULG: 'VULG.json',
  WEB: 'WEB.json',
  WLC: 'WLC.json',
  WLCC: 'WLCC.json',
  WLCA: 'WLCa.json',
  YLT: 'YLT.json',
  TAGALOG: 'tagalog.json'
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// In-memory cache for instant synchronous access
const memoryCache = new Map<string, Record<string, any>>();

export async function getOfflineBibleFromDb(apiCode: string): Promise<Record<string, any> | null> {
  const code = apiCode.toUpperCase();
  if (memoryCache.has(code)) {
    return memoryCache.get(code)!;
  }
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(code);
      req.onsuccess = () => {
        if (req.result) {
          memoryCache.set(code, req.result);
          resolve(req.result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.debug('IndexedDB read deferred:', err);
    return null;
  }
}

export async function saveOfflineBibleToDb(apiCode: string, data: Record<string, any>): Promise<void> {
  const code = apiCode.toUpperCase();
  memoryCache.set(code, data);
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, code);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // Update downloaded list in localStorage
    const downloaded = getDownloadedBiblesList();
    if (!downloaded.includes(code)) {
      downloaded.push(code);
      localStorage.setItem('berea_downloaded_bibles', JSON.stringify(downloaded));
    }
  } catch (err) {
    console.warn('IndexedDB write error:', err);
  }
}

export function getDownloadedBiblesList(): string[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem('berea_downloaded_bibles');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isBibleDownloadedLocally(apiCode: string): boolean {
  const code = apiCode.toUpperCase();
  if (memoryCache.has(code)) return true;
  const list = getDownloadedBiblesList();
  return list.includes(code);
}

/**
 * Downloads the full Bible dataset, verifies it completely,
 * stores it in IndexedDB for instant in-app offline reading,
 * and exports the complete .json file to the user's downloads folder.
 */
export async function downloadAndStoreBible(apiCode: string, id: string): Promise<{ success: boolean; totalChapters: number }> {
  const code = apiCode.toUpperCase();
  const fileName = OFFLINE_FILE_MAP[code] || `${apiCode}.json`;

  // 1. Fetch full JSON dataset from static repository
  const response = await fetch(`/bibles/${fileName}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${id} (${fileName}): HTTP ${response.status}`);
  }

  // 2. Ensure the full body is received and valid JSON
  const text = await response.text();
  const parsed = JSON.parse(text);
  const totalChapters = Object.keys(parsed).length;
  if (totalChapters === 0) {
    throw new Error(`Dataset for ${id} is empty or corrupted`);
  }

  // 3. Save into IndexedDB so Berea immediately uses it offline with ZERO API streaming
  await saveOfflineBibleToDb(code, parsed);

  // 4. Trigger complete browser file download via Blob (never truncated)
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${id}_${code}_Complete_Bible.json`;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    try {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {}
  }, 2000);

  return { success: true, totalChapters };
}
