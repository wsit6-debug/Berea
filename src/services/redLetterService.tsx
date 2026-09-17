import React from 'react';
import { renderWithCharacters } from './characterHighlightService';

/**
 * Normalizes any Bible book name, title, abbreviation, or ID into its canonical category.
 * Handles "The Gospel of John", "Gospel According to St. John", "jhn", "Acts of the Apostles", etc.
 * Safely ignores John's epistles (1 John, 2 John, 3 John).
 */
export function getCanonicalBookCategory(rawBook: string): 'john' | 'matthew' | 'luke' | 'mark' | 'acts' | 'revelation' | 'other' {
  if (!rawBook) return 'other';
  const clean = rawBook.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Exclude epistles of John (1 John, 2 John, 3 John, I John, etc.)
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

  if (clean.includes('revelation') || clean.startsWith('rev') || clean.includes('apocalypse')) {
    return 'revelation';
  }
  if (clean.includes('acts') || clean.startsWith('act')) {
    return 'acts';
  }
  if (clean.includes('matthew') || clean.startsWith('matt') || clean.startsWith('mat') || clean === 'mt') {
    return 'matthew';
  }
  if (clean.includes('mark') || clean.startsWith('mrk') || clean === 'mk') {
    return 'mark';
  }
  if (clean.includes('luke') || clean.startsWith('luk') || clean === 'lk') {
    return 'luke';
  }
  if (clean.includes('john') || clean.startsWith('jhn') || clean === 'jn') {
    return 'john';
  }

  return 'other';
}

/**
 * Universal canonical detector for the spoken words of Jesus Christ
 * Complete and precise coverage for all 4 Gospels (Matthew, Mark, Luke, John), Acts, and Revelation
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

  const bookCat = getCanonicalBookCategory(bookName);

  // 1. Dynamic detection from verse text (if available)
  if (verseText && typeof verseText === 'string') {
    if (/<(?:span\s+class=["'][^"']*\bwj\b|wj\b)/i.test(verseText)) {
      return true;
    }
    // Dialogue attribution pattern in Gospels, Acts, Revelation, or Epistles
    if (bookCat !== 'other' || /corinthians/i.test(bookName)) {
      const jesusDialoguePattern = /(?:(?:^|[.?!;]|\b(?:and|then|but|so|when|while|as|now|after))\s+)?(?:\b(?:when|as)?\s*jesus\b[^\n“\"']{0,60}?\b(?:said|saith|answered|spoke|spake|replied|declared|commanded|asked|cried|called|taught)|(?:^|[.?!;]|\b(?:and|then|but|so|now))\s*(?:\bthe lord\b|\bour lord\b|\bchrist\b|\bhe\b)[^\n“\"']{0,40}?\b(?:said|saith|answered|spoke|spake|replied|declared|commanded|asked|cried|called|taught))(?:\s+(?:unto|to)\s+[^,:“\"'\n]+|\s+them|\s+him|\s+her)?\s*[,:]/i;
      if (jesusDialoguePattern.test(verseText)) {
        return true;
      }
    }
  }

  // 1. Gospel of John
  if (bookCat === 'john') {
    if (ch === 1) return v === 38 || v === 39 || v === 42 || v === 43 || v === 47 || v === 48 || v === 50 || v === 51;
    if (ch === 2) return v === 4 || v === 7 || v === 8 || v === 16 || v === 19;
    if (ch === 3) return v === 3 || (v >= 5 && v <= 8) || (v >= 10 && v <= 21); // Nicodemus discourse (excluding Nicodemus questions v4, v9)
    if (ch === 4) return v === 7 || v === 10 || (v >= 13 && v <= 14) || v === 16 || v === 17 || v === 18 || (v >= 21 && v <= 24) || v === 26 || v === 32 || (v >= 34 && v <= 38) || v === 48 || v === 50 || v === 53;
    if (ch === 5) return v === 6 || v === 8 || v === 14 || v === 17 || (v >= 19 && v <= 47);
    if (ch === 6) return v === 5 || v === 10 || v === 12 || v === 20 || (v >= 26 && v <= 27) || v === 29 || (v >= 32 && v <= 33) || (v >= 35 && v <= 40) || (v >= 43 && v <= 51) || (v >= 53 && v <= 58) || (v >= 61 && v <= 65) || v === 67 || v === 70;
    if (ch === 7) return (v >= 6 && v <= 8) || (v >= 16 && v <= 24) || (v >= 28 && v <= 29) || (v >= 33 && v <= 34) || (v >= 37 && v <= 38);
    if (ch === 8) return v === 7 || v === 10 || v === 11 || v === 12 || (v >= 14 && v <= 19) || v === 21 || (v >= 23 && v <= 24) || v === 25 || v === 26 || (v >= 28 && v <= 29) || (v >= 31 && v <= 32) || (v >= 34 && v <= 38) || v === 39 || (v >= 40 && v <= 47) || (v >= 49 && v <= 51) || (v >= 54 && v <= 56) || v === 58;
    if (ch === 9) return (v >= 3 && v <= 5) || v === 7 || v === 35 || v === 37 || v === 39 || v === 41;
    if (ch === 10) return (v >= 1 && v <= 18) || (v >= 25 && v <= 30) || v === 32 || (v >= 34 && v <= 38);
    if (ch === 11) return v === 4 || (v >= 9 && v <= 10) || v === 11 || (v >= 14 && v <= 15) || v === 23 || (v >= 25 && v <= 26) || v === 34 || v === 39 || v === 40 || (v >= 41 && v <= 42) || v === 43 || v === 44;
    if (ch === 12) return (v >= 7 && v <= 8) || (v >= 23 && v <= 28) || (v >= 30 && v <= 32) || (v >= 35 && v <= 36) || (v >= 44 && v <= 50);
    if (ch === 13) return v === 7 || v === 8 || v === 10 || (v >= 12 && v <= 21) || v === 26 || v === 27 || (v >= 31 && v <= 35) || v === 36 || v === 38;
    if (ch === 14) return (v >= 1 && v <= 4) || (v >= 6 && v <= 7) || (v >= 9 && v <= 21) || (v >= 23 && v <= 31);
    if (ch === 15) return true; // True Vine discourse (all verses)
    if (ch === 16) return (v >= 1 && v <= 16) || (v >= 19 && v <= 28) || (v >= 31 && v <= 33);
    if (ch === 17) return true; // High Priestly Prayer (all verses)
    if (ch === 18) return v === 4 || v === 5 || v === 7 || v === 8 || v === 11 || (v >= 20 && v <= 21) || v === 23 || v === 34 || v === 36 || v === 37;
    if (ch === 19) return v === 11 || v === 26 || v === 27 || v === 28 || v === 30;
    if (ch === 20) return v === 15 || v === 16 || v === 17 || v === 19 || v === 21 || v === 22 || v === 23 || v === 26 || v === 27 || v === 29;
    if (ch === 21) return v === 5 || v === 6 || v === 10 || v === 12 || v === 15 || v === 16 || v === 17 || v === 19 || v === 22;
  }

  // 2. Gospel of Matthew
  if (bookCat === 'matthew') {
    if (ch === 3) return v === 15;
    if (ch === 4) return v === 4 || v === 7 || v === 10 || v === 17 || v === 19;
    if (ch === 5) return (v >= 3 && v <= 48); // Sermon on the Mount (Beatitudes to end)
    if (ch === 6) return true; // Sermon on the Mount (all verses)
    if (ch === 7) return (v >= 1 && v <= 27); // Sermon on the Mount (v28-29 are narrative conclusion)
    if (ch === 8) return v === 3 || v === 4 || v === 7 || (v >= 10 && v <= 13) || v === 20 || v === 22 || v === 26 || v === 32;
    if (ch === 9) return v === 2 || (v >= 4 && v <= 6) || v === 9 || (v >= 12 && v <= 13) || v === 15 || (v >= 16 && v <= 17) || v === 22 || v === 24 || v === 28 || (v >= 29 && v <= 30) || (v >= 37 && v <= 38);
    if (ch === 10) return (v >= 5 && v <= 42); // Commissioning the Twelve
    if (ch === 11) return (v >= 4 && v <= 30); // Discourse on John the Baptist & Great Invitation
    if (ch === 12) return (v >= 3 && v <= 8) || (v >= 11 && v <= 12) || (v >= 25 && v <= 45) || (v >= 48 && v <= 50);
    if (ch === 13) return (v >= 3 && v <= 9) || (v >= 11 && v <= 33) || (v >= 37 && v <= 52) || v === 57; // Parables of Kingdom
    if (ch === 14) return v === 16 || v === 18 || v === 27 || v === 29 || v === 31;
    if (ch === 15) return (v >= 3 && v <= 11) || (v >= 13 && v <= 20) || v === 24 || v === 26 || v === 28 || v === 32 || v === 34;
    if (ch === 16) return (v >= 2 && v <= 4) || v === 6 || (v >= 8 && v <= 12) || v === 13 || v === 15 || (v >= 17 && v <= 19) || v === 23 || (v >= 24 && v <= 28);
    if (ch === 17) return v === 7 || v === 9 || (v >= 11 && v <= 12) || v === 17 || (v >= 20 && v <= 21) || (v >= 22 && v <= 23) || (v >= 25 && v <= 27);
    if (ch === 18) return (v >= 3 && v <= 35); // Discourse on Childlike Faith & Forgiveness
    if (ch === 19) return (v >= 4 && v <= 6) || (v >= 8 && v <= 9) || (v >= 11 && v <= 12) || v === 14 || v === 17 || (v >= 18 && v <= 19) || v === 21 || (v >= 23 && v <= 24) || v === 26 || (v >= 28 && v <= 30);
    if (ch === 20) return (v >= 1 && v <= 16) || (v >= 18 && v <= 19) || v === 21 || (v >= 22 && v <= 23) || (v >= 25 && v <= 28) || v === 32;
    if (ch === 21) return (v >= 2 && v <= 3) || v === 13 || v === 16 || v === 19 || (v >= 21 && v <= 22) || (v >= 24 && v <= 25) || (v >= 28 && v <= 32) || (v >= 33 && v <= 44);
    if (ch === 22) return (v >= 1 && v <= 14) || (v >= 18 && v <= 21) || (v >= 29 && v <= 32) || (v >= 37 && v <= 40) || v === 42 || (v >= 43 && v <= 45);
    if (ch === 23) return (v >= 2 && v <= 39); // Seven Woes
    if (ch === 24) return v === 2 || (v >= 4 && v <= 51); // Olivet Discourse
    if (ch === 25) return true; // Parables of 10 Virgins, Talents, Sheep & Goats (all verses)
    if (ch === 26) return v === 2 || (v >= 10 && v <= 13) || v === 18 || v === 21 || (v >= 23 && v <= 25) || (v >= 26 && v <= 29) || (v >= 31 && v <= 32) || v === 34 || v === 36 || v === 38 || v === 39 || (v >= 40 && v <= 41) || v === 42 || (v >= 45 && v <= 46) || v === 50 || (v >= 52 && v <= 54) || (v >= 55 && v <= 56) || v === 64;
    if (ch === 27) return v === 11 || v === 46;
    if (ch === 28) return (v >= 9 && v <= 10) || (v >= 18 && v <= 20); // Great Commission
  }

  // 3. Gospel of Luke
  if (bookCat === 'luke') {
    if (ch === 2) return v === 49;
    if (ch === 4) return v === 4 || v === 8 || v === 12 || (v >= 18 && v <= 21) || (v >= 23 && v <= 27) || v === 43;
    if (ch === 5) return v === 4 || v === 10 || v === 13 || v === 20 || (v >= 22 && v <= 24) || (v >= 31 && v <= 39);
    if (ch === 6) return (v >= 3 && v <= 5) || v === 8 || v === 9 || v === 10 || (v >= 20 && v <= 49); // Sermon on the Plain
    if (ch === 7) return v === 9 || v === 13 || v === 14 || (v >= 22 && v <= 35) || (v >= 40 && v <= 48) || v === 50;
    if (ch === 8) return (v >= 10 && v <= 18) || v === 21 || v === 22 || v === 25 || v === 28 || v === 30 || v === 39 || v === 45 || v === 46 || v === 48 || v === 50 || v === 52 || v === 54;
    if (ch === 9) return (v >= 3 && v <= 5) || v === 13 || v === 14 || v === 18 || v === 20 || (v >= 22 && v <= 27) || v === 41 || v === 44 || (v >= 48 && v <= 50) || (v >= 55 && v <= 56) || v === 58 || v === 60 || v === 62;
    if (ch === 10) return (v >= 2 && v <= 16) || (v >= 18 && v <= 24) || v === 26 || v === 28 || (v >= 30 && v <= 37) || (v >= 41 && v <= 42);
    if (ch === 11) return (v >= 2 && v <= 13) || (v >= 17 && v <= 36) || (v >= 39 && v <= 52);
    if (ch === 12) return (v >= 1 && v <= 59); // Warnings and Kingdom teachings (all verses)
    if (ch === 13) return (v >= 2 && v <= 9) || v === 12 || (v >= 15 && v <= 16) || (v >= 18 && v <= 21) || (v >= 24 && v <= 30) || (v >= 32 && v <= 35);
    if (ch === 14) return v === 3 || v === 5 || (v >= 8 && v <= 24) || (v >= 26 && v <= 35);
    if (ch === 15) return (v >= 3 && v <= 32); // Parables of Lost Sheep, Coin, Prodigal Son
    if (ch === 16) return (v >= 1 && v <= 31); // Shrewd Manager & Rich Man and Lazarus
    if (ch === 17) return (v >= 1 && v <= 6) || (v >= 7 && v <= 10) || v === 14 || v === 17 || v === 19 || (v >= 20 && v <= 37);
    if (ch === 18) return (v >= 1 && v <= 8) || (v >= 9 && v <= 14) || (v >= 16 && v <= 17) || v === 19 || v === 22 || (v >= 24 && v <= 30) || (v >= 31 && v <= 33) || v === 41 || v === 42;
    if (ch === 19) return v === 5 || (v >= 9 && v <= 10) || (v >= 11 && v <= 27) || (v >= 30 && v <= 31) || v === 40 || (v >= 42 && v <= 44) || v === 46;
    if (ch === 20) return (v >= 3 && v <= 4) || v === 8 || (v >= 9 && v <= 18) || (v >= 23 && v <= 25) || (v >= 34 && v <= 38) || (v >= 41 && v <= 44) || (v >= 46 && v <= 47);
    if (ch === 21) return (v >= 3 && v <= 4) || (v >= 8 && v <= 36); // Olivet Prophecy
    if (ch === 22) return v === 8 || (v >= 10 && v <= 12) || (v >= 15 && v <= 22) || (v >= 25 && v <= 38) || v === 40 || v === 42 || v === 46 || v === 48 || v === 51 || (v >= 52 && v <= 53) || (v >= 67 && v <= 70);
    if (ch === 23) return v === 3 || (v >= 28 && v <= 31) || v === 34 || v === 43 || v === 46;
    if (ch === 24) return v === 17 || v === 19 || (v >= 25 && v <= 27) || v === 36 || (v >= 38 && v <= 49);
  }

  // 4. Gospel of Mark
  if (bookCat === 'mark') {
    if (ch === 1) return v === 15 || v === 17 || v === 25 || v === 38 || v === 41 || v === 44;
    if (ch === 2) return v === 5 || (v >= 8 && v <= 11) || v === 14 || v === 17 || (v >= 19 && v <= 22) || (v >= 25 && v <= 28);
    if (ch === 3) return v === 3 || v === 4 || (v >= 23 && v <= 29) || v === 33 || (v >= 34 && v <= 35);
    if (ch === 4) return (v >= 2 && v <= 32) || v === 35 || v === 39 || v === 40;
    if (ch === 5) return v === 8 || v === 9 || v === 19 || v === 30 || v === 34 || v === 36 || v === 39 || v === 41;
    if (ch === 6) return v === 4 || (v >= 8 && v <= 11) || v === 31 || v === 37 || v === 38 || v === 50;
    if (ch === 7) return (v >= 6 && v <= 13) || (v >= 14 && v <= 23) || v === 27 || v === 29 || v === 34;
    if (ch === 8) return (v >= 2 && v <= 3) || v === 5 || (v >= 12 && v <= 13) || v === 15 || (v >= 17 && v <= 21) || v === 23 || v === 26 || v === 27 || v === 29 || v === 33 || (v >= 34 && v <= 38);
    if (ch === 9) return v === 1 || (v >= 9 && v <= 13) || v === 16 || v === 19 || v === 21 || v === 23 || v === 25 || v === 29 || (v >= 31 && v <= 32) || v === 33 || (v >= 35 && v <= 50);
    if (ch === 10) return (v >= 3 && v <= 9) || (v >= 11 && v <= 12) || (v >= 14 && v <= 15) || v === 18 || v === 19 || v === 21 || (v >= 23 && v <= 25) || v === 27 || (v >= 29 && v <= 31) || (v >= 33 && v <= 34) || v === 36 || v === 38 || (v >= 39 && v <= 40) || (v >= 42 && v <= 45) || v === 51 || v === 52;
    if (ch === 11) return (v >= 2 && v <= 3) || v === 14 || v === 17 || (v >= 22 && v <= 26) || (v >= 29 && v <= 30) || v === 33;
    if (ch === 12) return (v >= 1 && v <= 11) || v === 15 || v === 16 || v === 17 || (v >= 24 && v <= 27) || (v >= 29 && v <= 31) || v === 34 || (v >= 35 && v <= 37) || (v >= 38 && v <= 40) || (v >= 43 && v <= 44);
    if (ch === 13) return v === 2 || (v >= 5 && v <= 37); // Olivet Discourse
    if (ch === 14) return (v >= 6 && v <= 9) || (v >= 13 && v <= 15) || v === 18 || v === 20 || v === 21 || (v >= 22 && v <= 25) || (v >= 27 && v <= 28) || v === 30 || v === 32 || v === 34 || v === 36 || v === 37 || v === 38 || (v >= 41 && v <= 42) || (v >= 48 && v <= 49) || v === 62;
    if (ch === 15) return v === 2 || v === 34;
    if (ch === 16) return (v >= 15 && v <= 18);
  }

  // 5. Acts of the Apostles
  if (bookCat === 'acts') {
    if (ch === 1) return (v >= 4 && v <= 5) || (v >= 7 && v <= 8);
    if (ch === 9) return v === 4 || v === 5 || v === 6 || v === 10 || (v >= 11 && v <= 12) || (v >= 15 && v <= 16);
    if (ch === 18) return (v >= 9 && v <= 10);
    if (ch === 20) return v === 35;
    if (ch === 22) return v === 7 || v === 8 || v === 10 || v === 18 || v === 21;
    if (ch === 23) return v === 11;
    if (ch === 26) return (v >= 14 && v <= 18);
  }

  // 6. Revelation
  if (bookCat === 'revelation') {
    if (ch === 1) return v === 8 || v === 11 || (v >= 17 && v <= 20);
    if (ch === 2 || ch === 3) return true; // Letters to the Seven Churches (all verses)
    if (ch === 16) return v === 15;
    if (ch === 22) return v === 7 || (v >= 12 && v <= 16) || v === 20;
  }

  // 7. Epistles with Direct Words of Christ
  const rawClean = bookName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (rawClean.includes('1cor') || rawClean.includes('firstcor')) {
    if (ch === 11 && (v === 24 || v === 25)) return true;
  }
  if (rawClean.includes('2cor') || rawClean.includes('secondcor')) {
    if (ch === 12 && v === 9) return true;
  }

  return false;
}

export interface VerseSegment {
  text: string;
  isSpeech: boolean;
}

/**
 * Intelligent dialogue parser that segments a verse into narrative and Christ's direct speech
 * Works seamlessly across modern and classical translations (ESV, KJV, NIV, CSB, NASB, NABRE, DRB, NLT)
 */
export function parseVerseSegments(text: string, isWordsOfJesus: boolean): VerseSegment[] {
  if (!text || !isWordsOfJesus) {
    return [{ text: text || '', isSpeech: false }];
  }

  // Regex matching dialogue narrative attribution for Christ across all English translations
  const jesusIntroRegex = /(?:(?:^|[.?!;]|\b(?:and|then|but|so|when|while|as|now|after))\s+)?(?:\b(?:when|as)?\s*jesus\b[^\n“\"']{0,60}?\b(?:said|saith|answered|spoke|spake|replied|declared|commanded|asked|cried|called|taught)|(?:^|[.?!;]|\b(?:and|then|but|so|now))\s*(?:\bthe lord\b|\bour lord\b|\bchrist\b|\bhe\b)[^\n“\"']{0,40}?\b(?:said|saith|answered|spoke|spake|replied|declared|commanded|asked|cried|called|taught))(?:\s+(?:unto|to)\s+[^,:“\"'\n]+|\s+them|\s+him|\s+her)?\s*[,:]\s*(?:saying[,:]\s*)?/i;

  const match = jesusIntroRegex.exec(text);
  if (!match) {
    // Entire verse is spoken discourse (e.g. Beatitudes, Parables, High Priestly Prayer)
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

  // Check if speech starts with quotation marks (modern translations)
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

  // Classical translations (KJV, DRB) without quotes: discourse runs through the clause/verse
  segments.push({ text: afterAttr, isSpeech: true });
  return segments;
}

/**
 * Splits dialogue introductory narrative from direct speech of Jesus (backward compatible utility)
 */
export function splitWordsOfJesus(text: string): { intro: string; speech: string } {
  if (!text) return { intro: '', speech: '' };
  const segs = parseVerseSegments(text, true);
  if (segs.length >= 2 && !segs[0].isSpeech && segs[1].isSpeech) {
    return {
      intro: segs[0].text,
      speech: segs.slice(1).map(s => s.text).join('')
    };
  }
  return { intro: '', speech: text };
}

/**
 * Parses and formats verse text with Words of Christ in vibrant biblical crimson (#B91C1C)
 * Separates narrative dialogue intro from Christ's direct speech with precise formatting
 */
export function renderRedLetterContent(
  text: string,
  isWordsOfJesus: boolean,
  showRedLetter: boolean,
  isSelected: boolean = false,
  onCharClick?: (charId: string) => void
): React.ReactNode {
  if (!text) return null;

  if (!showRedLetter || !isWordsOfJesus) {
    const colorStyle = { color: isSelected ? '#26221F' : '#38332E' };
    const className = isSelected ? 'text-[#26221F]' : 'text-[#38332E]';
    return renderWithCharacters(text, colorStyle, className, onCharClick);
  }

  const segments = parseVerseSegments(text, isWordsOfJesus);

  return (
    <>
      {segments.map((seg, idx) => {
        if (!seg.isSpeech) {
          const colorStyle = { color: isSelected ? '#26221F' : '#78716C' };
          return (
            <React.Fragment key={idx}>
              {renderWithCharacters(seg.text, colorStyle, 'dialogue-intro-text', onCharClick)}
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
            {renderWithCharacters(seg.text, speechStyle, speechClass, onCharClick)}
          </React.Fragment>
        );
      })}
    </>
  );
}

