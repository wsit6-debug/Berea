import { useState, useEffect } from 'react';
import { BIBLE_BOOKS } from '../data/bibleData';

export interface BookmarkedVerse {
  id: string; // `${bookId}_${chapter}_${verseNumber}`
  bookId: string;
  bookName: string;
  chapter: number;
  verseNumber: number;
  text: string;
  translation: string;
  timestamp: number;
}

const STORAGE_KEY = 'berea_bookmarked_verses_v2';
const LEGACY_KEY = 'berea_bookmarked_verses';

export function getBookmarkedVerses(): BookmarkedVerse[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse bookmarks from storage:', e);
  }
  return [];
}

function saveBookmarks(items: BookmarkedVerse[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    // Keep legacy key in sync with verse numbers for backwards compatibility
    const legacyNumbers = items.map(b => b.verseNumber);
    localStorage.setItem(LEGACY_KEY, JSON.stringify(legacyNumbers));
  } catch (e) {
    console.warn('Failed to save bookmarks to storage:', e);
  }
  window.dispatchEvent(new CustomEvent('berea_bookmarks_changed'));
}

export function isVerseBookmarked(bookId: string, chapter: number, verseNumber: number): boolean {
  const id = `${bookId.toLowerCase()}_${chapter}_${verseNumber}`;
  const list = getBookmarkedVerses();
  return list.some(b => b.id === id);
}

export function toggleBookmark(item: {
  bookId: string;
  bookName: string;
  chapter: number;
  verseNumber: number;
  text: string;
  translation: string;
}): boolean {
  const id = `${item.bookId.toLowerCase()}_${item.chapter}_${item.verseNumber}`;
  const list = getBookmarkedVerses();
  const exists = list.some(b => b.id === id);

  if (exists) {
    saveBookmarks(list.filter(b => b.id !== id));
    return false;
  } else {
    const newBookmark: BookmarkedVerse = {
      id,
      bookId: item.bookId.toLowerCase(),
      bookName: item.bookName,
      chapter: item.chapter,
      verseNumber: item.verseNumber,
      text: item.text.trim(),
      translation: item.translation,
      timestamp: Date.now()
    };
    saveBookmarks([newBookmark, ...list]);
    return true;
  }
}

export function removeBookmark(id: string): void {
  const list = getBookmarkedVerses();
  saveBookmarks(list.filter(b => b.id !== id));
}

export function clearAllBookmarks(): void {
  saveBookmarks([]);
}

export function useBookmarkedVerses(): BookmarkedVerse[] {
  const [bookmarks, setBookmarks] = useState<BookmarkedVerse[]>(() => getBookmarkedVerses());

  useEffect(() => {
    const handler = () => {
      setBookmarks(getBookmarkedVerses());
    };
    window.addEventListener('berea_bookmarks_changed', handler);
    return () => window.removeEventListener('berea_bookmarks_changed', handler);
  }, []);

  return bookmarks;
}

export function getCanonicalBookIndex(bookId: string): number {
  const idx = BIBLE_BOOKS.findIndex(b => b.id.toLowerCase() === bookId.toLowerCase());
  return idx !== -1 ? idx : 999;
}
