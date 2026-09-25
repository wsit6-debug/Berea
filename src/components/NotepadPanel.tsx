import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, X, Edit2, Check, Copy, Download, Trash2,
  BookOpen, Sparkles, Type, Minus, AlignLeft,
  List, CheckSquare, Quote, FileText, Bookmark,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ExternalLink, RotateCcw, Layers,
  Send, ArrowDownToLine, Highlighter, Eye, LayoutTemplate, Bold, Italic, Search
} from 'lucide-react';
import { Verse, TranslationId, BIBLE_BOOKS } from '../data/bibleData';
import { DenominationalLens } from '../data/theologyData';
import { NoteTab, NotepadState, NoteFontFamily, NoteFontSize } from '../types';
import {
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  loadNotepadState,
  saveNotepadState,
  createNewNoteTab,
  downloadNoteAsFile
} from '../services/notepadService';
import { cleanApiText } from '../services/youversionService';
import { askBereaAssistant } from '../services/aiService';
import { MarkdownTheologyRenderer } from './MarkdownTheologyRenderer';

export const STUDY_OUTLINE_TEMPLATE = `
<div class="notepad-outline-box">
  <div class="notepad-outline-header">📌 Section Header & Overview</div>
  <div class="notepad-outline-content">
    <p><strong>Main Theme:</strong> Enter the overarching theme of this passage...</p>
    <p><strong>Context:</strong> Who is speaking? To whom? What circumstances are surrounding this text?</p>
  </div>
</div>

<div class="notepad-outline-box">
  <div class="notepad-outline-header">📖 Key Scripture & Cross-References</div>
  <div class="notepad-outline-content">
    <p><strong>Primary Verse(s):</strong> Quote key verses here (use "Quote v.X" button above)...</p>
    <p><strong>Cross References:</strong> Related biblical passages...</p>
  </div>
</div>

<div class="notepad-outline-box">
  <div class="notepad-outline-header">✍️ Study Notes & Observations</div>
  <div class="notepad-outline-content">
    <p>• Observation 1: Key words, Greek/Hebrew meanings, theological significance...</p>
    <p>• Observation 2: God's character and covenant promises revealed...</p>
    <p>• Observation 3: Questions or insights for deeper reflection...</p>
  </div>
</div>

<div class="notepad-outline-box">
  <div class="notepad-outline-header">💡 Practical Application & Prayer</div>
  <div class="notepad-outline-content">
    <p><strong>Application:</strong> How does this truth transform my thoughts, speech, and walk today?</p>
    <p><strong>Prayer:</strong> A personal response of praise, repentance, or petition...</p>
  </div>
</div>
<p><br></p>`;

export const HIGHLIGHT_CONFIG: Record<'yellow' | 'green' | 'red' | 'blue', { bg: string; text: string; label: string; border: string }> = {
  yellow: { bg: '#fef08a', text: '#451a03', label: 'Yellow', border: '#facc15' },
  green: { bg: '#bbf7d0', text: '#052e16', label: 'Green', border: '#4ade80' },
  red: { bg: '#fecdd3', text: '#4c0519', label: 'Red', border: '#f43f5e' },
  blue: { bg: '#bae6fd', text: '#082f49', label: 'Blue', border: '#38bdf8' }
};

export function formatContentForEditor(content: string): string {
  if (!content) return '';
  if (/<(p|mark|b|strong|div|br|span|blockquote|ul|ol|li|h[1-6])\b[^>]*>/i.test(content)) {
    return content;
  }
  let html = content
    .replace(/<mark class="hl-(yellow|green|red|blue)">(.*?)<\/mark>/gi, (_match, color, inner) => {
      const c = color.toLowerCase() as 'yellow' | 'green' | 'red' | 'blue';
      return `<mark class="hl-${c}" style="background-color: var(--hl-${c}-bg); color: var(--hl-${c}-text); border-radius: 3px; padding: 1px 3px;">${inner}</mark>`;
    })
    .replace(/==(.*?)==/g, `<mark class="hl-yellow" style="background-color: var(--hl-yellow-bg); color: var(--hl-yellow-text); border-radius: 3px; padding: 1px 3px;">$1</mark>`)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\*)([^*]+)\*/g, '$1<em>$2</em>');

  const lines = html.split('\n');
  return lines.map(line => line.trim() ? `<p>${line}</p>` : `<p><br></p>`).join('');
}

export function htmlToPlainText(html: string): string {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.innerText || temp.textContent || '';
}

export function getPassageBadge(book?: string, chapter?: number): string | null {
  if (!book || !chapter) return null;
  const match = BIBLE_BOOKS.find(
    b => b.name.toLowerCase() === book.toLowerCase() || b.id.toLowerCase() === book.toLowerCase()
  );
  if (match) {
    return `${match.abbreviation} ${chapter}`;
  }
  const words = book.trim().split(/\s+/);
  if (words.length > 1) {
    return `${words[0].charAt(0)}${words[1].substring(0, 3)} ${chapter}`;
  }
  return `${book.substring(0, 3)} ${chapter}`;
}

interface NotepadPanelProps {
  currentBook: string;
  currentChapter: number;
  selectedVerse: Verse | null;
  selectedVerseRange?: { start: number; end: number } | null;
  activeTranslation: TranslationId;
  activeLens?: DenominationalLens;
  notepadState?: NotepadState;
  setNotepadState?: React.Dispatch<React.SetStateAction<NotepadState>>;
  tabHighlights?: Record<number, 'yellow' | 'green' | 'red' | 'blue'>;
  onHighlightVerse?: (
    verseNum: number,
    color?: 'yellow' | 'green' | 'red' | 'blue',
    range?: { start: number; end: number } | null
  ) => void;
  activeTabTitle?: string;
  isHighlighterMode?: boolean;
  onToggleHighlighterMode?: () => void;
  activeHighlightColor?: 'yellow' | 'green' | 'red' | 'blue';
  onSelectHighlightColor?: (color: 'yellow' | 'green' | 'red' | 'blue') => void;
  onSelectPassage?: (bookId: string, chapterNum: number) => void;
}

export const NotepadPanel: React.FC<NotepadPanelProps> = ({
  currentBook,
  currentChapter,
  selectedVerse,
  selectedVerseRange,
  activeTranslation,
  activeLens,
  notepadState: externalNotepadState,
  setNotepadState: externalSetNotepadState,
  tabHighlights,
  onHighlightVerse,
  activeTabTitle,
  isHighlighterMode: externalHighlighterMode,
  onToggleHighlighterMode: externalToggleHighlighterMode,
  activeHighlightColor: externalHighlightColor,
  onSelectHighlightColor: externalSetHighlightColor,
  onSelectPassage
}) => {
  const [internalNotepadState, setInternalNotepadState] = useState<NotepadState>(() =>
    loadNotepadState(currentBook, currentChapter)
  );
  const notepadState = externalNotepadState || internalNotepadState;
  const setNotepadState = externalSetNotepadState || setInternalNotepadState;
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabTitle, setEditingTabTitle] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showJournalMenu, setShowJournalMenu] = useState(false);

  // AI Companion State (Google Docs Gemini style)
  const [aiQuery, setAiQuery] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState<{ prompt: string; text: string; citation?: string } | null>(null);
  const [isAiBoxExpanded, setIsAiBoxExpanded] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);
  const [aiInserted, setAiInserted] = useState(false);
  const [tabSearchQuery, setTabSearchQuery] = useState('');
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  const [internalHighlightColor, setInternalHighlightColor] = useState<'yellow' | 'green' | 'red' | 'blue'>('yellow');
  const activeHighlightColor = externalHighlightColor || internalHighlightColor;
  const setActiveHighlightColor = (color: 'yellow' | 'green' | 'red' | 'blue') => {
    if (externalSetHighlightColor) {
      externalSetHighlightColor(color);
    } else {
      setInternalHighlightColor(color);
    }
  };

  const [internalHighlighterMode, setInternalHighlighterMode] = useState<boolean>(false);
  const isHighlighterMode = externalHighlighterMode !== undefined ? externalHighlighterMode : internalHighlighterMode;
  const toggleHighlighterMode = () => {
    if (externalToggleHighlighterMode) {
      externalToggleHighlighterMode();
    } else {
      setInternalHighlighterMode(p => !p);
    }
  };

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const activeTabIdRef = useRef<string | null>(null);
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const journalMenuRef = useRef<HTMLDivElement>(null);
  const styleMenuRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-save whenever notepadState changes
  useEffect(() => {
    saveNotepadState(notepadState);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastSavedTime(timeStr);
  }, [notepadState]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) {
        setShowFontMenu(false);
      }
      if (journalMenuRef.current && !journalMenuRef.current.contains(e.target as Node)) {
        setShowJournalMenu(false);
      }
      if (styleMenuRef.current && !styleMenuRef.current.contains(e.target as Node)) {
        setShowStyleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ensure "General Journal" exists in tabs and is always the first tab
  useEffect(() => {
    setNotepadState(prev => {
      let generalTab = prev.tabs.find(t => !t.book && !t.chapter);
      if (!generalTab) {
        generalTab = createNewNoteTab('General Journal');
        generalTab.content = '';
      }
      // Re-order so General Journal is strictly at index 0
      const otherTabs = prev.tabs.filter(t => t.id !== generalTab!.id);
      return {
        ...prev,
        tabs: [generalTab, ...otherTabs]
      };
    });
  }, []);

  // All note tabs are visible in the tabs bar at the top so notes are never hidden or lost across chapters!
  const visibleTabs = notepadState.tabs;

  // Active Tab from all available tabs
  const activeTab = notepadState.tabs.find(t => t.id === notepadState.activeTabId) || notepadState.tabs[0];

  // Active typography options
  const activeFontFamilyId = activeTab?.fontFamily || notepadState.globalFontFamily || 'sans';
  const activeFontSizeId = activeTab?.fontSize || notepadState.globalFontSize || 'sm';

  const currentFontConfig = FONT_FAMILY_OPTIONS.find(f => f.id === activeFontFamilyId) || FONT_FAMILY_OPTIONS[1];
  const currentSizeConfig = FONT_SIZE_OPTIONS.find(s => s.id === activeFontSizeId) || FONT_SIZE_OPTIONS[1];

  // Track previous book/chapter to detect navigation (only used if NotepadPanel is standalone)
  const prevChapterRef = useRef<{ book: string; chapter: number }>({
    book: currentBook,
    chapter: currentChapter
  });

  // Standalone chapter sync (only active if externalSetNotepadState is not provided)
  useEffect(() => {
    if (externalSetNotepadState) return;

    const prev = prevChapterRef.current;
    if (prev.book === currentBook && prev.chapter === currentChapter) {
      return;
    }
    prevChapterRef.current = { book: currentBook, chapter: currentChapter };

    setNotepadState(current => {
      const currentActive = current.tabs.find(t => t.id === current.activeTabId);
      const isCurrentlyInGeneral = currentActive && (!currentActive.book && !currentActive.chapter);

      const general = current.tabs.find(t => !t.book && !t.chapter);
      let pageTab = current.tabs.find(t => t.book === currentBook && t.chapter === currentChapter);

      let otherTabs = current.tabs.filter(t => t.id !== general?.id);
      if (!pageTab) {
        const pageTitle = `${currentBook} ${currentChapter} Journal`;
        pageTab = createNewNoteTab(pageTitle, currentBook, currentChapter);
        pageTab.content = '';
        pageTab.fontFamily = currentActive?.fontFamily || current.globalFontFamily || 'sans';
        pageTab.fontSize = currentActive?.fontSize || current.globalFontSize || 'sm';
        otherTabs = [pageTab, ...otherTabs.filter(t => t.id !== pageTab!.id)];
      }

      return {
        ...current,
        tabs: general ? [general, ...otherTabs] : [pageTab, ...otherTabs],
        activeTabId: isCurrentlyInGeneral ? current.activeTabId : pageTab.id
      };
    });
  }, [currentBook, currentChapter, externalSetNotepadState]);

  // Scroll tabs container smoothly left or right
  const handleScrollTabs = (direction: 'left' | 'right') => {
    if (!tabsContainerRef.current) return;
    const scrollAmount = 200;
    tabsContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Auto-scroll active tab into view in the slider
  useEffect(() => {
    if (!tabsContainerRef.current) return;
    const activeEl = tabsContainerRef.current.querySelector<HTMLElement>(`[data-tab-id="${notepadState.activeTabId}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
  }, [notepadState.activeTabId]);

  // Handle active tab selection
  const handleSelectTab = (id: string) => {
    setNotepadState(prev => ({
      ...prev,
      activeTabId: id
    }));
  };

  // Create new tab dedicated to this section - guaranteed blank
  const handleAddTab = () => {
    const sectionTabsCount = notepadState.tabs.filter(t => t.book === currentBook && t.chapter === currentChapter).length;
    const defaultTitle = `${currentBook} ${currentChapter} Tab ${sectionTabsCount + 1}`;
    const newTab = createNewNoteTab(defaultTitle, currentBook, currentChapter);
    newTab.content = '';
    newTab.fontFamily = activeFontFamilyId;
    newTab.fontSize = activeFontSizeId;

    setNotepadState(prev => {
      const general = prev.tabs.find(t => !t.book && !t.chapter);
      const others = prev.tabs.filter(t => t.id !== general?.id);
      return {
        ...prev,
        // General Journal always remains the first referenced tab, everything else follows
        tabs: general ? [general, ...others, newTab] : [...others, newTab],
        activeTabId: newTab.id
      };
    });
  };

  // Close/Delete tab
  const handleDeleteTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notepadState.tabs.length <= 1) {
      // Clear tab content instead of deleting last tab
      setNotepadState(prev => ({
        ...prev,
        tabs: prev.tabs.map(t => t.id === tabId ? { ...t, content: '', title: 'Untitled Note', updatedAt: Date.now() } : t)
      }));
      return;
    }

    const remainingTabs = notepadState.tabs.filter(t => t.id !== tabId);
    const nextActiveId = notepadState.activeTabId === tabId ? remainingTabs[0].id : notepadState.activeTabId;

    setNotepadState(prev => ({
      ...prev,
      tabs: remainingTabs,
      activeTabId: nextActiveId
    }));
  };

  // Rename tab
  const handleStartRenameTab = (tab: NoteTab, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTabId(tab.id);
    setEditingTabTitle(tab.title);
  };

  const handleSaveRenameTab = () => {
    if (!editingTabId) return;
    const trimmed = editingTabTitle.trim() || 'Untitled Note';
    setNotepadState(prev => ({
      ...prev,
      tabs: prev.tabs.map(t => t.id === editingTabId ? { ...t, title: trimmed, updatedAt: Date.now() } : t)
    }));
    setEditingTabId(null);
  };

  // Update note content
  const handleContentChange = (content: string) => {
    if (!activeTab) return;
    setNotepadState(prev => ({
      ...prev,
      tabs: prev.tabs.map(t => t.id === activeTab.id ? { ...t, content, updatedAt: Date.now() } : t)
    }));
  };

  // Update note title
  const handleTitleChange = (title: string) => {
    if (!activeTab) return;
    setNotepadState(prev => ({
      ...prev,
      tabs: prev.tabs.map(t => t.id === activeTab.id ? { ...t, title, updatedAt: Date.now() } : t)
    }));
  };

  // Link / Unlink chapter
  const handleToggleCurrentChapterLink = () => {
    if (!activeTab) return;
    const isCurrentlyLinked = activeTab.book === currentBook && activeTab.chapter === currentChapter;
    setNotepadState(prev => ({
      ...prev,
      tabs: prev.tabs.map(t => {
        if (t.id !== activeTab.id) return t;
        if (isCurrentlyLinked) {
          return { ...t, book: undefined, chapter: undefined, updatedAt: Date.now() };
        } else {
          return { ...t, book: currentBook, chapter: currentChapter, updatedAt: Date.now() };
        }
      })
    }));
  };

  // Change font family
  const handleSetFontFamily = (family: NoteFontFamily) => {
    if (!activeTab) return;
    setNotepadState(prev => ({
      ...prev,
      globalFontFamily: family,
      tabs: prev.tabs.map(t => t.id === activeTab.id ? { ...t, fontFamily: family } : t)
    }));
    setShowFontMenu(false);
  };

  // Step font size up / down
  const handleStepFontSize = (direction: 'up' | 'down') => {
    const currentIndex = FONT_SIZE_OPTIONS.findIndex(s => s.id === activeFontSizeId);
    let newIndex = currentIndex;
    if (direction === 'up' && currentIndex < FONT_SIZE_OPTIONS.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'down' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }
    const newSize = FONT_SIZE_OPTIONS[newIndex].id;

    setNotepadState(prev => ({
      ...prev,
      globalFontSize: newSize,
      tabs: prev.tabs.map(t => t.id === activeTab.id ? { ...t, fontSize: newSize } : t)
    }));
  };

  // Synchronize editor innerHTML when active tab changes or is cleared
  useEffect(() => {
    if (!editorRef.current || !activeTab) return;
    if (activeTabIdRef.current !== activeTab.id) {
      activeTabIdRef.current = activeTab.id;
      editorRef.current.innerHTML = formatContentForEditor(activeTab.content || '');
    } else if (!activeTab.content && editorRef.current.innerHTML !== '' && editorRef.current.innerHTML !== '<br>') {
      editorRef.current.innerHTML = '';
    }
  }, [activeTab?.id, activeTab?.content]);

  // Selection helpers to preserve range across toolbar clicks
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  const handleEditorInput = () => {
    if (!editorRef.current || !activeTab) return;
    const newHtml = editorRef.current.innerHTML;
    handleContentChange(newHtml);
    saveSelection();
  };

  const insertHtmlAtSelection = (html: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      editorRef.current.innerHTML += html;
      handleContentChange(editorRef.current.innerHTML);
      return;
    }
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const el = document.createElement('div');
    el.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node: ChildNode | null;
    let lastNode: ChildNode | null = null;
    while ((node = el.firstChild)) {
      lastNode = frag.appendChild(node);
    }
    range.insertNode(frag);
    if (lastNode) {
      const newRange = document.createRange();
      newRange.setStartAfter(lastNode);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      savedSelectionRef.current = newRange.cloneRange();
    }
    handleContentChange(editorRef.current.innerHTML);
  };

  const insertAtCursor = (prefix: string, suffix: string = '') => {
    if (!editorRef.current || !activeTab) return;
    editorRef.current.focus();
    restoreSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString() : '';
    const replacement = `${prefix}${selectedText}${suffix}`;
    insertHtmlAtSelection(replacement.replace(/\n/g, '<br>'));
  };

  // Toggle Bold formatting directly in the rich editor
  const handleToggleBold = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    document.execCommand('bold', false);
    saveSelection();
    handleContentChange(editorRef.current.innerHTML);
  };

  // Apply Highlight with specific color (yellow, green, red, blue)
  // Works on:
  // 1. Text selected inside the note editor
  // 2. Selected verse or verse range on book side (left), strictly saved to active section tab
  // 3. Or activates Highlighter mode so clicking verses on the left side highlights them
  const handleApplyHighlight = (color: 'yellow' | 'green' | 'red' | 'blue' = activeHighlightColor) => {
    setActiveHighlightColor(color);

    // 1. Check if user currently has text selected inside the Notepad editor
    const sel = window.getSelection();
    let hasEditorSelection = false;
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (!range.collapsed && editorRef.current.contains(range.commonAncestorContainer)) {
        hasEditorSelection = true;
      }
    }

    if (hasEditorSelection && editorRef.current) {
      editorRef.current.focus();
      restoreSelection();

      const activeSel = window.getSelection();
      if (!activeSel || activeSel.rangeCount === 0) return;
      const range = activeSel.getRangeAt(0);
      if (range.collapsed) return;

      const colorConfig = HIGHLIGHT_CONFIG[color];

      // Check if selection is already inside an existing <mark>
      let node: Node | null = range.commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
      }
      const existingMark = (node as HTMLElement)?.closest('mark') as HTMLElement | null;

      if (existingMark && editorRef.current.contains(existingMark)) {
        if (existingMark.classList.contains(`hl-${color}`)) {
          // Toggle off: unwrap mark contents
          const parent = existingMark.parentNode;
          while (existingMark.firstChild) {
            parent?.insertBefore(existingMark.firstChild, existingMark);
          }
          parent?.removeChild(existingMark);
        } else {
          // Switch to new color
          existingMark.className = `hl-${color}`;
          existingMark.style.backgroundColor = `var(--hl-${color}-bg)`;
          existingMark.style.color = `var(--hl-${color}-text)`;
          existingMark.style.borderRadius = '3px';
          existingMark.style.padding = '1px 3px';
        }
      } else {
        const mark = document.createElement('mark');
        mark.className = `hl-${color}`;
        mark.style.backgroundColor = `var(--hl-${color}-bg)`;
        mark.style.color = `var(--hl-${color}-text)`;
        mark.style.borderRadius = '3px';
        mark.style.padding = '1px 3px';

        try {
          const extracted = range.extractContents();
          mark.appendChild(extracted);
          range.insertNode(mark);

          const newRange = document.createRange();
          newRange.selectNodeContents(mark);
          activeSel.removeAllRanges();
          activeSel.addRange(newRange);
          savedSelectionRef.current = newRange.cloneRange();
        } catch (err) {
          console.warn('Failed to wrap selection in mark:', err);
        }
      }

      saveSelection();
      handleContentChange(editorRef.current.innerHTML);
      return;
    }

    // 2. If NO text selected in notepad editor, use highlight on the selected passage on the left side
    if (onHighlightVerse && (selectedVerse || selectedVerseRange)) {
      if (selectedVerseRange && selectedVerseRange.start !== selectedVerseRange.end) {
        onHighlightVerse(selectedVerseRange.start, color, selectedVerseRange);
      } else if (selectedVerse) {
        onHighlightVerse(selectedVerse.verseNumber, color);
      }
      // Ensure highlighter tool is active so subsequent verses can be clicked to highlight
      if (!isHighlighterMode) {
        toggleHighlighterMode();
      }
      return;
    }

    // 3. Otherwise toggle/enable highlighter mode for clicking verses directly
    if (!isHighlighterMode) {
      toggleHighlighterMode();
    }
  };

  const handleToggleHighlighterButton = () => {
    const sel = window.getSelection();
    let hasEditorSelection = false;
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (!range.collapsed && editorRef.current.contains(range.commonAncestorContainer)) {
        hasEditorSelection = true;
      }
    }

    if (hasEditorSelection) {
      handleApplyHighlight(activeHighlightColor);
      return;
    }

    if (onHighlightVerse && (selectedVerse || selectedVerseRange)) {
      if (selectedVerseRange && selectedVerseRange.start !== selectedVerseRange.end) {
        onHighlightVerse(selectedVerseRange.start, activeHighlightColor, selectedVerseRange);
      } else if (selectedVerse) {
        onHighlightVerse(selectedVerse.verseNumber, activeHighlightColor);
      }
      return;
    }

    toggleHighlighterMode();
  };

  const handleToggleItalic = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    document.execCommand('italic', false);
    saveSelection();
    handleContentChange(editorRef.current.innerHTML);
  };

  const handleFormatBlock = (tag: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    document.execCommand('formatBlock', false, tag);
    saveSelection();
    handleContentChange(editorRef.current.innerHTML);
    setShowStyleMenu(false);
  };

  const handleHeading = (level: 'h1' | 'h2' | 'h3' = 'h3') => {
    handleFormatBlock(`<${level}>`);
  };

  const handleBulletList = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    document.execCommand('insertUnorderedList', false);
    saveSelection();
    handleContentChange(editorRef.current.innerHTML);
  };

  const handleOrderedList = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    document.execCommand('insertOrderedList', false);
    saveSelection();
    handleContentChange(editorRef.current.innerHTML);
  };

  const handleTaskItem = () => {
    insertHtmlAtSelection('<p>☑️ </p>');
  };

  const handleQuoteBlock = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    document.execCommand('formatBlock', false, '<blockquote>');
    saveSelection();
    handleContentChange(editorRef.current.innerHTML);
  };

  const handleHorizontalRule = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    document.execCommand('insertHorizontalRule', false);
    saveSelection();
    handleContentChange(editorRef.current.innerHTML);
  };

  // Insert structured study outline template into note
  const handleInsertOutline = () => {
    insertHtmlAtSelection(STUDY_OUTLINE_TEMPLATE);
  };

  // Insert single outline section block (Header + notes area)
  const handleInsertHeaderBox = () => {
    const headerBoxHtml = `
<div class="notepad-outline-box">
  <div class="notepad-outline-header">📌 Section Header</div>
  <div class="notepad-outline-content">
    <p>Write your detailed observations and notes for this section here...</p>
  </div>
</div><p><br></p>`;
    insertHtmlAtSelection(headerBoxHtml);
  };

  // Insert active Scripture verse or range directly into note
  const handleInsertScripture = () => {
    if (!selectedVerse || !activeTab) return;

    let passageRef = `${currentBook} ${currentChapter}:${selectedVerse.verseNumber}`;
    if (selectedVerseRange && selectedVerseRange.start !== selectedVerseRange.end) {
      passageRef = `${currentBook} ${currentChapter}:${selectedVerseRange.start}-${selectedVerseRange.end}`;
    }

    const rawText = selectedVerse.text[activeTranslation] || selectedVerse.text['KJV'] || Object.values(selectedVerse.text)[0] || '';
    const cleanText = cleanApiText(rawText);

    const quoteHtml = `<blockquote style="border-left: 3px solid #B4793D; padding: 4px 10px; margin: 8px 0; color: #57524E; font-style: italic; background: #FAF5ED; border-radius: 4px;">
      "${cleanText}"<br>
      <span style="font-weight: 600; font-style: normal; color: #26221F; font-size: 0.9em;">— ${passageRef} (${activeTranslation})</span>
    </blockquote><p><br></p>`;
    insertHtmlAtSelection(quoteHtml);
  };

  // Copy note to clipboard
  const handleCopyNote = () => {
    if (!activeTab) return;
    const plain = htmlToPlainText(activeTab.content);
    const fullText = `# ${activeTab.title}\n${activeTab.book && activeTab.chapter ? `Passage: ${activeTab.book} ${activeTab.chapter}\n` : ''}\n${plain}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    });
  };

  // Google Docs Gemini-style AI queries - Integrated directly with the active Notepad notes
  const handleAskAi = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || aiQuery).trim();
    if (!promptToSend || isAiThinking) return;

    setIsAiThinking(true);
    setAiInserted(false);

    try {
      const rawText = selectedVerse?.text[activeTranslation] || selectedVerse?.text['KJV'] || Object.values(selectedVerse?.text || {})[0] || '';
      const cleanText = cleanApiText(rawText);

      // Include the user's active written notes (stripped clean of HTML)
      const userNotesContent = htmlToPlainText(activeTab?.content || '').trim();
      let integratedPrompt = promptToSend;

      if (userNotesContent) {
        integratedPrompt = `${promptToSend}

[USER NOTEPAD CONTEXT (${activeTab.title})]:
${userNotesContent}`;
      }

      const res = await askBereaAssistant(integratedPrompt, {
        book: currentBook,
        chapter: currentChapter,
        verseNumber: selectedVerse?.verseNumber,
        endVerseNumber: selectedVerseRange?.end,
        verseText: cleanText,
        lens: activeLens,
        noteTitle: activeTab?.title,
        noteContent: userNotesContent
      });

      setAiResponse({
        prompt: promptToSend,
        text: res.text,
        citation: res.primaryCitation
      });
      setAiQuery('');
      setIsAiBoxExpanded(true);
    } catch (err) {
      console.error('Failed to query AI in notepad:', err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleInsertAiResponse = () => {
    if (!aiResponse || !activeTab) return;
    const formattedHtml = `<blockquote style="border-left: 3px solid #B4793D; padding: 6px 12px; margin: 8px 0; background: #FAF8F5; border-radius: 4px;">
      <div style="font-weight: 700; color: #B4793D; margin-bottom: 4px; font-size: 0.95em;">AI Insight: ${aiResponse.prompt}</div>
      <div style="color: #26221F; line-height: 1.6;">${aiResponse.text.replace(/\n/g, '<br>')}</div>
      ${aiResponse.citation ? `<div style="margin-top: 4px; font-size: 0.85em; color: #78716C; font-style: italic;">Source: ${aiResponse.citation}</div>` : ''}
    </blockquote><p><br></p>`;
    insertHtmlAtSelection(formattedHtml);
    setAiInserted(true);
    setTimeout(() => setAiInserted(false), 2500);
  };

  const handleCopyAiResponse = () => {
    if (!aiResponse) return;
    const fullText = `### ${aiResponse.prompt}\n\n${aiResponse.text}${aiResponse.citation ? `\n\nSource: ${aiResponse.citation}` : ''}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setAiCopied(true);
      setTimeout(() => setAiCopied(false), 2000);
    });
  };

  // Summarize User's Written Notes using Berea Assistant
  const handleSummarizeNotes = async () => {
    if (!activeTab) return;
    const noteText = htmlToPlainText(activeTab.content).trim();
    if (!noteText) {
      setAiResponse({
        prompt: `Summarize "${activeTab.title}"`,
        text: `**Your note is currently empty.**\n\nStart typing your observations, questions, or reflections in the editor above, or click **Outline** to insert a structured study template, then click **Summarize** to get an accurate summary of what you wrote.`
      });
      setIsAiBoxExpanded(true);
      return;
    }

    setIsAiThinking(true);
    setAiInserted(false);

    const promptToSend = `Summarize and synthesize the study notes written in "${activeTab.title}" (${activeTab.book && activeTab.chapter ? `${activeTab.book} ${activeTab.chapter}` : 'General Journal'}). Directly capture and organize the key observations, points, questions, and reflections written in the notes:

--- USER NOTES START ---
${noteText}
--- USER NOTES END ---`;

    try {
      const res = await askBereaAssistant(promptToSend, {
        book: activeTab.book || currentBook,
        chapter: activeTab.chapter || currentChapter,
        verseNumber: selectedVerse?.verseNumber,
        endVerseNumber: selectedVerseRange?.end,
        lens: activeLens,
        noteTitle: activeTab.title,
        noteContent: noteText
      });

      setAiResponse({
        prompt: `Executive Summary: ${activeTab.title}`,
        text: res.text,
        citation: res.primaryCitation
      });
      setIsAiBoxExpanded(true);
    } catch (err) {
      console.error('Failed to summarize notes:', err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const AI_SUGGESTIONS = [
    { label: '✨ Summarize Notes', action: 'summarize', prompt: '' },
    { label: '💡 Themes', prompt: `What are the core theological themes of ${currentBook} ${currentChapter}?` },
    { label: '🏛️ Context', prompt: `What is the historical and cultural background of ${currentBook} ${currentChapter}?` },
    { label: '🔗 Cross-Refs', prompt: `Find key Scripture cross-references related to ${currentBook} ${currentChapter}.` },
    { label: '📋 Outline', prompt: `Draft a clear study outline for ${currentBook} ${currentChapter} that I can incorporate into my notes.` },
    { label: '❓ Questions', prompt: `Provide 3 deep reflection and discussion questions for ${currentBook} ${currentChapter}.` }
  ];

  // Filter tabs for document switcher search
  const filteredTabs = visibleTabs.filter(t => {
    if (!tabSearchQuery.trim()) return true;
    const q = tabSearchQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || (t.book && t.book.toLowerCase().includes(q));
  });

  // Stats
  const wordCount = activeTab?.content?.trim() ? activeTab.content.trim().split(/\s+/).length : 0;
  const charCount = activeTab?.content?.length || 0;
  const activeBadge = getPassageBadge(activeTab?.book, activeTab?.chapter);

  return (
    <div className="flex flex-col h-full bg-[#FAF9F6] text-[#26221F] select-text relative overflow-hidden font-sans">
      {/* 1. TOP DOCUMENT NAVIGATION BAR (Single Row) */}
      <div
        className="px-3 sm:px-4 py-2 border-b flex items-center justify-between bg-white shrink-0 gap-2 select-none"
        style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
      >
        {/* Left: Document Switcher Dropdown & Add Button */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="relative" ref={journalMenuRef}>
            <button
              onClick={() => setShowJournalMenu(prev => !prev)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#FAF7F2] text-[#26221F] text-xs sm:text-sm font-semibold transition-all border border-transparent hover:border-[#E8E2D8] max-w-[240px] sm:max-w-[300px] truncate group"
              title="Switch note or view all journals"
            >
              <FileText className="w-4 h-4 text-[var(--clean-accent-caramel,#B4793D)] shrink-0" />
              <span className="truncate">{activeTab?.title || 'Untitled Note'}</span>
              {activeBadge && (
                <span
                  className="text-[9.5px] font-mono px-1.5 py-0.2 rounded shrink-0 border uppercase font-bold"
                  style={{
                    backgroundColor: 'var(--clean-highlight-cream, #FAF3E8)',
                    color: 'var(--clean-accent-dark, #B4793D)',
                    borderColor: 'var(--clean-accent-border, #E2D5C3)'
                  }}
                >
                  {activeBadge}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 shrink-0" />
            </button>

            {/* Document Switcher Dropdown Menu */}
            {showJournalMenu && (
              <div
                className="absolute left-0 mt-1 w-72 sm:w-80 bg-white border rounded-xl shadow-xl p-1.5 z-40 animate-fadeIn"
                style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
              >
                {/* Search Bar inside Switcher */}
                <div className="px-3 py-1.5 border rounded-lg flex items-center gap-2 mb-1.5 bg-[#FAF7F2] border-[#EBE5DC]">
                  <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <input
                    type="text"
                    value={tabSearchQuery}
                    onChange={e => setTabSearchQuery(e.target.value)}
                    placeholder="Search all notes & journals..."
                    className="w-full text-xs outline-none bg-transparent text-[#26221F] placeholder:text-stone-400 border-none"
                    style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                    autoFocus
                  />
                  {tabSearchQuery && (
                    <button onClick={() => setTabSearchQuery('')} className="text-stone-400 hover:text-stone-700">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Notes List */}
                <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-0.5 py-1">
                  {filteredTabs.length === 0 ? (
                    <div className="text-xs text-stone-400 text-center py-3">No matching notes found</div>
                  ) : (
                    filteredTabs.map((tab) => {
                      const isTabActive = tab.id === activeTab?.id;
                      const badge = getPassageBadge(tab.book, tab.chapter);
                      return (
                        <div
                          key={tab.id}
                          onClick={() => {
                            handleSelectTab(tab.id);
                            setShowJournalMenu(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer group"
                          style={isTabActive ? {
                            backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                            color: 'var(--clean-accent-dark, #B4793D)',
                            fontWeight: 700
                          } : {
                            color: '#26221F'
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {isTabActive ? (
                              <Check className="w-3.5 h-3.5 text-[var(--clean-accent-caramel,#B4793D)] shrink-0" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            )}
                            <span className="truncate">{tab.title}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {badge ? (
                              <span
                                className="text-[9px] px-1 py-0.5 rounded font-mono border"
                                style={{
                                  backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                                  color: '#78716C',
                                  borderColor: 'var(--clean-accent-border, #EBE5DC)'
                                }}
                              >
                                {badge}
                              </span>
                            ) : (
                              <span
                                className="text-[9px] px-1 py-0.5 rounded font-mono border"
                                style={{
                                  backgroundColor: 'var(--clean-highlight-cream, #FAF3E8)',
                                  color: 'var(--clean-accent-dark, #B4793D)',
                                  borderColor: 'var(--clean-accent-border, #EBE5DC)'
                                }}
                              >
                                General
                              </span>
                            )}

                            {/* Delete tab button */}
                            {notepadState.tabs.length > 1 && (
                              <button
                                onClick={e => handleDeleteTab(tab.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-stone-200/60 text-stone-400 hover:text-rose-600 transition-all"
                                title="Close note"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bottom Action: Create Note */}
                <button
                  onClick={() => {
                    handleAddTab();
                    setShowJournalMenu(false);
                  }}
                  className="w-full mt-1 pt-2 border-t flex items-center justify-center gap-1.5 text-xs font-semibold p-1.5 rounded-lg transition-colors hover:bg-[var(--clean-highlight-cream,#FAF5ED)]"
                  style={{
                    borderTopColor: 'var(--clean-accent-border, #EBE5DC)',
                    color: 'var(--clean-accent-dark, #B4793D)'
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Note for {currentBook} {currentChapter}</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Create Note Button */}
          <button
            onClick={handleAddTab}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-[#26221F] transition-colors shrink-0"
            title="Create new note"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Right Actions: Summarize, AI Assist Toggle, Typography, Preview & Export */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Summarize Button (Safe in Top Bar) */}
          <button
            onClick={handleSummarizeNotes}
            disabled={isAiThinking}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-stone-200 hover:border-[var(--clean-accent-caramel,#B4793D)] hover:bg-[var(--clean-highlight-cream,#FAF5ED)] text-stone-700 hover:text-[var(--clean-accent-dark,#B4793D)] shadow-2xs transition-all disabled:opacity-50"
            title="Summarize your notes with Berea AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--clean-accent-caramel,#B4793D)]" />
            <span>Summarize</span>
          </button>

          {/* AI Assist Toggle Button */}
          <button
            onClick={() => setIsAiBoxExpanded(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all border shadow-2xs ${
              isAiBoxExpanded
                ? 'bg-[var(--clean-highlight-cream,#FAF3E8)] border-[var(--clean-accent-caramel,#B4793D)] text-[var(--clean-accent-dark,#B4793D)] ring-1 ring-[var(--clean-accent-caramel,#B4793D)]'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
            title="Toggle AI Companion assistant drawer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--clean-accent-caramel,#B4793D)]" />
            <span>AI Assist</span>
          </button>

          {/* Font & Typography Menu */}
          <div className="relative" ref={fontMenuRef}>
            <button
              onClick={() => setShowFontMenu(prev => !prev)}
              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 border border-stone-200 hover:border-stone-300 transition-colors shadow-2xs"
              title="Font family & size"
            >
              <Type className="w-3.5 h-3.5" />
            </button>

            {showFontMenu && (
              <div
                className="absolute right-0 mt-1 w-48 bg-white border rounded-xl shadow-xl p-2 z-40 animate-fadeIn"
                style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
              >
                <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-stone-400">
                  Font Family
                </div>
                {FONT_FAMILY_OPTIONS.map(font => (
                  <button
                    key={font.id}
                    onClick={() => handleSetFontFamily(font.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left"
                    style={{
                      fontFamily: font.cssFamily,
                      backgroundColor: activeFontFamilyId === font.id ? 'var(--clean-highlight-cream, #FAF5ED)' : undefined,
                      color: activeFontFamilyId === font.id ? 'var(--clean-accent-dark, #B4793D)' : '#26221F',
                      fontWeight: activeFontFamilyId === font.id ? 700 : undefined
                    }}
                  >
                    <span>{font.label}</span>
                    {activeFontFamilyId === font.id && <Check className="w-3 h-3 text-[var(--clean-accent-caramel,#B4793D)]" />}
                  </button>
                ))}

                <div className="border-t my-1.5 pt-1.5 px-2">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1">
                    Font Size
                  </div>
                  <div className="flex items-center justify-between bg-stone-50 border rounded-lg px-2 py-1">
                    <button
                      onClick={() => handleStepFontSize('down')}
                      disabled={activeFontSizeId === 'xs'}
                      className="p-0.5 text-stone-600 hover:text-black disabled:opacity-30"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-mono font-medium text-stone-700">
                      {currentSizeConfig.pxLabel}
                    </span>
                    <button
                      onClick={() => handleStepFontSize('up')}
                      disabled={activeFontSizeId === 'xl'}
                      className="p-0.5 text-stone-600 hover:text-black disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview / Edit Toggle */}
          <button
            type="button"
            onClick={() => setIsPreviewMode(prev => !prev)}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 border border-stone-200 hover:border-stone-300 transition-colors shadow-2xs"
            title={isPreviewMode ? 'Switch to Edit mode' : 'Switch to Markdown Preview'}
          >
            {isPreviewMode ? <Edit2 className="w-3.5 h-3.5 text-[var(--clean-accent-caramel,#B4793D)]" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          {/* Copy Note */}
          <button
            onClick={handleCopyNote}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 border border-stone-200 hover:border-stone-300 transition-colors shadow-2xs"
            title="Copy entire note"
          >
            {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Download Note */}
          <button
            onClick={() => activeTab && downloadNoteAsFile(activeTab)}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 border border-stone-200 hover:border-stone-300 transition-colors shadow-2xs"
            title="Download note as file (.txt)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. SINGLE NOTION-STYLE FORMATTING TOOLBAR */}
      <div
        className="px-3 sm:px-4 py-1.5 border-b bg-[#FCFBF9] flex items-center justify-between text-xs text-stone-700 shrink-0 gap-1.5 overflow-x-auto no-scrollbar flex-nowrap"
        style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
      >
        <div className="flex items-center gap-1 shrink-0 flex-nowrap">
          {/* Heading Style Dropdown */}
          <div className="relative" ref={styleMenuRef}>
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => setShowStyleMenu(prev => !prev)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-200/60 font-medium text-xs text-stone-700 transition-colors"
              title="Text style"
            >
              <span>Heading</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {showStyleMenu && (
              <div className="absolute left-0 mt-1 w-32 bg-white border border-stone-200 rounded-lg shadow-lg p-1 z-30 animate-fadeIn">
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleFormatBlock('<p>')}
                  className="w-full text-left px-2 py-1 rounded text-xs hover:bg-stone-100"
                >
                  Normal text
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleHeading('h1')}
                  className="w-full text-left px-2 py-1 rounded text-base font-bold hover:bg-stone-100"
                >
                  Heading 1
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleHeading('h2')}
                  className="w-full text-left px-2 py-1 rounded text-sm font-semibold hover:bg-stone-100"
                >
                  Heading 2
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleHeading('h3')}
                  className="w-full text-left px-2 py-1 rounded text-xs font-semibold hover:bg-stone-100"
                >
                  Heading 3
                </button>
              </div>
            )}
          </div>

          <div className="w-[1px] h-3.5 bg-stone-300 mx-0.5 shrink-0" />

          {/* Bold & Italic */}
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleToggleBold}
            className="p-1 hover:bg-stone-200/60 rounded text-stone-700 hover:text-black transition-colors"
            title="Bold (Cmd+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleToggleItalic}
            className="p-1 hover:bg-stone-200/60 rounded text-stone-700 hover:text-black transition-colors"
            title="Italic (Cmd+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-stone-300 mx-0.5 shrink-0" />

          {/* Lists, Quote, Divider */}
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleBulletList}
            className="p-1 hover:bg-stone-200/60 rounded text-stone-700 hover:text-black transition-colors"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleOrderedList}
            className="px-1.5 py-0.5 hover:bg-stone-200/60 rounded text-[11px] font-mono font-bold text-stone-700 hover:text-black transition-colors"
            title="Numbered List"
          >
            1.
          </button>

          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleTaskItem}
            className="p-1 hover:bg-stone-200/60 rounded text-stone-700 hover:text-black transition-colors"
            title="Checklist"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleQuoteBlock}
            className="p-1 hover:bg-stone-200/60 rounded text-stone-700 hover:text-black transition-colors"
            title="Quote Block"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleHorizontalRule}
            className="p-1 hover:bg-stone-200/60 rounded text-stone-700 hover:text-black transition-colors"
            title="Divider Line"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-stone-300 mx-0.5 shrink-0" />

          {/* Sleek Highlighter */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-stone-200 bg-white shadow-2xs shrink-0">
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={handleToggleHighlighterButton}
              className="p-0.5 rounded text-stone-700 hover:text-black"
              title="Highlight selection"
            >
              <Highlighter className="w-3 h-3 text-[var(--clean-accent-caramel,#B4793D)]" />
            </button>
            <div className="w-[1px] h-3 bg-stone-200 shrink-0" />
            {(['yellow', 'green', 'red', 'blue'] as const).map(color => {
              const cfg = HIGHLIGHT_CONFIG[color];
              const isCurrent = activeHighlightColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleApplyHighlight(color)}
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${isCurrent ? 'ring-2 ring-stone-700 ring-offset-1 scale-110' : 'opacity-80 hover:opacity-100'}`}
                  style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
                  title={`Highlight in ${cfg.label}`}
                />
              );
            })}
          </div>

          <div className="w-[1px] h-3.5 bg-stone-300 mx-0.5 shrink-0" />

          {/* Quick Quote Active Verse */}
          {selectedVerse && (
            <button
              onClick={handleInsertScripture}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-[var(--clean-highlight-cream,#FAF3E8)] border border-stone-200 hover:border-[var(--clean-accent-caramel,#B4793D)] text-[11px] font-medium text-[#26221F] shadow-2xs transition-colors shrink-0"
              title={`Quote ${currentBook} ${currentChapter}:${selectedVerse.verseNumber} into note`}
            >
              <Quote className="w-3 h-3 text-[var(--clean-accent-caramel,#B4793D)]" />
              <span>Quote v.{selectedVerse.verseNumber}</span>
            </button>
          )}

          {/* Structured Outline Insert */}
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleInsertOutline}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-[var(--clean-highlight-cream,#FAF3E8)] border border-stone-200 hover:border-[var(--clean-accent-caramel,#B4793D)] text-[11px] font-semibold text-[var(--clean-accent-dark,#B4793D)] shadow-2xs transition-colors shrink-0"
            title="Insert study outline template"
          >
            <LayoutTemplate className="w-3 h-3" />
            <span>+ Outline</span>
          </button>
        </div>

        {/* Right Status Indicator */}
        <div className="flex items-center gap-2 text-[10.5px] text-stone-500 font-mono shrink-0 ml-auto">
          <span className="text-emerald-700 flex items-center gap-1 font-sans">
            <Check className="w-3 h-3" />
            <span>Saved</span>
          </span>
          <span>•</span>
          <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
        </div>
      </div>

      {/* 3. DISTRACTION-FREE NOTION/CRAFT DOCUMENT CANVAS */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-10 lg:px-12 py-6 sm:py-8 flex flex-col custom-scrollbar bg-white">
        <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col">
          {/* Note Title Input (Large Notion-Style Header) */}
          <input
            type="text"
            value={activeTab?.title || ''}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Untitled Note"
            className="w-full text-2xl sm:text-3xl font-bold font-heading text-[#26221F] placeholder:text-stone-300 bg-transparent border-none outline-none mb-2 pb-1"
            style={{
              fontFamily: currentFontConfig.cssFamily,
              border: 'none',
              outline: 'none',
              boxShadow: 'none'
            }}
          />

          {/* Document Context Metadata Row */}
          <div className="flex items-center justify-between text-xs text-stone-500 pb-3 mb-4 border-b border-stone-100 flex-wrap gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {activeTab?.book && activeTab?.chapter ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (onSelectPassage && activeTab.book && activeTab.chapter) {
                        const targetBook = BIBLE_BOOKS.find(
                          b => b.name.toLowerCase() === activeTab.book!.toLowerCase() || b.id.toLowerCase() === activeTab.book!.toLowerCase()
                        );
                        if (targetBook) {
                          onSelectPassage(targetBook.id, activeTab.chapter);
                        }
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF5ED] border border-[#E8E2D8] text-[var(--clean-accent-dark,#B4793D)] font-semibold hover:bg-[#F5ECE0] transition-colors"
                    title={`Open ${activeTab.book} ${activeTab.chapter} in Bible reader`}
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>{activeTab.book} {activeTab.chapter}</span>
                    <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                  </button>
                  <button
                    onClick={handleToggleCurrentChapterLink}
                    className="text-[10px] text-stone-400 hover:text-stone-700 underline"
                    title="Change to general note"
                  >
                    Unlink
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                    General Reflection
                  </span>
                  <button
                    onClick={handleToggleCurrentChapterLink}
                    className="text-[10px] text-[var(--clean-accent-caramel,#B4793D)] hover:underline"
                    title={`Link note to ${currentBook} ${currentChapter}`}
                  >
                    Link to {currentBook} {currentChapter}
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-stone-400 font-mono shrink-0">
              <span>{activeTab?.updatedAt ? new Date(activeTab.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
              <span>•</span>
              <span>{currentFontConfig.label}</span>
            </div>
          </div>

          {/* Quick Outline Starter Banner for Empty Notes */}
          {(!activeTab?.content || activeTab.content.trim() === '') && (
            <div
              className="p-3 mb-4 rounded-xl border flex items-center justify-between gap-3 select-none animate-fadeIn"
              style={{
                backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                borderColor: 'var(--clean-accent-border, #EBE5DC)'
              }}
            >
              <div className="flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-[var(--clean-accent-caramel,#B4793D)] shrink-0" />
                <span className="text-xs text-[#26221F] font-medium">
                  Looking for structure? Insert a study outline with key verses, themes & observations.
                </span>
              </div>
              <button
                type="button"
                onClick={handleInsertOutline}
                className="px-3 py-1 bg-white border rounded-lg text-xs font-bold transition-all shadow-2xs hover:bg-[#FAF3E8] shrink-0"
                style={{
                  borderColor: 'var(--clean-accent-border-strong, #D4A373)',
                  color: 'var(--clean-accent-dark, #B4793D)'
                }}
              >
                + Insert Outline
              </button>
            </div>
          )}

          {/* Rich Text Editor or Markdown Preview */}
          <div className="flex-1 flex flex-col relative min-h-[350px]">
            {isPreviewMode ? (
              <div
                className="w-full h-full overflow-y-auto custom-scrollbar select-text leading-relaxed p-1"
                style={{
                  fontFamily: currentFontConfig.cssFamily,
                  fontSize: currentSizeConfig.cssSize
                }}
              >
                {activeTab?.content?.trim() ? (
                  <MarkdownTheologyRenderer content={activeTab.content} />
                ) : (
                  <span className="text-stone-300 italic">This note is currently empty. Click "Edit" above to start typing.</span>
                )}
              </div>
            ) : (
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                onMouseUp={saveSelection}
                onKeyUp={saveSelection}
                onSelect={saveSelection}
                onBlur={() => {
                  handleEditorInput();
                  saveSelection();
                }}
                data-placeholder="Start typing your study notes, reflections, or sermon points here..."
                className="rich-notepad-editor w-full flex-1 outline-none text-[#26221F] leading-relaxed p-1 bg-transparent select-text"
                style={{
                  fontFamily: currentFontConfig.cssFamily,
                  fontSize: currentSizeConfig.cssSize,
                  lineHeight: activeFontFamilyId === 'script' ? '1.9' : '1.7'
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* 4. COLLAPSIBLE AI ASSISTANT DRAWER (Non-Intrusive, Preserves 80%+ Writing Space) */}
      <div
        className="border-t flex flex-col flex-shrink-0 transition-all select-none"
        style={{
          borderTopColor: 'var(--clean-accent-border, #EBE5DC)',
          backgroundColor: 'var(--clean-highlight-cream, #FAF8F5)'
        }}
      >
        {/* Collapsed State Bar */}
        {!isAiBoxExpanded ? (
          <div className="px-3 sm:px-4 py-2 pr-32 flex items-center justify-between text-xs text-stone-600">
            <button
              onClick={() => setIsAiBoxExpanded(true)}
              className="flex items-center gap-2 hover:text-[var(--clean-accent-dark,#B4793D)] font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--clean-accent-caramel,#B4793D)]" />
              <span>Ask Berea AI Assistant about notes & Scripture</span>
            </button>

            <button
              onClick={() => setIsAiBoxExpanded(true)}
              className="p-1 rounded text-stone-400 hover:text-stone-700 flex items-center gap-1 shrink-0"
              title="Open AI companion"
            >
              <span className="text-[10px] text-stone-400 hidden sm:inline">Expand</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Expanded State Drawer */
          <div className="p-3 pb-4 pr-32 flex flex-col gap-2 animate-fadeIn max-h-60 overflow-y-auto custom-scrollbar">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--clean-accent-caramel,#B4793D)]" />
                <span className="text-xs font-bold text-[#26221F]">
                  Berea AI Companion
                </span>
                <span className="text-[10px] text-[#78716C] hidden sm:inline">
                  • Connected to your notes & Scripture
                </span>
              </div>

              <div className="flex items-center gap-1">
                {aiResponse && (
                  <button
                    onClick={() => setAiResponse(null)}
                    className="text-[10px] text-stone-500 hover:text-stone-800 px-1.5 py-0.5 rounded hover:bg-stone-200/60"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setIsAiBoxExpanded(false)}
                  className="p-1 rounded text-stone-500 hover:text-stone-800"
                  title="Minimize AI companion"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* AI Response Card */}
            {aiResponse && (
              <div
                className="bg-white border rounded-xl p-2.5 shadow-xs flex flex-col gap-1.5 max-h-36 overflow-y-auto custom-scrollbar"
                style={{ borderColor: 'var(--clean-accent-border, #E2D5C3)' }}
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-1 sticky top-0 bg-white z-10">
                  <span className="text-[10.5px] font-bold text-[#78471F] flex items-center gap-1 truncate max-w-[220px]">
                    <Sparkles className="w-2.5 h-2.5 text-[var(--clean-accent-caramel,#B4793D)] shrink-0" />
                    <span className="truncate">{aiResponse.prompt}</span>
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={handleInsertAiResponse}
                      className="inline-flex items-center gap-1 px-2 py-0.5 border rounded text-[10px] font-semibold transition-colors shadow-2xs"
                      style={{
                        backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                        color: 'var(--clean-accent-dark, #B4793D)',
                        borderColor: 'var(--clean-accent-border, #E2D5C3)'
                      }}
                    >
                      {aiInserted ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                          <span className="text-emerald-700">Inserted!</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownToLine className="w-2.5 h-2.5" />
                          <span>Insert into Note</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCopyAiResponse}
                      className="p-1 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-800"
                      title="Copy response"
                    >
                      {aiCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => setAiResponse(null)}
                      className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#26221F] leading-relaxed select-text">
                  <MarkdownTheologyRenderer content={aiResponse.text} />
                </div>
              </div>
            )}

            {/* AI Thinking Animation */}
            {isAiThinking && (
              <div
                className="flex items-center gap-2 p-2 rounded-xl text-xs animate-pulse border"
                style={{
                  backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                  borderColor: 'var(--clean-accent-border, #E2D5C3)',
                  color: 'var(--clean-accent-dark, #78471F)'
                }}
              >
                <Sparkles className="w-3.5 h-3.5 animate-spin text-[var(--clean-accent-caramel,#B4793D)]" />
                <span className="text-[11px] font-medium">Synthesizing Scripture context and your notes...</span>
              </div>
            )}

            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {AI_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (s.action === 'summarize') {
                      handleSummarizeNotes();
                    } else {
                      handleAskAi(s.prompt);
                    }
                  }}
                  disabled={isAiThinking}
                  className="px-2 py-0.5 rounded-full border text-[10.5px] font-medium transition-colors whitespace-nowrap disabled:opacity-50 shrink-0"
                  style={s.action === 'summarize' ? {
                    backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                    borderColor: 'var(--clean-accent-border-strong, #B4793D)',
                    color: 'var(--clean-accent-dark, #B4793D)',
                    fontWeight: 600
                  } : {
                    backgroundColor: '#FFFFFF',
                    borderColor: 'var(--clean-accent-border, #EBE5DC)',
                    color: '#57524E'
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Prompt Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAi();
              }}
              className="flex items-center gap-2 bg-white border rounded-xl px-3 py-1.5 transition-all shadow-xs"
              style={{ borderColor: 'var(--clean-accent-border, #E2D5C3)' }}
            >
              <input
                type="text"
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                placeholder={
                  activeTab?.content?.trim()
                    ? `Ask AI about ${currentBook} ${currentChapter} or what you wrote in "${activeTab.title}"...`
                    : `Ask AI to explain ${currentBook} ${currentChapter}, provide insights, draft outline...`
                }
                disabled={isAiThinking}
                className="flex-1 bg-transparent text-xs text-[#26221F] placeholder:text-stone-400 outline-none border-none"
                style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
              />

              <button
                type="submit"
                disabled={!aiQuery.trim() || isAiThinking}
                className="p-1.5 rounded-lg text-white disabled:opacity-30 transition-colors shrink-0"
                style={{ backgroundColor: 'var(--clean-accent-caramel, #B4793D)' }}
                title="Send query"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

