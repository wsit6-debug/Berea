import { generateQuiz, getAccumulatedBookQuiz, QuizQuestion, QuizStyle, saveChapterQuizToHistory } from './aiService';

const PREGEN_CHAPTER_PREFIX = 'berea_quiz_pregen_chapter_';
const PREGEN_BOOK_PREFIX = 'berea_quiz_pregen_book_';

let backgroundAbortController: AbortController | null = null;
let isForegroundActive = false;
let debounceTimeout: NodeJS.Timeout | null = null;

export function getCachedChapterQuiz(
  book: string,
  chapter: number,
  count?: number,
  style: QuizStyle = 'multiple_choice'
): QuizQuestion[] | null {
  try {
    let raw = localStorage.getItem(`${PREGEN_CHAPTER_PREFIX}${book}_${chapter}_${style}`);
    if (!raw && style === 'multiple_choice') {
      raw = localStorage.getItem(`${PREGEN_CHAPTER_PREFIX}${book}_${chapter}`);
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const filtered = style === 'mixed'
      ? parsed
      : parsed.filter(q => (q.style || 'multiple_choice') === style);
    if (filtered.length === 0) return null;

    // Deduplicate in case prior sessions saved duplicated questions
    const seen = new Set<string>();
    const deduplicated = filtered.filter(q => {
      const key = (q.question || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (deduplicated.length === 0) return null;
    if (count && deduplicated.length >= count) {
      return deduplicated.slice(0, count);
    }
    return deduplicated;
  } catch {
    return null;
  }
}

export function getCachedBookQuiz(
  book: string,
  count?: number,
  style: QuizStyle = 'multiple_choice'
): QuizQuestion[] | null {
  try {
    let raw = localStorage.getItem(`${PREGEN_BOOK_PREFIX}${book}_${style}`);
    if (!raw && style === 'multiple_choice') {
      raw = localStorage.getItem(`${PREGEN_BOOK_PREFIX}${book}`);
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const filtered = style === 'mixed'
      ? parsed
      : parsed.filter(q => (q.style || 'multiple_choice') === style);
    if (filtered.length === 0) return null;

    // Deduplicate in case prior sessions saved duplicated questions
    const seen = new Set<string>();
    const deduplicated = filtered.filter(q => {
      const key = (q.question || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (deduplicated.length === 0) return null;
    if (count && deduplicated.length >= count) {
      return deduplicated.slice(0, count);
    }
    return deduplicated;
  } catch {
    return null;
  }
}

export function saveCachedChapterQuiz(
  book: string,
  chapter: number,
  questions: QuizQuestion[],
  style: QuizStyle = 'multiple_choice'
): void {
  try {
    localStorage.setItem(`${PREGEN_CHAPTER_PREFIX}${book}_${chapter}_${style}`, JSON.stringify(questions));
    window.dispatchEvent(new CustomEvent('berea_quiz_cache_updated', { detail: { type: 'chapter', book, chapter, style } }));
  } catch (e) {
    console.warn('Failed to cache chapter quiz', e);
  }
}

export function saveCachedBookQuiz(
  book: string,
  questions: QuizQuestion[],
  style: QuizStyle = 'multiple_choice'
): void {
  try {
    localStorage.setItem(`${PREGEN_BOOK_PREFIX}${book}_${style}`, JSON.stringify(questions));
    window.dispatchEvent(new CustomEvent('berea_quiz_cache_updated', { detail: { type: 'book', book, style } }));
  } catch (e) {
    console.warn('Failed to cache book quiz', e);
  }
}

/**
 * Foreground generation: takes 100% priority. Immediately halts any background pre-generation.
 */
export async function requestForegroundQuiz(
  type: 'chapter' | 'book',
  book: string,
  chapter: number,
  chapterText: string | undefined,
  onProgress?: (current: number, total: number) => void,
  customCount?: number,
  style: QuizStyle = 'multiple_choice'
): Promise<QuizQuestion[]> {
  // 1. Immediately cancel any background task
  if (backgroundAbortController) {
    backgroundAbortController.abort();
    backgroundAbortController = null;
  }
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
    debounceTimeout = null;
  }

  isForegroundActive = true;
  const numQuestions = Math.max(5, Math.min(100, customCount || (type === 'book' ? 10 : 5)));

  try {
    // 2. Check cache first for instant retrieval if cached questions satisfy the requested count and style
    if (type === 'chapter') {
      const cached = getCachedChapterQuiz(book, chapter, numQuestions, style);
      if (cached && cached.length >= numQuestions) {
        onProgress?.(numQuestions, numQuestions);
        return cached.slice(0, numQuestions);
      }
    } else {
      const cached = getCachedBookQuiz(book, numQuestions, style);
      if (cached && cached.length >= numQuestions) {
        onProgress?.(numQuestions, numQuestions);
        return cached.slice(0, numQuestions);
      }
    }

    // 3. Generate ONLY the requested quiz with chosen length and style
    if (type === 'book') {
      onProgress?.(0, numQuestions);
      const historyQuestions = await getAccumulatedBookQuiz(book, numQuestions, onProgress, undefined, style);
      if (historyQuestions.length > 0) {
        saveCachedBookQuiz(book, historyQuestions, style);
      }
      return historyQuestions.slice(0, numQuestions);
    } else {
      onProgress?.(0, numQuestions);
      const generated = await generateQuiz(book, chapter, 'chapter', numQuestions, chapterText, onProgress, undefined, style);
      saveCachedChapterQuiz(book, chapter, generated, style);
      saveChapterQuizToHistory(book, chapter, generated, style);
      return generated.slice(0, numQuestions);
    }
  } finally {
    isForegroundActive = false;
  }
}

/**
 * Background pre-generation: runs ONLY when no foreground quiz is active.
 * Pre-generates the chapter quiz, then the book quiz sequentially.
 */
export function scheduleBackgroundQuizPreGeneration(
  book: string,
  chapter: number,
  chapterText: string | undefined
): void {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
    debounceTimeout = null;
  }

  debounceTimeout = setTimeout(async () => {
    // Do not run background worker if the user is currently taking or generating a quiz
    if (isForegroundActive) return;

    // Create fresh abort controller for this background session
    if (backgroundAbortController) {
      backgroundAbortController.abort();
    }
    const abortController = new AbortController();
    backgroundAbortController = abortController;

    try {
      // 1. Check & generate Chapter Quiz first if not already cached
      const hasChapterQuiz = Boolean(getCachedChapterQuiz(book, chapter));
      if (!hasChapterQuiz && !abortController.signal.aborted && !isForegroundActive) {
        const numQuestions = 3;
        const generated = await generateQuiz(
          book,
          chapter,
          'chapter',
          numQuestions,
          chapterText,
          undefined,
          abortController.signal
        );
        if (!abortController.signal.aborted && !isForegroundActive && generated.length > 0) {
          saveCachedChapterQuiz(book, chapter, generated);
          saveChapterQuizToHistory(book, chapter, generated);
        }
      }

      // 2. Then check & generate Book Quiz if not already cached
      const hasBookQuiz = Boolean(getCachedBookQuiz(book));
      if (!hasBookQuiz && !abortController.signal.aborted && !isForegroundActive) {
        const bookQuestions = await getAccumulatedBookQuiz(
          book,
          10,
          undefined,
          abortController.signal
        );
        if (!abortController.signal.aborted && !isForegroundActive && bookQuestions.length > 0) {
          saveCachedBookQuiz(book, bookQuestions);
        }
      }
    } catch {
      // Background errors or aborts are completely silent
    } finally {
      if (backgroundAbortController === abortController) {
        backgroundAbortController = null;
      }
    }
  }, 2500);
}
