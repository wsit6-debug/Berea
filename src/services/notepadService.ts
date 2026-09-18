import { NoteTab, NotepadState, NoteFontFamily, NoteFontSize } from '../types';

const STORAGE_KEY = 'berea_user_notes';

export const FONT_FAMILY_OPTIONS: { id: NoteFontFamily; label: string; cssFamily: string; sample: string }[] = [
  {
    id: 'serif',
    label: 'Classic Serif',
    cssFamily: "'Newsreader', Charter, Georgia, serif",
    sample: 'Serif'
  },
  {
    id: 'sans',
    label: 'Modern Sans',
    cssFamily: "'Plus Jakarta Sans', Inter, -apple-system, sans-serif",
    sample: 'Sans'
  },
  {
    id: 'mono',
    label: 'Monospace',
    cssFamily: "'JetBrains Mono', monospace",
    sample: 'Mono'
  },
  {
    id: 'script',
    label: 'Handwriting',
    cssFamily: "'Caveat', cursive, sans-serif",
    sample: 'Script'
  }
];

export const FONT_SIZE_OPTIONS: { id: NoteFontSize; label: string; cssSize: string; pxLabel: string }[] = [
  { id: 'xs', label: 'Compact', cssSize: '13px', pxLabel: '13px' },
  { id: 'sm', label: 'Default', cssSize: '15px', pxLabel: '15px' },
  { id: 'base', label: 'Medium', cssSize: '17px', pxLabel: '17px' },
  { id: 'lg', label: 'Large', cssSize: '20px', pxLabel: '20px' },
  { id: 'xl', label: 'Extra Large', cssSize: '24px', pxLabel: '24px' }
];

export function createNewNoteTab(title?: string, book?: string, chapter?: number): NoteTab {
  const now = Date.now();
  const id = 'note_' + Math.random().toString(36).substring(2, 9) + '_' + now;
  const noteTitle = title || (book && chapter ? `${book} ${chapter} Notes` : 'New Note');

  return {
    id,
    title: noteTitle,
    content: '',
    book,
    chapter,
    verseHighlights: {},
    createdAt: now,
    updatedAt: now
  };
}

export function getDefaultNotepadState(initialBook?: string, initialChapter?: number): NotepadState {
  const generalTab = createNewNoteTab('General Journal');
  generalTab.content = '';

  const pageJournalTitle = initialBook && initialChapter ? `${initialBook} ${initialChapter} Journal` : 'Page Journal';
  const pageTab = createNewNoteTab(pageJournalTitle, initialBook, initialChapter);
  pageTab.content = '';

  return {
    tabs: [generalTab, pageTab],
    activeTabId: pageTab.id,
    globalFontFamily: 'sans',
    globalFontSize: 'sm'
  };
}

export function loadNotepadState(fallbackBook?: string, fallbackChapter?: number): NotepadState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return getDefaultNotepadState(fallbackBook, fallbackChapter);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultNotepadState(fallbackBook, fallbackChapter);
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.tabs) || parsed.tabs.length === 0) {
      return getDefaultNotepadState(fallbackBook, fallbackChapter);
    }

    // Clean any old template text that might have been saved in localStorage
    const cleanedTabs: NoteTab[] = parsed.tabs.map((t: NoteTab) => {
      let content = t.content || '';
      if (
        content.includes('Observations') ||
        content.includes('Key themes:') ||
        content.includes('Personal Reflections & Prayers') ||
        content.includes('Jot down sermon notes')
      ) {
        content = '';
      }
      return {
        ...t,
        content
      };
    });

    // Ensure valid activeTabId
    const activeExists = cleanedTabs.some((t: NoteTab) => t.id === parsed.activeTabId);
    const activeTabId = activeExists ? parsed.activeTabId : cleanedTabs[0].id;

    return {
      tabs: cleanedTabs,
      activeTabId,
      globalFontFamily: parsed.globalFontFamily || 'sans',
      globalFontSize: parsed.globalFontSize || 'sm'
    };
  } catch (err) {
    console.warn('Failed to load user notes from localStorage:', err);
    return getDefaultNotepadState(fallbackBook, fallbackChapter);
  }
}

export function saveNotepadState(state: NotepadState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save user notes to localStorage:', err);
  }
}

export function formatNoteExport(note: NoteTab): string {
  const chapterRef = note.book && note.chapter ? `Passage: ${note.book} ${note.chapter}\n` : '';
  const dateStr = new Date(note.updatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return `# ${note.title}\n${chapterRef}Last Modified: ${dateStr}\n\n${note.content}`;
}

export function downloadNoteAsFile(note: NoteTab): void {
  const text = formatNoteExport(note);
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const sanitizedTitle = (note.title || 'note').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  a.download = `${sanitizedTitle}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
