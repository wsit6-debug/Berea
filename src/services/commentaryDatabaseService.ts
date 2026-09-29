/**
 * Berea Public Domain Commentary Database Service
 * 
 * Provides instant, zero-latency, authentic verbatim historical commentary
 * loaded from partitioned JSON shards under /commentaries/[commentatorId]/[bookId].json.
 */

export interface VerbatimCommentaryResult {
  text: string;
  sourceWork: string;
  commentatorName: string;
  century: string;
  isAuthenticVerbatim: boolean;
}

// In-memory cache for loaded book files: key is `${commentatorId}_${bookId}`
const bookCache = new Map<string, Record<string, Record<string, string>>>();

const BOOK_ALIAS_MAP: Record<string, string> = {
  'gen': 'genesis', 'genesis': 'genesis',
  'exo': 'exodus', 'exodus': 'exodus', 'exod': 'exodus',
  'lev': 'leviticus', 'leviticus': 'leviticus',
  'num': 'numbers', 'numbers': 'numbers',
  'deu': 'deuteronomy', 'deuteronomy': 'deuteronomy', 'deut': 'deuteronomy',
  'jos': 'joshua', 'joshua': 'joshua', 'josh': 'joshua',
  'jdg': 'judges', 'judges': 'judges', 'judg': 'judges',
  'rut': 'ruth', 'ruth': 'ruth',
  '1sa': '1samuel', '1samuel': '1samuel', '1 samuel': '1samuel', '1 sam': '1samuel', '1sam': '1samuel',
  '2sa': '2samuel', '2samuel': '2samuel', '2 samuel': '2samuel', '2 sam': '2samuel', '2sam': '2samuel',
  '1ki': '1kings', '1kings': '1kings', '1 kings': '1kings', '1 kgs': '1kings', '1kgs': '1kings',
  '2ki': '2kings', '2kings': '2kings', '2 kings': '2kings', '2 kgs': '2kings', '2kgs': '2kings',
  '1ch': '1chronicles', '1chronicles': '1chronicles', '1 chronicles': '1chronicles', '1 chron': '1chronicles',
  '2ch': '2chronicles', '2chronicles': '2chronicles', '2 chronicles': '2chronicles', '2 chron': '2chronicles',
  'ezr': 'ezra', 'ezra': 'ezra',
  'neh': 'nehemiah', 'nehemiah': 'nehemiah',
  'est': 'esther', 'esther': 'esther', 'esth': 'esther',
  'job': 'job',
  'psa': 'psalms', 'psalms': 'psalms', 'psalm': 'psalms', 'ps': 'psalms',
  'pro': 'proverbs', 'proverbs': 'proverbs', 'prov': 'proverbs',
  'ecc': 'ecclesiastes', 'ecclesiastes': 'ecclesiastes', 'eccl': 'ecclesiastes',
  'sng': 'songofsolomon', 'song of solomon': 'songofsolomon', 'songofsolomon': 'songofsolomon', 'canticles': 'songofsolomon',
  'isa': 'isaiah', 'isaiah': 'isaiah',
  'jer': 'jeremiah', 'jeremiah': 'jeremiah',
  'lam': 'lamentations', 'lamentations': 'lamentations',
  'ezk': 'ezekiel', 'ezekiel': 'ezekiel', 'ezek': 'ezekiel',
  'dan': 'daniel', 'daniel': 'daniel',
  'hos': 'hosea', 'hosea': 'hosea',
  'jol': 'joel', 'joel': 'joel',
  'amo': 'amos', 'amos': 'amos',
  'oba': 'obadiah', 'obadiah': 'obadiah', 'obad': 'obadiah',
  'jon': 'jonah', 'jonah': 'jonah',
  'mic': 'micah', 'micah': 'micah',
  'nam': 'nahum', 'nahum': 'nahum', 'nah': 'nahum',
  'hab': 'habakkuk', 'habakkuk': 'habakkuk',
  'zep': 'zephaniah', 'zephaniah': 'zephaniah', 'zeph': 'zephaniah',
  'hag': 'haggai', 'haggai': 'haggai',
  'zec': 'zechariah', 'zechariah': 'zechariah', 'zech': 'zechariah',
  'mal': 'malachi', 'malachi': 'malachi',
  'mat': 'matthew', 'matthew': 'matthew', 'matt': 'matthew',
  'mrk': 'mark', 'mark': 'mark',
  'luk': 'luke', 'luke': 'luke',
  'jhn': 'john', 'john': 'john',
  'act': 'acts', 'acts': 'acts',
  'rom': 'romans', 'romans': 'romans',
  '1co': '1corinthians', '1corinthians': '1corinthians', '1 corinthians': '1corinthians', '1 cor': '1corinthians',
  '2co': '2corinthians', '2corinthians': '2corinthians', '2 corinthians': '2corinthians', '2 cor': '2corinthians',
  'gal': 'galatians', 'galatians': 'galatians',
  'eph': 'ephesians', 'ephesians': 'ephesians',
  'php': 'philippians', 'philippians': 'philippians', 'phil': 'philippians',
  'col': 'colossians', 'colossians': 'colossians',
  '1th': '1thessalonians', '1thessalonians': '1thessalonians', '1 thessalonians': '1thessalonians', '1 thess': '1thessalonians',
  '2th': '2thessalonians', '2thessalonians': '2thessalonians', '2 thessalonians': '2thessalonians', '2 thess': '2thessalonians',
  '1ti': '1timothy', '1timothy': '1timothy', '1 timothy': '1timothy', '1 tim': '1timothy',
  '2ti': '2timothy', '2timothy': '2timothy', '2 timothy': '2timothy', '2 tim': '2timothy',
  'tit': 'titus', 'titus': 'titus',
  'phm': 'philemon', 'philemon': 'philemon', 'phlm': 'philemon',
  'heb': 'hebrews', 'hebrews': 'hebrews',
  'jas': 'james', 'james': 'james',
  '1pe': '1peter', '1peter': '1peter', '1 peter': '1peter', '1 pet': '1peter',
  '2pe': '2peter', '2peter': '2peter', '2 peter': '2peter', '2 pet': '2peter',
  '1jn': '1john', '1john': '1john', '1 john': '1john', '1 jn': '1john',
  '2jn': '2john', '2john': '2john', '2 john': '2john', '2 jn': '2john',
  '3jn': '3john', '3john': '3john', '3 john': '3john', '3 jn': '3john',
  'jud': 'jude', 'jude': 'jude',
  'rev': 'revelation', 'revelation': 'revelation', 'apocalypse': 'revelation'
};

export function normalizeCommentaryBookId(bookNameOrId: string): string {
  const clean = bookNameOrId.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
  return BOOK_ALIAS_MAP[clean] || BOOK_ALIAS_MAP[clean.replace(/\s+/g, '')] || clean.replace(/\s+/g, '');
}

/**
 * Loads the JSON commentary data for a given commentator and book.
 * Caches in-memory to prevent repeated network requests.
 */
export async function loadCommentaryBook(
  commentatorId: string,
  bookNameOrId: string
): Promise<Record<string, Record<string, string>> | null> {
  const normBook = normalizeCommentaryBookId(bookNameOrId);
  const cacheKey = `${commentatorId}_${normBook}`;

  if (bookCache.has(cacheKey)) {
    return bookCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(`/commentaries/${commentatorId}/${normBook}.json`);
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    bookCache.set(cacheKey, data);
    return data;
  } catch (err) {
    console.debug(`[commentaryDatabase] Commentary not found for ${commentatorId}/${normBook}`);
    return null;
  }
}

/**
 * Retrieves verbatim historical commentary for a specific verse or verse range.
 */
export async function getVerbatimCommentary(
  commentatorId: string,
  commentatorName: string,
  sourceWork: string,
  century: string,
  bookNameOrId: string,
  chapter: number,
  startVerse: number,
  endVerse?: number
): Promise<VerbatimCommentaryResult | null> {
  const bookData = await loadCommentaryBook(commentatorId, bookNameOrId);
  if (!bookData) return null;

  const chStr = String(chapter);
  const chapterVerses = bookData[chStr];
  if (!chapterVerses) return null;

  const targetEnd = endVerse && endVerse >= startVerse ? endVerse : startVerse;
  const quotes: string[] = [];
  const seenTexts = new Set<string>();

  for (let v = startVerse; v <= targetEnd; v++) {
    let verseText = chapterVerses[String(v)];
    if (verseText && verseText.startsWith('@')) {
      const refV = verseText.slice(1);
      verseText = chapterVerses[refV] || verseText;
    }
    if (verseText && verseText.trim().length > 0 && !seenTexts.has(verseText.trim())) {
      seenTexts.add(verseText.trim());
      if (targetEnd > startVerse) {
        quotes.push(`**Verse ${v}**\n\n${verseText.trim()}`);
      } else {
        quotes.push(verseText.trim());
      }
    }
  }

  if (quotes.length === 0) {
    return null;
  }

  return {
    text: quotes.join('\n\n---\n\n'),
    sourceWork,
    commentatorName,
    century,
    isAuthenticVerbatim: true
  };
}
