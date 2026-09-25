import React from 'react';
import RED_LETTER_DATABASE from '../data/redLetterData.json';
import { renderWithCharacters } from './characterHighlightService';

export interface RedLetterEntry {
  isEntireVerse: boolean;
  segments: { text: string; isSpeech: boolean }[];
  speechPhrases: string[];
}

export const RED_LETTER_DATA: Record<string, RedLetterEntry> = RED_LETTER_DATABASE as Record<string, RedLetterEntry>;

/**
 * Exact set of canonical New Testament books where spoken words of Christ occur.
 * The 39 books of the Old Testament have ZERO red-letter verses.
 */
export const RED_LETTER_VALID_BOOKS = new Set([
  'matthew', 'mark', 'luke', 'john', 'acts',
  '1corinthians', '2corinthians', '1timothy', 'revelation'
]);

export const OLD_TESTAMENT_BOOKS = new Set([
  'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
  'joshua', 'judges', 'ruth', '1samuel', '2samuel',
  '1kings', '2kings', '1chronicles', '2chronicles',
  'ezra', 'nehemiah', 'esther', 'job', 'psalms',
  'proverbs', 'ecclesiastes', 'songofsolomon', 'isaiah',
  'jeremiah', 'lamentations', 'ezekiel', 'daniel',
  'hosea', 'joel', 'amos', 'obadiah', 'jonah',
  'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai',
  'zechariah', 'malachi'
]);

/**
 * Normalizes any Bible book name, title, abbreviation, or ID into its canonical category ID.
 * Handles "The Gospel of John", "Gospel According to St. John", "jhn", "Acts of the Apostles", etc.
 * Safely excludes John's epistles (1 John, 2 John, 3 John) and all Old Testament books.
 */
export function getCanonicalBookCategory(rawBook: string): string {
  if (!rawBook) return 'other';
  const clean = rawBook.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Immediately flag any Old Testament book
  for (const ot of OLD_TESTAMENT_BOOKS) {
    if (clean === ot || clean.startsWith(ot) || ot.startsWith(clean)) {
      return 'ot_book';
    }
  }

  // 2. Exclude epistles of John (1 John, 2 John, 3 John, I John, etc.)
  if (
    clean.startsWith('1john') || clean.startsWith('2john') || clean.startsWith('3john') ||
    clean.startsWith('1jhn') || clean.startsWith('2jhn') || clean.startsWith('3jhn') ||
    clean.startsWith('1jn') || clean.startsWith('2jn') || clean.startsWith('3jn') ||
    clean.startsWith('firstjohn') || clean.startsWith('secondjohn') || clean.startsWith('thirdjohn') ||
    clean.startsWith('ijohn') || clean.startsWith('iijohn') || clean.startsWith('iiijohn') ||
    clean.startsWith('ijn') || clean.startsWith('iijn') || clean.startsWith('iiijn')
  ) {
    return 'other';
  }

  if (clean.includes('1cor') || clean.includes('firstcor') || clean.includes('icor')) return '1corinthians';
  if (clean.includes('2cor') || clean.includes('secondcor') || clean.includes('iicor')) return '2corinthians';
  if (clean.includes('1tim') || clean.includes('firsttim') || clean.includes('itim')) return '1timothy';
  if (clean.includes('revelation') || clean.startsWith('rev') || clean.includes('apocalypse')) return 'revelation';
  if (clean.includes('acts') || clean.startsWith('act')) return 'acts';
  if (clean.includes('matthew') || clean.startsWith('matt') || clean.startsWith('mat') || clean === 'mt') return 'matthew';
  if (clean.includes('mark') || clean.startsWith('mrk') || clean === 'mk') return 'mark';
  if (clean.includes('luke') || clean.startsWith('luk') || clean === 'lk') return 'luke';
  if (clean.includes('john') || clean.startsWith('jhn') || clean === 'jn') return 'john';

  return clean;
}

/**
 * Universal canonical detector for the spoken words of Jesus Christ.
 * Powered by an authoritative word-by-word red-letter database of 2,055 verses across the New Testament.
 * Guaranteed: returns false for all Old Testament books and all non-speaking New Testament verses.
 */
export function checkIsWordsOfJesus(
  bookName: string,
  chapterNum: number | string,
  verseNum: number | string,
  verseText?: string
): boolean {
  if (!bookName) return false;
  const ch = typeof chapterNum === 'number' ? chapterNum : parseInt(String(chapterNum), 10);
  const v = typeof verseNum === 'number' ? verseNum : parseInt(String(verseNum), 10);
  if (isNaN(ch) || isNaN(v)) return false;

  const bookId = getCanonicalBookCategory(bookName);

  // STRICT GUARD: If book is not in the 9 valid NT books, it CANNOT be words of Jesus!
  if (!RED_LETTER_VALID_BOOKS.has(bookId)) {
    return false;
  }

  const key = `${bookId}_${ch}_${v}`;

  // 1. Authoritative $O(1)$ Database lookup (2,055 verses)
  if (RED_LETTER_DATA[key]) {
    return true;
  }

  // 2. Dynamic tag marker in verse text (only for the 9 valid NT books)
  if (verseText && typeof verseText === 'string') {
    if (/<(?:span\s+class=["'][^"']*\bwj\b|<wj\b)/i.test(verseText)) {
      return true;
    }
  }

  return false;
}

export interface VerseSegment {
  text: string;
  isSpeech: boolean;
}

/**
 * Parses modern translations with quotation marks where Christ's speech is quoted
 */
function parseQuotedSpeechSegments(text: string): VerseSegment[] {
  const quoteRegex = /([“"‘'][^”"’']+[”"’'])/g;
  const parts: VerseSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = quoteRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.substring(lastIndex, match.index), isSpeech: false });
    }
    parts.push({ text: match[0], isSpeech: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.substring(lastIndex), isSpeech: false });
  }

  return parts;
}

/**
 * Fallback dialogue narrative parser when verse identity is not passed
 */
function parseFallbackDialogueSegments(text: string): VerseSegment[] {
  const jesusIntroRegex = /(?:(?:^|[.?!;]|\b(?:and|then|but|so|when|while|as|now|after))\s+)?(?:\b(?:when|as)?\s*jesus\b[^\n“\"']{0,60}?\b(?:said|saith|answered|spoke|spake|replied|declared|commanded|asked|cried|called|taught)|(?:^|[.?!;]|\b(?:and|then|but|so|now))\s*(?:\bthe lord\b|\bour lord\b|\bchrist\b|\bhe\b)[^\n“\"']{0,40}?\b(?:said|saith|answered|spoke|spake|replied|declared|commanded|asked|cried|called|taught))(?:\s+(?:unto|to)\s+[^,:“\"'\n]+|\s+them|\s+him|\s+her)?\s*[,:]\s*(?:saying[,:]\s*)?/i;

  const match = jesusIntroRegex.exec(text);
  if (!match) {
    return [{ text, isSpeech: true }];
  }

  const segments: VerseSegment[] = [];
  const beforeAttr = text.substring(0, match.index);
  const attr = match[0];
  const afterAttr = text.substring(match.index + match[0].length);

  if (beforeAttr) {
    segments.push({ text: beforeAttr, isSpeech: false });
  }
  if (attr) {
    segments.push({ text: attr, isSpeech: false });
  }

  if (!afterAttr) {
    return segments;
  }

  const trimmedAfter = afterAttr.trimStart();
  const firstChar = trimmedAfter[0];

  if (firstChar === '“' || firstChar === '\"' || firstChar === '‘' || firstChar === '\'') {
    const closingChar = firstChar === '“' ? '”' : firstChar === '‘' ? '’' : firstChar;
    const closeIdx = afterAttr.indexOf(closingChar, afterAttr.indexOf(firstChar) + 1);
    if (closeIdx !== -1) {
      const speech = afterAttr.substring(0, closeIdx + 1);
      const afterSpeech = afterAttr.substring(closeIdx + 1);
      segments.push({ text: speech, isSpeech: true });
      if (afterSpeech) {
        segments.push({ text: afterSpeech, isSpeech: false });
      }
      return segments;
    }
  }

  segments.push({ text: afterAttr, isSpeech: true });
  return segments;
}

/**
 * Intelligent dialogue parser that segments a verse into narrative and Christ's direct speech.
 * Powered by word-by-word red-letter database annotations.
 */
export function parseVerseSegments(
  text: string,
  isWordsOfJesus: boolean,
  bookId?: string,
  chapterNum?: number | string,
  verseNum?: number | string
): VerseSegment[] {
  if (!text || !isWordsOfJesus) {
    return [{ text: text || '', isSpeech: false }];
  }

  // Authoritative Database check
  if (bookId && chapterNum !== undefined && verseNum !== undefined) {
    const bookCat = getCanonicalBookCategory(bookId);
    const key = `${bookCat}_${chapterNum}_${verseNum}`;
    const entry = RED_LETTER_DATA[key];

    if (entry) {
      // 1. Entire verse is spoken discourse (Sermon on the Mount, Parables, High Priestly Prayer, etc.)
      if (entry.isEntireVerse) {
        return [{ text, isSpeech: true }];
      }

      // 2. Authoritative word-level segmentation
      if (entry.segments && entry.segments.length > 0) {
        const normInput = text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const normDb = entry.segments.map(s => s.text).join('').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

        // Exact match with KJV text
        if (normInput === normDb || Math.abs(normInput.length - normDb.length) <= 5) {
          return entry.segments;
        }

        // For modern translations with quotation marks:
        if (/[“"‘']/.test(text)) {
          const quoted = parseQuotedSpeechSegments(text);
          if (quoted.length > 1) {
            return quoted;
          }
        }
      }
    }
  }

  // Fallback to dialogue attribution parser
  return parseFallbackDialogueSegments(text);
}

/**
 * Splits dialogue introductory narrative from direct speech of Jesus (backward compatible utility)
 */
export function splitWordsOfJesus(
  text: string,
  bookId?: string,
  chapterNum?: number | string,
  verseNum?: number | string
): { intro: string; speech: string } {
  if (!text) return { intro: '', speech: '' };
  const segs = parseVerseSegments(text, true, bookId, chapterNum, verseNum);
  if (segs.length >= 2 && !segs[0].isSpeech && segs[1].isSpeech) {
    return {
      intro: segs[0].text,
      speech: segs.slice(1).map(s => s.text).join('')
    };
  }
  return { intro: '', speech: text };
}

/**
 * Parses and formats verse text with Words of Christ in vibrant biblical crimson (#B91C1C).
 * Separates narrative dialogue intro from Christ's direct speech with precise formatting.
 */
export function renderRedLetterContent(
  text: string,
  isWordsOfJesus: boolean,
  showRedLetter: boolean,
  isSelected?: boolean,
  bookId?: string,
  chapterNum?: number | string,
  verseNum?: number | string,
  onCharClick?: (charId: string) => void,
  matchedCharacters?: Set<string>,
  selectedCharacter?: string | null,
  allowedCharacters?: Set<string> | null
): React.ReactNode;
export function renderRedLetterContent(
  text: string,
  isWordsOfJesus: boolean,
  showRedLetter: boolean,
  isSelected?: boolean,
  onCharClick?: (charId: string) => void,
  matchedCharacters?: Set<string>,
  selectedCharacter?: string | null,
  allowedCharacters?: Set<string> | null
): React.ReactNode;
export function renderRedLetterContent(
  text: string,
  isWordsOfJesus: boolean,
  showRedLetter: boolean,
  isSelected: boolean = false,
  arg5?: any,
  arg6?: any,
  arg7?: any,
  arg8?: any,
  arg9?: any,
  arg10?: any,
  arg11?: any
): React.ReactNode {
  if (!text) return null;

  let bookId: string | undefined;
  let chapterNum: number | string | undefined;
  let verseNum: number | string | undefined;
  let onChar: ((charId: string) => void) | undefined;
  let matched: Set<string> | undefined;
  let selectedChar: string | null | undefined;
  let allowed: Set<string> | null | undefined;

  if (typeof arg5 === 'function') {
    onChar = arg5;
    matched = arg6 instanceof Set ? arg6 : undefined;
    selectedChar = typeof arg7 === 'string' ? arg7 : null;
    allowed = arg8 instanceof Set ? arg8 : null;
  } else {
    bookId = typeof arg5 === 'string' ? arg5 : undefined;
    chapterNum = typeof arg6 === 'string' || typeof arg6 === 'number' ? arg6 : undefined;
    verseNum = typeof arg7 === 'string' || typeof arg7 === 'number' ? arg7 : undefined;
    onChar = typeof arg8 === 'function' ? arg8 : undefined;
    matched = arg9 instanceof Set ? arg9 : undefined;
    selectedChar = typeof arg10 === 'string' ? arg10 : null;
    allowed = arg11 instanceof Set ? arg11 : null;
  }

  if (!showRedLetter || !isWordsOfJesus) {
    const colorStyle = { color: isSelected ? '#26221F' : '#38332E' };
    const className = isSelected ? 'text-[#26221F]' : 'text-[#38332E]';
    return renderWithCharacters(text, colorStyle, className, onChar, matched, selectedChar, allowed);
  }

  const segments = parseVerseSegments(text, isWordsOfJesus, bookId, chapterNum, verseNum);

  return (
    <>
      {segments.map((seg, idx) => {
        if (!seg.isSpeech) {
          const colorStyle = { color: isSelected ? '#26221F' : '#78716C' };
          return (
            <React.Fragment key={idx}>
              {renderWithCharacters(seg.text, colorStyle, 'dialogue-intro-text', onChar, matched, selectedChar, allowed)}
            </React.Fragment>
          );
        }

        const speechStyle = {
          color: isSelected ? '#991B1B' : '#B91C1C',
          fontWeight: isSelected ? 600 : 500,
          textDecoration: 'underline',
          textDecorationColor: isSelected ? 'rgba(185, 28, 28, 0.85)' : 'rgba(220, 38, 38, 0.65)',
          textDecorationThickness: '1.5px',
          textUnderlineOffset: '3px'
        };
        const speechClass = `red-letter-text words-of-christ ${isSelected ? 'red-letter-text-selected' : ''}`;

        return (
          <React.Fragment key={idx}>
            {renderWithCharacters(seg.text, speechStyle, speechClass, onChar, matched, selectedChar, allowed)}
          </React.Fragment>
        );
      })}
    </>
  );
}
