/**
 * Safe local storage service with automated quota management and LRU/disposable cache pruning.
 * Protects critical user data (bookmarks, notepad notes, saved themes, user settings).
 */

const PROTECTED_PREFIXES = [
  'berea_bookmarks',
  'berea_notepad',
  'berea_theme',
  'berea_saved_themes_list',
  'berea_user_denomination',
  'berea_language',
  'berea_study_guide_audience',
  'berea_show_red_letters',
  'berea_preferred_voice',
  'berea_current_passage'
];

const DISPOSABLE_PREFIXES = [
  'berea_chapter_v5_',
  'berea_symbolism_',
  'berea_commentary_',
  'berea_pregen_quiz_',
  'berea_pregen_book_',
  'berea_char_cache_',
  'berea_votd_'
];

export function isQuotaExceededError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    // everything except Firefox
    (err.code === 22 ||
      // Firefox
      err.code === 1014 ||
      // test name field too, because code might not exist
      // everything except Firefox
      err.name === 'QuotaExceededError' ||
      // Firefox
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED') ||
    (typeof err === 'object' && err !== null && 'message' in err && 
      typeof (err as any).message === 'string' && 
      (err as any).message.toLowerCase().includes('quota'))
  );
}

/**
 * Clears non-essential cached data (chapters, symbolism, commentary, quizzes)
 * while preserving notes, bookmarks, and user preferences.
 */
export function pruneDisposableCache(): number {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return 0;
  }

  let clearedCount = 0;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const isProtected = PROTECTED_PREFIXES.some(prefix => key.startsWith(prefix));
      if (isProtected) continue;

      const isDisposable = DISPOSABLE_PREFIXES.some(prefix => key.startsWith(prefix));
      if (isDisposable) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      clearedCount++;
    });
  } catch (err) {
    console.warn('Failed while pruning disposable cache:', err);
  }

  return clearedCount;
}

/**
 * Safely sets an item in localStorage.
 * If quota is exceeded, purges disposable caches and retries.
 * If it still fails, gracefully ignores the cache failure to prevent crashing features.
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    if (isQuotaExceededError(err)) {
      console.warn(`[storageService] Quota exceeded on "${key}". Pruning disposable cache...`);
      pruneDisposableCache();

      try {
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.warn(`[storageService] Storage still full after pruning. Skipping cache write for "${key}".`, retryErr);
        return false;
      }
    }

    console.warn(`[storageService] Failed to set localStorage key "${key}":`, err);
    return false;
  }
}
