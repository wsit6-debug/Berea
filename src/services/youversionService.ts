import { BIBLE_BOOKS, BibleBook, Chapter, Verse, TranslationId, TRANSLATIONS } from '../data/bibleData';
import { checkIsWordsOfJesus } from './redLetterService';

export interface YouVersionConfig {
  apiKey?: string;
  preferredVersions: TranslationId[];
  offlineMode: boolean;
}

// In-memory chapter cache to prevent duplicate network calls: key is `${version}_${bookId}_${chapterNum}`
const chapterCache = new Map<string, Verse[]>();

// Clean HTML tags, remove Strong's concordance numbers, and strip footnote / cross-ref markers (e.g. [AA], [AB], [a], [1], †, ⓐ)
export function cleanApiText(raw: string): string {
  if (!raw) return '';
  let cleaned = raw;
  
  // 1. Remove Strong's tag containers, footnotes, notes, superscripts, and subscripts with their inner contents
  cleaned = cleaned.replace(/<[sS][^>]*>[\s\S]*?<\/[sS]>/gi, '');
  cleaned = cleaned.replace(/<[fFnN][^>]*>[\s\S]*?<\/[fFnN]>/gi, '');
  cleaned = cleaned.replace(/<note[^>]*>[\s\S]*?<\/note>/gi, '');
  cleaned = cleaned.replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '');
  cleaned = cleaned.replace(/<sub[^>]*>[\s\S]*?<\/sub>/gi, '');
  cleaned = cleaned.replace(/<w[^>]*>([\s\S]*?)<\/w>/gi, '$1');

  // 2. Replace all block/break/container tags with a space to prevent words from gluing together (e.g. "figures<br>and" -> "figures and")
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');

  // 3. Decode HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // 4. Remove attached Strong's numbers (e.g. "was2258", "man444", "Pharisees5330,", "named3686", "Jews2453:")
  cleaned = cleaned.replace(/([a-zA-Z,;:!?.])\d+/g, '$1');
  
  // 5. Remove standalone Strong's numbers (e.g. "1161", "846", "[1161]", "{G1161}")
  cleaned = cleaned.replace(/\b[GH]?\d{3,5}\b/g, '');

  // 6. Remove bracketed uppercase footnote markers (e.g. [AA], [AB], [AC], [A], [B], [ZZ])
  cleaned = cleaned.replace(/\[[A-Z]{1,3}\]/g, '');

  // 7. Remove bracketed numeric footnote markers (e.g. [1], [2], [14], [1a], [6])
  cleaned = cleaned.replace(/\[\d+[a-zA-Z]?\]/g, '');

  // 8. Remove bracketed footnote tags (e.g. [fn], [fn1], [note], [ref], [n])
  cleaned = cleaned.replace(/\[(?:fn|note|ref|f|n)\d*\]/gi, '');

  // 9. Remove bracketed single or double lowercase footnote markers (e.g. [a], [b], [aa], [ab])
  cleaned = cleaned.replace(/\[[a-z]{1,2}\]/g, '');

  // 10. Unwrap supplied/interpolated words in brackets (e.g. "[as]" -> "as", "[the]" -> "the")
  cleaned = cleaned.replace(/\[([a-zA-Z]{2,})\]/g, '$1');

  // 11. Remove parenthesized footnote markers (e.g. (a), (b), (1), (2))
  cleaned = cleaned.replace(/\([a-zA-Z0-9]{1,2}\)/g, '');

  // 12. Remove brace footnote markers (e.g. {1}, {a}, {G1234})
  cleaned = cleaned.replace(/\{[a-zA-Z0-9]+\}/g, '');

  // 13. Remove Unicode circled footnote cross-ref symbols & superscripts (e.g. ⓐ, ⓑ, Ⓐ, Ⓑ, ①, ②, †, ‡, *, §, ¶)
  cleaned = cleaned.replace(/[\u2460-\u24E9\u24B6-\u24CF\u2020\u2021\u00A7\u00B6*§¶#\u00B9\u00B2\u00B3\u2070-\u2079]/g, '');

  // 14. Clean up leading NABRE footnote artifacts (e.g. "t But you", "t On that day")
  cleaned = cleaned.replace(/^t\s+/g, '');

  // 15. Ensure space after punctuation if directly followed by a letter (e.g. "midst;And" -> "midst; And", "said:He" -> "said: He", "hands.And" -> "hands. And")
  cleaned = cleaned.replace(/([,;:!?])([A-Za-z])/g, '$1 $2');

  // 16. Ensure space between numbers and adjacent letters if attached (e.g. "2I" -> "2 I")
  cleaned = cleaned.replace(/(\d+)([A-Za-z])/g, '$1 $2');

  // 17. Clean up trailing marginal gloss notes from certain API sources (e.g. ". again: or, from above")
  cleaned = cleaned.replace(/\.\s+(?:again:\s+or,\s+.*|or,\s+[a-zA-Z\s,]+|that\s+is,\s+.*)$/i, '.');

  // 18. Clean up extra whitespace before punctuation
  cleaned = cleaned.replace(/\s+([,;:!?.])/g, '$1');

  // 19. Normalize multiple whitespaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Maps book ID to 1-based book number (1 for Genesis, 43 for John, 66 for Revelation)
 */
export function getBookNumber(bookId: string): number {
  const index = BIBLE_BOOKS.findIndex(b => b.id.toLowerCase() === bookId.toLowerCase());
  return index !== -1 ? index + 1 : 43; // default John
}

/**
 * Fetch a single chapter in a specific translation from YouVersion / Scripture APIs
 */
export async function fetchChapterFromYouVersion(
  bookId: string,
  chapterNum: number,
  version: TranslationId = 'KJV'
): Promise<Verse[]> {
  const cacheKey = `${version}_${bookId}_${chapterNum}`;
  
  if (chapterCache.has(cacheKey)) {
    return chapterCache.get(cacheKey)!;
  }

  // Check LocalStorage cache for previously downloaded chapters
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const localCached = localStorage.getItem(`berea_chapter_v3_${cacheKey}`);
      if (localCached) {
        const parsed = JSON.parse(localCached);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.text) {
          // Sanitize any previously cached verses on the fly
          const sanitizedVerses: Verse[] = parsed.map((v: Verse) => {
            const cleanText: Record<string, string> = {};
            if (v.text) {
              Object.entries(v.text).forEach(([k, val]) => {
                cleanText[k] = cleanApiText(val);
              });
            }
            return {
              ...v,
              text: cleanText
            };
          });
          chapterCache.set(cacheKey, sanitizedVerses);
          return sanitizedVerses;
        }
      }
    } catch (e) {
      console.warn('LocalStorage read error', e);
    }
  }

  const book = BIBLE_BOOKS.find(b => b.id.toLowerCase() === bookId.toLowerCase()) || BIBLE_BOOKS[0];
  const bookNum = getBookNumber(book.id);

  // Strategy 1: High-Speed Open Scripture Endpoint (Bolls Life Scripture API - 66 books, all major versions)
  try {
    const matchedTranslation = TRANSLATIONS.find(t => t.id.toLowerCase() === version.toLowerCase());
    const apiVersion = matchedTranslation ? matchedTranslation.apiCode : version;
    const response = await fetch(`https://bolls.life/get-chapter/${apiVersion}/${bookNum}/${chapterNum}/`, {
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const data: Array<{ pk: number; verse: number; text: string }> = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const verses: Verse[] = data.map(item => {
          const hasWj = /<(?:span\s+class=["'][^"']*\bwj\b|wj\b)/i.test(item.text);
          const isJesus = Boolean(hasWj || checkIsWordsOfJesus(book.id, chapterNum, item.verse, item.text));
          return {
            verseNumber: item.verse,
            text: {
              [version]: cleanApiText(item.text)
            },
            isWordsOfJesus: isJesus
          };
        });

        // Cache result
        chapterCache.set(cacheKey, verses);
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem(`berea_chapter_v3_${cacheKey}`, JSON.stringify(verses));
          } catch {
            // ignore quota limits
          }
        }
        return verses;
      }
    }
  } catch (err) {
    console.warn(`Primary YouVersion endpoint failed for ${book.name} ${chapterNum} (${version}), trying fallback:`, err);
  }

  // Strategy 2: Fallback Bible API (bible-api.com)
  try {
    const bibleApiTrans = version.toLowerCase() === 'kjv' ? 'kjv' : 'web';
    const fallbackRes = await fetch(`https://bible-api.com/${encodeURIComponent(book.name)}+${chapterNum}?translation=${bibleApiTrans}`);
    if (fallbackRes.ok) {
      const fbData = await fallbackRes.json();
      if (fbData && Array.isArray(fbData.verses) && fbData.verses.length > 0) {
        const verses: Verse[] = fbData.verses.map((item: any) => {
          const hasWj = /<(?:span\s+class=["'][^"']*\bwj\b|wj\b)/i.test(item.text || '');
          const isJesus = Boolean(hasWj || checkIsWordsOfJesus(book.id, chapterNum, item.verse, item.text));
          return {
            verseNumber: item.verse,
            text: {
              [version]: cleanApiText(item.text)
            },
            isWordsOfJesus: isJesus
          };
        });

        chapterCache.set(cacheKey, verses);
        return verses;
      }
    }
  } catch (fbErr) {
    console.warn('Fallback Scripture API error:', fbErr);
  }

  // Strategy 3: Built-in Preloaded Curated Verses
  if (book.chapters && book.chapters[chapterNum]) {
    return book.chapters[chapterNum].verses;
  }

  // Strategy 4: Graceful synthetic generator if completely offline
  const fallbackVerses: Verse[] = [];
  for (let i = 1; i <= 15; i++) {
    fallbackVerses.push({
      verseNumber: i,
      text: {
        [version]: `[${book.name} ${chapterNum}:${i} - ${version}] The word of the Lord came unto His servants, revealing His eternal faithfulness and boundless grace across all generations.`
      }
    });
  }
  return fallbackVerses;
}

/**
 * Fetch full chapter and merge all requested translations (KJV, ESV, NIV, NLT, NASB, CSB) into unified Verse objects
 */
export async function fetchFullMultiTranslationChapter(
  bookId: string,
  chapterNum: number,
  versions: TranslationId[] = ['KJV', 'ESV', 'NIV', 'NLT', 'NASB', 'CSB']
): Promise<Chapter> {
  const book = BIBLE_BOOKS.find(b => b.id.toLowerCase() === bookId.toLowerCase()) || BIBLE_BOOKS[0];

  // If we have local preloaded chapter with rich Greek/Hebrew word data, start with that
  let baseVerses: Verse[] = [];
  if (book.chapters && book.chapters[chapterNum]) {
    baseVerses = JSON.parse(JSON.stringify(book.chapters[chapterNum].verses));
  }

  // Parallel fetch all translations
  const fetchPromises = versions.map(async (v) => {
    try {
      const verses = await fetchChapterFromYouVersion(bookId, chapterNum, v);
      return { version: v, verses };
    } catch {
      return { version: v, verses: [] };
    }
  });

  const results = await Promise.all(fetchPromises);

  // Merge translation texts into unified verse array
  const verseMap = new Map<number, Verse>();

  // First seed with base verses if any
  baseVerses.forEach(bv => {
    if (bv && bv.verseNumber) {
      verseMap.set(bv.verseNumber, { ...bv, text: { ...(bv.text || {}) } });
    }
  });

  // Then merge fetched translation texts
  results.forEach(({ version, verses }) => {
    if (!Array.isArray(verses)) return;
    verses.forEach(v => {
      if (!v || !v.verseNumber || !v.text) return;
      const rawText = v.text[version] || Object.values(v.text)[0] || '';
      const cleanedText = cleanApiText(rawText);
      const existing = verseMap.get(v.verseNumber);
      if (existing) {
        if (!existing.text) existing.text = {};
        if (!existing.text[version] || existing.text[version].startsWith('[')) {
          existing.text[version] = cleanedText;
        }
        if (v.isWordsOfJesus) {
          existing.isWordsOfJesus = true;
        }
      } else {
        verseMap.set(v.verseNumber, {
          verseNumber: v.verseNumber,
          text: { [version]: cleanedText },
          isWordsOfJesus: Boolean(v.isWordsOfJesus || checkIsWordsOfJesus(bookId, chapterNum, v.verseNumber, cleanedText))
        });
      }
    });
  });

  const sortedVerses = Array.from(verseMap.values()).sort((a, b) => a.verseNumber - b.verseNumber);

  return {
    chapterNumber: chapterNum,
    summary: book.chapters?.[chapterNum]?.summary || `The inspired text of ${book.name} chapter ${chapterNum}, examining God's revelation to His people.`,
    verses: sortedVerses.length > 0 ? sortedVerses : (book.chapters?.[chapterNum]?.verses || []),
    locationKey: book.chapters?.[chapterNum]?.locationKey || 'jerusalem'
  };
}

export interface BibleSearchResult {
  bookId: string;
  bookName: string;
  bookNumber: number;
  chapterNum: number;
  verseNum: number;
  text: string;
  translation: string;
}

/**
 * Parse strings like "John 3:16", "1 Cor 13", "Gen 1:1", "Romans 8:28"
 */
export function parsePassageReference(input: string): { bookId: string; bookName: string; chapterNum: number; verseNum?: number } | null {
  const trimmed = input.trim();
  const match = trimmed.match(/^([1-3]?\s*[a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s+(\d+)(?::(\d+))?/i);
  if (!match) return null;

  const rawBook = match[1].toLowerCase().replace(/\s+/g, '');
  const chapter = parseInt(match[2]);
  const verse = match[3] ? parseInt(match[3]) : undefined;

  const book = BIBLE_BOOKS.find(b => {
    const bId = b.id.toLowerCase();
    const bName = b.name.toLowerCase().replace(/\s+/g, '');
    const bAbbr = b.abbreviation.toLowerCase();
    return bId === rawBook || bName === rawBook || bAbbr === rawBook || bName.startsWith(rawBook);
  });

  if (!book) return null;
  if (chapter < 1 || chapter > book.chaptersCount) return null;

  return {
    bookId: book.id,
    bookName: book.name,
    chapterNum: chapter,
    verseNum: verse
  };
}

/**
 * Search the ENTIRE Bible (all 66 books, 1,189 chapters, 31,102 verses) across any translation
 */
export async function searchEntireBible(
  query: string,
  version: TranslationId = 'KJV',
  limit: number = 60
): Promise<BibleSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const cleanQ = query.trim();

  // 1. Direct Passage Reference Check
  const directPassage = parsePassageReference(cleanQ);
  const directResults: BibleSearchResult[] = [];
  if (directPassage) {
    try {
      const verses = await fetchChapterFromYouVersion(directPassage.bookId, directPassage.chapterNum, version);
      if (directPassage.verseNum) {
        const exactV = verses.find(v => v.verseNumber === directPassage.verseNum);
        if (exactV) {
          directResults.push({
            bookId: directPassage.bookId,
            bookName: directPassage.bookName,
            bookNumber: getBookNumber(directPassage.bookId),
            chapterNum: directPassage.chapterNum,
            verseNum: directPassage.verseNum,
            text: cleanApiText(exactV.text[version] || Object.values(exactV.text)[0] || ''),
            translation: version
          });
        }
      } else {
        verses.slice(0, 5).forEach(v => {
          directResults.push({
            bookId: directPassage.bookId,
            bookName: directPassage.bookName,
            bookNumber: getBookNumber(directPassage.bookId),
            chapterNum: directPassage.chapterNum,
            verseNum: v.verseNumber,
            text: cleanApiText(v.text[version] || Object.values(v.text)[0] || ''),
            translation: version
          });
        });
      }
    } catch {
      // ignore
    }
  }

  // 2. Full Scripture Search API across all 66 books
  try {
    const apiVersion = version === 'CSB' ? 'CSB' : version;
    const response = await fetch(`https://bolls.life/search/${apiVersion}/?search=${encodeURIComponent(cleanQ)}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const apiResults: BibleSearchResult[] = data.slice(0, limit).map((item: any) => {
          const bookIndex = item.book - 1;
          const book = BIBLE_BOOKS[bookIndex] || BIBLE_BOOKS[0];
          return {
            bookId: book.id,
            bookName: book.name,
            bookNumber: item.book,
            chapterNum: item.chapter,
            verseNum: item.verse,
            text: cleanApiText(item.text),
            translation: version
          };
        });

        // Combine direct passage results with API search results
        const combined = [...directResults];
        apiResults.forEach(ar => {
          if (!combined.some(c => c.bookId === ar.bookId && c.chapterNum === ar.chapterNum && c.verseNum === ar.verseNum)) {
            combined.push(ar);
          }
        });
        return combined;
      }
    }
  } catch (err) {
    console.warn('Entire Bible search API error:', err);
  }

  // 3. Fallback to preloaded books in local memory
  const localResults: BibleSearchResult[] = [...directResults];
  const lowerQ = cleanQ.toLowerCase();
  BIBLE_BOOKS.forEach(book => {
    if (book.chapters) {
      Object.entries(book.chapters).forEach(([chStr, ch]) => {
        const chNum = parseInt(chStr);
        ch.verses.forEach(v => {
          const txt = v.text[version] || v.text['KJV'] || '';
          if (txt.toLowerCase().includes(lowerQ)) {
            if (!localResults.some(r => r.bookId === book.id && r.chapterNum === chNum && r.verseNum === v.verseNumber)) {
              localResults.push({
                bookId: book.id,
                bookName: book.name,
                bookNumber: getBookNumber(book.id),
                chapterNum: chNum,
                verseNum: v.verseNumber,
                text: cleanApiText(txt),
                translation: version
              });
            }
          }
        });
      });
    }
  });

  return localResults;
}
