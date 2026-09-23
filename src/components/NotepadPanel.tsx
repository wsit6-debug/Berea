import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, X, Edit2, Check, Copy, Download, Trash2,
  BookOpen, Sparkles, Type, Minus, AlignLeft,
  List, CheckSquare, Quote, FileText, Bookmark,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ExternalLink, RotateCcw, Layers,
  Send, ArrowDownToLine, Highlighter, Eye, LayoutTemplate
} from 'lucide-react';
import { Verse, TranslationId } from '../data/bibleData';
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
  onSelectHighlightColor: externalSetHighlightColor
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
  const [isAiBoxExpanded, setIsAiBoxExpanded] = useState(true);
  const [aiCopied, setAiCopied] = useState(false);
  const [aiInserted, setAiInserted] = useState(false);

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

  // ONLY show tabs that correlate to this specific page (e.g. Genesis 24) plus the universal General Journal.
  // General Journal is always the FIRST referenced tab that doesn't move, and everything else comes after it.
  const generalJournalTab = notepadState.tabs.find(t => !t.book && !t.chapter);
  const pageSpecificTabs = notepadState.tabs.filter(
    t => t.book === currentBook && t.chapter === currentChapter && t.id !== generalJournalTab?.id
  );

  const visibleTabs = [
    ...(generalJournalTab ? [generalJournalTab] : []),
    ...pageSpecificTabs
  ];

  // Active Tab - fallback to first visible tab if current activeTab is from another chapter
  const activeTab = visibleTabs.find(t => t.id === notepadState.activeTabId) || visibleTabs[0] || notepadState.tabs[0];

  // Active typography options
  const activeFontFamilyId = activeTab?.fontFamily || notepadState.globalFontFamily || 'sans';
  const activeFontSizeId = activeTab?.fontSize || notepadState.globalFontSize || 'sm';

  const currentFontConfig = FONT_FAMILY_OPTIONS.find(f => f.id === activeFontFamilyId) || FONT_FAMILY_OPTIONS[1];
  const currentSizeConfig = FONT_SIZE_OPTIONS.find(s => s.id === activeFontSizeId) || FONT_SIZE_OPTIONS[1];

  // Track previous book/chapter to detect navigation
  const prevChapterRef = useRef<{ book: string; chapter: number }>({
    book: currentBook,
    chapter: currentChapter
  });

  // AUTOMATIC PAGE SYNC:
  // When navigating chapters (e.g. Genesis 24), find or initialize the dedicated page journal
  // for this chapter and ensure it's selected unless the user was explicitly working on the General Journal.
  // General Journal always remains the first tab; page journals and new tabs come after it.
  useEffect(() => {
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
        // Create the dedicated blank journal for this chapter
        const pageTitle = `${currentBook} ${currentChapter} Journal`;
        pageTab = createNewNoteTab(pageTitle, currentBook, currentChapter);
        pageTab.content = '';
        pageTab.fontFamily = currentActive?.fontFamily || current.globalFontFamily || 'sans';
        pageTab.fontSize = currentActive?.fontSize || current.globalFontSize || 'sm';
        // Place pageTab right after general journal, before other older section tabs
        otherTabs = [pageTab, ...otherTabs.filter(t => t.id !== pageTab!.id)];
      }

      return {
        ...current,
        tabs: general ? [general, ...otherTabs] : [pageTab, ...otherTabs],
        // Revert to the dedicated page journal unless user is on the General Journal
        activeTabId: isCurrentlyInGeneral ? current.activeTabId : pageTab.id
      };
    });
  }, [currentBook, currentChapter]);

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

  const handleHeading = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    document.execCommand('formatBlock', false, '<h3>');
    saveSelection();
    handleContentChange(editorRef.current.innerHTML);
  };

  const handleBulletList = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    document.execCommand('insertUnorderedList', false);
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

  // Stats
  const wordCount = activeTab?.content?.trim() ? activeTab.content.trim().split(/\s+/).length : 0;
  const charCount = activeTab?.content?.length || 0;

  return (
    <div className="flex flex-col h-full bg-white text-[#26221F] select-text">
      {/* 1. TABS HEADER STRIP WITH SLIDER */}
      <div
        className="border-b px-2 py-1.5 flex flex-col gap-1.5 flex-shrink-0 transition-colors"
        style={{
          borderBottomColor: 'var(--clean-accent-border, #EBE5DC)',
          backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)'
        }}
      >
        <div className="flex items-center gap-1">
          {/* Left Slider Button */}
          <button
            onClick={() => handleScrollTabs('left')}
            className="p-1 rounded-md bg-white hover:bg-[var(--clean-highlight-cream,#FAF5ED)] text-[#78716C] hover:text-[#26221F] transition-colors shrink-0 border shadow-2xs"
            style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
            title="Slide journals left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Scrollable Journal Slider Track */}
          <div
            ref={tabsContainerRef}
            className="flex items-center gap-1.5 min-w-0 flex-1 overflow-x-auto py-0.5 custom-scrollbar scroll-smooth"
            style={{ scrollbarWidth: 'thin' }}
          >
            {visibleTabs.map(tab => {
              const isActive = tab.id === activeTab?.id;
              const isEditing = editingTabId === tab.id;

              return (
                <div
                  key={tab.id}
                  data-tab-id={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all border shrink-0 max-w-[140px]"
                  style={isActive ? {
                    backgroundColor: '#FFFFFF',
                    borderColor: 'var(--clean-accent-border-strong, #B4793D)',
                    boxShadow: '0 0 0 1px var(--clean-accent-border, rgba(180,121,61,0.3))',
                    color: '#26221F',
                    fontWeight: 700
                  } : {
                    backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                    borderColor: 'var(--clean-accent-border, #EBE5DC)',
                    color: '#78716C'
                  }}
                  title={tab.title}
                >
                  {/* Active Accent Dot */}
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: 'var(--clean-accent-caramel, #B4793D)' }}
                    />
                  )}

                  {/* Chapter tag pill on tab */}
                  {tab.book && tab.chapter && (
                    <span
                      className="text-[9px] px-1 py-0.2 rounded font-sans uppercase tracking-wider font-bold transition-colors border"
                      style={isActive ? {
                        backgroundColor: 'var(--clean-highlight-cream, #FAF3E8)',
                        color: 'var(--clean-accent-dark, #B4793D)',
                        borderColor: 'var(--clean-accent-border, rgba(180,121,61,0.3))'
                      } : {
                        backgroundColor: 'var(--clean-bg, #EBE5DC)',
                        color: '#78716C',
                        borderColor: 'var(--clean-accent-border, #EBE5DC)'
                      }}
                    >
                      {tab.book.substring(0, 3)} {tab.chapter}
                    </span>
                  )}

                  {isEditing ? (
                    <input
                      type="text"
                      value={editingTabTitle}
                      onChange={e => setEditingTabTitle(e.target.value)}
                      onBlur={handleSaveRenameTab}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveRenameTab();
                        if (e.key === 'Escape') setEditingTabId(null);
                      }}
                      autoFocus
                      className="w-24 bg-white border rounded px-1 py-0.5 text-xs text-[#26221F] outline-none"
                      style={{ borderColor: 'var(--clean-accent-border-strong, #B4793D)' }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      onDoubleClick={e => handleStartRenameTab(tab, e)}
                      className="truncate flex-1 min-w-0"
                    >
                      {tab.title}
                    </span>
                  )}

                  {/* Edit tab title button */}
                  {!isEditing && isActive && (
                    <button
                      onClick={e => handleStartRenameTab(tab, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-[var(--clean-accent-caramel,#B4793D)] transition-opacity p-0.5 rounded"
                      title="Rename journal"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                  )}

                  {/* Close/Delete tab button */}
                  <button
                    onClick={e => handleDeleteTab(tab.id, e)}
                    className={`p-0.5 rounded-full hover:bg-[var(--clean-highlight-cream,#EBE5DC)] text-[#A8A29E] hover:text-rose-600 transition-colors ${isActive ? 'opacity-70 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    title={notepadState.tabs.length <= 1 ? 'Clear note' : 'Close journal'}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* Add New Blank Tab Button */}
            <button
              onClick={handleAddTab}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#78716C] hover:text-[#26221F] bg-white hover:bg-[var(--clean-highlight-cream,#FAF5ED)] transition-colors border border-dashed shrink-0"
              style={{ borderColor: 'var(--clean-accent-border, #DCD5C9)' }}
              title="Create new blank tab dedicated to this section"
            >
              <Plus className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
              <span>New Tab</span>
            </button>
          </div>

          {/* Right Slider Button */}
          <button
            onClick={() => handleScrollTabs('right')}
            className="p-1 rounded-md bg-white hover:bg-[var(--clean-highlight-cream,#FAF5ED)] text-[#78716C] hover:text-[#26221F] transition-colors shrink-0 border shadow-2xs"
            style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
            title="Slide tabs right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. ACTIVE TAB INDICATOR & SECTION TABS QUICK SWITCHER BAR */}
        <div
          className="flex items-center justify-between pt-1 border-t text-xs text-[#78716C] px-0.5"
          style={{ borderTopColor: 'var(--clean-accent-border, #EBE5DC)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded border"
              style={{
                color: 'var(--clean-accent-dark, #78471F)',
                backgroundColor: 'var(--clean-highlight-cream, #FAF3E8)',
                borderColor: 'var(--clean-accent-border, #E2D5C3)'
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--clean-accent-caramel, #B4793D)' }}
              />
              Active Tab:
            </span>
            <span className="font-bold text-[#26221F] truncate text-xs">
              {activeTab?.title || 'Untitled'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-[1px] h-3.5 bg-[var(--clean-border,#DCD5C9)]" />

            {/* Section Tabs Switcher Dropdown */}
            <div className="relative shrink-0" ref={journalMenuRef}>
              <button
                onClick={() => setShowJournalMenu(prev => !prev)}
                className="flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-[var(--clean-highlight-cream,#FAF7F2)] border rounded text-[10.5px] font-semibold text-[#26221F] transition-colors shadow-2xs"
                style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                title={`View tabs dedicated to ${currentBook} ${currentChapter} and switch directly`}
              >
                <Layers className="w-3 h-3" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                <span>Section Tabs ({visibleTabs.length})</span>
                <ChevronDown className="w-2.5 h-2.5 text-[#78716C]" />
              </button>

              {showJournalMenu && (
                <div
                  className="absolute right-0 mt-1 w-64 bg-white border rounded-xl shadow-xl p-1.5 z-30 animate-fadeIn"
                  style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                >
                  <div
                    className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-[#78716C] border-b mb-1 flex items-center justify-between"
                    style={{ borderBottomColor: 'var(--clean-accent-border, #EBE5DC)' }}
                  >
                    <span>Section Tabs</span>
                    <span
                      className="font-mono text-[9px] font-bold"
                      style={{ color: 'var(--clean-accent-caramel, #B4793D)' }}
                    >
                      {currentBook.substring(0, 3)} {currentChapter}
                    </span>
                  </div>
                  <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-0.5">
                    {visibleTabs.map((tab, idx) => {
                      const isTabActive = tab.id === activeTab?.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            handleSelectTab(tab.id);
                            setShowJournalMenu(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left"
                          style={isTabActive ? {
                            backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                            color: 'var(--clean-accent-dark, #B4793D)',
                            fontWeight: 700
                          } : {
                            color: '#26221F'
                          }}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {isTabActive ? (
                              <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                            ) : (
                              <span className="w-3.5 text-[10px] text-[var(--clean-text-tertiary,#A8A29E)] font-mono text-center shrink-0">
                                {idx + 1}
                              </span>
                            )}
                            <span className="truncate">{tab.title}</span>
                          </div>
                          {tab.book && tab.chapter ? (
                            <span
                              className="text-[9px] px-1 py-0.5 rounded font-mono shrink-0 border"
                              style={{
                                backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                                color: 'var(--clean-accent-dark, #78716C)',
                                borderColor: 'var(--clean-accent-border, #EBE5DC)'
                              }}
                            >
                              {tab.book.substring(0, 3)} {tab.chapter}
                            </span>
                          ) : (
                            <span
                              className="text-[9px] px-1 py-0.5 rounded font-mono shrink-0 border"
                              style={{
                                backgroundColor: 'var(--clean-highlight-cream, #FAF3E8)',
                                color: 'var(--clean-accent-dark, #B4793D)',
                                borderColor: 'var(--clean-accent-border, #EBE5DC)'
                              }}
                            >
                              General
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      handleAddTab();
                      setShowJournalMenu(false);
                    }}
                    className="w-full mt-1 pt-1.5 border-t flex items-center justify-center gap-1 text-[11px] font-semibold p-1.5 rounded-lg transition-colors hover:bg-[var(--clean-highlight-cream,#FAF5ED)]"
                    style={{
                      borderTopColor: 'var(--clean-accent-border, #EBE5DC)',
                      color: 'var(--clean-accent-dark, #B4793D)'
                    }}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create Tab for this Section</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. TYPOGRAPHY & CHAPTER CONTROLS TOOLBAR */}
      <div
        className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-1.5 bg-white border-b text-xs"
        style={{ borderBottomColor: 'var(--clean-accent-border, #EBE5DC)' }}
      >
        {/* Left: Chapter Link Indicator & Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleCurrentChapterLink}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors border"
            style={activeTab?.book && activeTab?.chapter ? {
              backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
              color: 'var(--clean-accent-dark, #B4793D)',
              borderColor: 'var(--clean-accent-border, #E2D5C3)'
            } : {
              backgroundColor: '#F5F5F4',
              color: '#78716C',
              borderColor: '#E7E5E4'
            }}
            title={activeTab?.book ? 'Click to set as General (unbound) note' : `Click to link to ${currentBook} ${currentChapter}`}
          >
            <BookOpen className="w-3 h-3" />
            <span>
              {activeTab?.book && activeTab?.chapter
                ? `${activeTab.book} ${activeTab.chapter}`
                : 'General Note (Click to link)'}
            </span>
          </button>

          {/* Quick Insert Scripture Quote Button */}
          {selectedVerse && (
            <>
              <div className="w-[1px] h-3.5 bg-[#DCD5C9] mx-0.5 shrink-0" />
              <button
                onClick={handleInsertScripture}
                className="inline-flex items-center gap-1 px-2 py-0.5 hover:bg-[var(--clean-highlight-cream,#FAF7F2)] text-[#57524E] hover:text-[#26221F] border rounded-full text-[11px] font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)'
                }}
                title={`Insert ${currentBook} ${currentChapter}:${selectedVerse.verseNumber} into note`}
              >
                <Sparkles className="w-3 h-3" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                <span>Quote v.{selectedVerse.verseNumber}</span>
              </button>
            </>
          )}

          {/* Dedicated Separation Line */}
          <div className="w-[1px] h-3.5 bg-[#DCD5C9] mx-0.5 shrink-0" />

          {/* Auto-Sync Page Indicator */}
          <div
            className="text-[10.5px] px-2 py-0.5 rounded-full shrink-0 font-medium flex items-center gap-1.5 border"
            style={{
              backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
              color: 'var(--clean-accent-dark, #78471F)',
              borderColor: 'var(--clean-accent-border, #E2D5C3)'
            }}
            title={`Auto-synced to current page: ${currentBook} ${currentChapter}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">{currentBook.substring(0, 3)} {currentChapter}</span>
            <span className="text-[9px] text-[#A67035] hidden sm:inline">(synced)</span>
          </div>
        </div>

        {/* Right: Font Family & Font Size Adjusters */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Font Family Dropdown */}
          <div className="relative" ref={fontMenuRef}>
            <button
              onClick={() => setShowFontMenu(prev => !prev)}
              className="flex items-center gap-1.5 px-2 py-0.5 bg-[#FAF7F2] hover:bg-[#F0ECE4] border rounded text-[11px] text-[#26221F] font-medium transition-colors"
              style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
              title="Change note font family"
            >
              <Type className="w-3 h-3" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
              <span className="font-semibold">{currentFontConfig.label}</span>
              <ChevronDown className="w-2.5 h-2.5 text-stone-400" />
            </button>

            {showFontMenu && (
              <div
                className="absolute right-0 mt-1 w-44 bg-white border rounded-xl shadow-lg p-1 z-30 animate-fadeIn"
                style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
              >
                <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-stone-400">
                  Select Font Style
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
                    <span className="text-[10px] opacity-60">Sample</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Size Stepper */}
          <div
            className="flex items-center bg-[#FAF7F2] border rounded px-1 py-0.5 gap-1"
            style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
          >
            <button
              onClick={() => handleStepFontSize('down')}
              disabled={activeFontSizeId === 'xs'}
              className="p-0.5 text-stone-600 hover:text-black disabled:opacity-30 transition-colors"
              title="Decrease font size"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-[10.5px] font-mono font-medium px-1 text-stone-600">
              {currentSizeConfig.pxLabel}
            </span>
            <button
              onClick={() => handleStepFontSize('up')}
              disabled={activeFontSizeId === 'xl'}
              className="p-0.5 text-stone-600 hover:text-black disabled:opacity-30 transition-colors"
              title="Increase font size"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Dedicated Separation Line */}
          <div className="w-[1px] h-4 bg-[#DCD5C9] mx-0.5 shrink-0" />

          {/* Summarize Notes Button */}
          <button
            onClick={handleSummarizeNotes}
            disabled={isAiThinking}
            className="inline-flex items-center gap-1 px-2 py-0.5 border rounded text-[11px] font-semibold transition-colors disabled:opacity-50"
            style={{
              backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
              color: 'var(--clean-accent-dark, #B4793D)',
              borderColor: 'var(--clean-accent-border, #E2D5C3)'
            }}
            title="Summarize your notes for this journal using AI"
          >
            <Sparkles className="w-3 h-3" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
            <span className="hidden sm:inline">Summarize</span>
          </button>

          {/* Dedicated Separation Line */}
          <div className="w-[1px] h-4 bg-[#DCD5C9] mx-0.5 shrink-0" />

          {/* Note Actions: Copy & Download */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleCopyNote}
              className="p-1 rounded hover:bg-[#FAF7F2] text-stone-500 hover:text-stone-800 transition-colors"
              title="Copy note to clipboard"
            >
              {copiedNotification ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={() => activeTab && downloadNoteAsFile(activeTab)}
              className="p-1 rounded hover:bg-[#FAF7F2] text-stone-500 hover:text-stone-800 transition-colors"
              title="Download as Markdown file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. FORMATTING QUICK TOOLBAR (Live Bold & Directly Selectable 4-Color Highlighter) */}
      <div
        className="flex items-center gap-1.5 px-3 py-1 bg-[#FAF8F5] border-b text-stone-500 text-xs overflow-x-auto custom-scrollbar"
        style={{ borderBottomColor: 'var(--clean-accent-border, #EBE5DC)' }}
      >
        {/* Bold Button */}
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={handleToggleBold}
          className="px-2.5 py-1 font-bold hover:bg-[#EBE5DC] bg-white rounded text-stone-800 transition-colors text-xs flex items-center justify-center border hover:border-stone-300 active:scale-95 shadow-2xs"
          style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
          title="Bold (Selection or Cursor) - Cmd+B / Ctrl+B"
        >
          B
        </button>

        {/* Dedicated Separation Line */}
        <div className="w-[1px] h-4 bg-[#DCD5C9] mx-1 shrink-0" />

        {/* Highlight Swatches Palette: Yellow, Green, Red, Blue usable for left side book or notes */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all"
          style={isHighlighterMode ? {
            backgroundColor: 'var(--clean-highlight-cream, #FAF3E8)',
            borderColor: 'var(--clean-accent-border-strong, #B4793D)'
          } : {
            backgroundColor: '#FFFFFF',
            borderColor: 'var(--clean-accent-border, #EBE5DC)'
          }}
        >
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleToggleHighlighterButton}
            className="p-1 rounded transition-all flex items-center gap-1 mr-0.5"
            style={isHighlighterMode ? {
              backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
              color: '#FFFFFF'
            } : undefined}
            title={
              selectedVerse
                ? `Highlight v.${selectedVerse.verseNumber} on book side (Strictly saved to "${activeTab?.title}")`
                : isHighlighterMode
                  ? 'Highlighter mode active on book side — click to turn off'
                  : `Highlighter tool (${activeHighlightColor}) — click to turn on or highlight selection`
            }
          >
            <Highlighter className={`w-3 h-3 ${isHighlighterMode ? 'text-white' : ''}`} style={!isHighlighterMode ? { color: 'var(--clean-accent-caramel, #B4793D)' } : undefined} />
            <span className={`font-bold text-[11px] ${isHighlighterMode ? 'text-white' : 'text-stone-700'}`}>H</span>
          </button>

          {/* Small internal divider */}
          <div className="w-[1px] h-3.5 mx-0.5 shrink-0 bg-[#DCD5C9]" />

          {/* 4 Dedicated Color Buttons */}
          {(['yellow', 'green', 'red', 'blue'] as const).map(color => {
            const cfg = HIGHLIGHT_CONFIG[color];
            const isCurrent = activeHighlightColor === color;
            return (
              <button
                key={color}
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => handleApplyHighlight(color)}
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isCurrent
                    ? 'ring-2 ring-stone-800 ring-offset-1 scale-105 shadow-xs'
                    : 'hover:scale-105 opacity-85 hover:opacity-100'
                  }`}
                style={{
                  backgroundColor: cfg.bg,
                  border: `1.5px solid ${cfg.border}`
                }}
                title={`Highlight in ${cfg.label} (Strictly confined to "${activeTab?.title}")`}
              >
                {isCurrent && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: cfg.text }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Dedicated Separation Line */}
        <div className="w-[1px] h-4 bg-[#DCD5C9] mx-1 shrink-0" />

        {/* Text Styling (Italic, Heading) */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleToggleItalic}
            className="px-2 py-1 italic font-serif hover:bg-[#EBE5DC] rounded text-stone-700 transition-colors"
            title="Italic (Cmd+I / Ctrl+I)"
          >
            I
          </button>
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleHeading}
            className="px-2 py-1 font-semibold hover:bg-[#EBE5DC] rounded text-stone-700 transition-colors text-xs"
            title="Heading 3"
          >
            H3
          </button>
        </div>

        {/* Dedicated Separation Line */}
        <div className="w-[1px] h-4 bg-[#DCD5C9] mx-1 shrink-0" />

        {/* Structure Elements (List, Checklist, Quote, Divider) */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleBulletList}
            className="p-1.5 hover:bg-[#EBE5DC] rounded text-stone-700 transition-colors"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleTaskItem}
            className="p-1.5 hover:bg-[#EBE5DC] rounded text-stone-700 transition-colors"
            title="Checklist / Task"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleQuoteBlock}
            className="p-1.5 hover:bg-[#EBE5DC] rounded text-stone-700 transition-colors"
            title="Quote Block"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleHorizontalRule}
            className="px-2 py-1 hover:bg-[#EBE5DC] rounded text-[11px] text-stone-700 font-mono transition-colors"
            title="Horizontal Rule / Divider"
          >
            Divider
          </button>
        </div>

        {/* Dedicated Separation Line */}
        <div className="w-[1px] h-4 bg-[#DCD5C9] mx-1 shrink-0" />

        {/* Structured Outlines & Section Demarcation */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleInsertOutline}
            className="px-2 py-0.5 bg-white rounded text-[11px] font-semibold transition-all flex items-center gap-1 shadow-2xs active:scale-95 border"
            style={{
              borderColor: 'var(--clean-accent-border, #E2D5C3)',
              color: 'var(--clean-accent-dark, #B4793D)'
            }}
            title="Insert Structured Study Outline (Header, Scripture, Notes, Application)"
          >
            <LayoutTemplate className="w-3 h-3" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
            <span>Outline</span>
          </button>
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={handleInsertHeaderBox}
            className="px-1.5 py-0.5 bg-white hover:bg-stone-50 border text-stone-700 rounded text-[11px] transition-all shadow-2xs active:scale-95"
            style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
            title="Insert a dedicated Section Header box"
          >
            + Header Box
          </button>
        </div>

        {/* Dedicated Separation Line */}
        <div className="w-[1px] h-4 bg-[#DCD5C9] mx-1 shrink-0" />

        {/* Edit vs Preview Toggle Button */}
        <button
          type="button"
          onClick={() => setIsPreviewMode(prev => !prev)}
          className="ml-auto px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 border"
          style={isPreviewMode ? {
            backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
            color: 'var(--clean-accent-dark, #B4793D)',
            borderColor: 'var(--clean-accent-border, #E2D5C3)'
          } : {
            backgroundColor: '#FFFFFF',
            color: '#57524E',
            borderColor: 'var(--clean-accent-border, #E2D5C3)'
          }}
          title={isPreviewMode ? 'Switch to edit mode' : 'Preview formatted text, bold & highlights'}
        >
          {isPreviewMode ? (
            <>
              <Edit2 className="w-3 h-3" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
              <span>Edit</span>
            </>
          ) : (
            <>
              <Eye className="w-3 h-3 text-stone-500" />
              <span>Preview</span>
            </>
          )}
        </button>

        {copiedNotification && (
          <span className="text-[10.5px] text-emerald-600 font-medium animate-fadeIn ml-1">
            Copied!
          </span>
        )}
      </div>

      {/* 4. MAIN NOTE EDITOR AREA */}
      <div className="flex-1 flex flex-col p-3 gap-2 overflow-hidden bg-white">
        {/* Note Title Input */}
        <input
          type="text"
          value={activeTab?.title || ''}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Title of this note..."
          className="w-full text-base font-bold text-[#26221F] bg-transparent border-b border-transparent hover:border-stone-200 pb-1 outline-none transition-colors"
          style={{
            fontFamily: currentFontConfig.cssFamily,
            borderColor: 'transparent'
          }}
        />

        {/* Rich Text Editor or Preview */}
        <div className="flex-1 relative min-h-0 flex flex-col">
          {isPreviewMode ? (
            <div
              className="w-full h-full overflow-y-auto custom-scrollbar p-2 rounded-lg border select-text"
              style={{
                backgroundColor: 'var(--clean-highlight-cream, #FAF8F5)',
                borderColor: 'var(--clean-accent-border, #EBE5DC)',
                fontFamily: currentFontConfig.cssFamily,
                fontSize: currentSizeConfig.cssSize
              }}
            >
              {activeTab?.content?.trim() ? (
                <MarkdownTheologyRenderer content={activeTab.content} />
              ) : (
                <span className="text-stone-300 italic">This note is currently empty. Click "Edit" above to type.</span>
              )}
            </div>
          ) : (
            <div className="relative w-full h-full flex flex-col">
              {/* Quick Outline Starter Banner for Empty Notes */}
              {(!activeTab?.content || activeTab.content.trim() === '') && (
                <div
                  className="mb-2 p-2 rounded-lg border flex items-center justify-between gap-2 select-none animate-fadeIn"
                  style={{
                    backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                    borderColor: 'var(--clean-accent-border, #EBE5DC)'
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <LayoutTemplate className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                    <span className="text-[11px] text-[#26221F] font-medium">
                      Need structured section headers and outlines?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleInsertOutline}
                    className="px-2 py-0.5 bg-white border rounded text-[10.5px] font-semibold transition-all shadow-2xs active:scale-95 shrink-0"
                    style={{
                      borderColor: 'var(--clean-accent-border-strong, #D4A373)',
                      color: 'var(--clean-accent-dark, #B4793D)'
                    }}
                  >
                    + Insert Study Outline
                  </button>
                </div>
              )}

              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                onMouseUp={saveSelection}
                onKeyUp={saveSelection}
                onSelect={saveSelection}
                onBlur={saveSelection}
                data-placeholder="Write your study notes, reflections, sermon points, or verse comparisons here... Use B to bold, H to highlight (Yellow, Green, Red, Blue), or click Outline above."
                className="rich-notepad-editor w-full flex-1 outline-none text-[#26221F] leading-relaxed overflow-y-auto custom-scrollbar p-1 bg-transparent select-text"
                style={{
                  fontFamily: currentFontConfig.cssFamily,
                  fontSize: currentSizeConfig.cssSize,
                  lineHeight: activeFontFamilyId === 'script' ? '1.9' : '1.7'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 5. DEDICATED ASK AI COMPANION BOX (Google Docs Gemini style) */}
      <div
        className="border-t p-2 flex flex-col gap-1.5 flex-shrink-0"
        style={{
          borderTopColor: 'var(--clean-accent-border, #EBE5DC)',
          backgroundColor: 'var(--clean-highlight-cream, #FAF8F5)'
        }}
      >
        {/* Header with Title & Collapse Toggle */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded border flex items-center justify-center"
              style={{
                backgroundColor: 'var(--clean-highlight-cream, #FAF3E8)',
                borderColor: 'var(--clean-accent-border, #E2D5C3)'
              }}
            >
              <Sparkles className="w-2.5 h-2.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
            </div>
            <span
              className="text-[11px] font-bold"
              style={{ color: 'var(--clean-accent-dark, #26221F)' }}
            >
              Ask AI Companion
            </span>
            <span className="text-[9.5px] text-[#78716C] hidden sm:inline">
              • Works alongside your notes
            </span>
          </div>

          <div className="flex items-center gap-1">
            {aiResponse && (
              <button
                onClick={() => setAiResponse(null)}
                className="text-[10px] text-stone-500 hover:text-stone-800 px-1.5 py-0.5 rounded hover:bg-stone-200/60 transition-colors"
                title="Dismiss AI response"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsAiBoxExpanded(prev => !prev)}
              className="p-0.5 rounded text-stone-500 hover:text-stone-800 transition-colors"
              title={isAiBoxExpanded ? 'Minimize AI companion' : 'Expand AI companion'}
            >
              {isAiBoxExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {isAiBoxExpanded && (
          <>
            {/* AI Response Card (Compact, Non-Intrusive, Scrollable so editor is never covered) */}
            {aiResponse && (
              <div
                className="bg-white border rounded-xl p-2.5 shadow-xs flex flex-col gap-1.5 max-h-40 overflow-y-auto custom-scrollbar animate-fadeIn flex-shrink-0"
                style={{ borderColor: 'var(--clean-accent-border, #E2D5C3)' }}
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-1 sticky top-0 bg-white z-10">
                  <span
                    className="text-[10px] font-bold flex items-center gap-1 truncate max-w-[200px]"
                    style={{ color: 'var(--clean-accent-dark, #78471F)' }}
                  >
                    <Sparkles className="w-2.5 h-2.5 shrink-0" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                    <span className="truncate">{aiResponse.prompt}</span>
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={handleInsertAiResponse}
                      className="inline-flex items-center gap-1 px-2 py-0.5 border rounded text-[10px] font-semibold transition-colors"
                      style={{
                        backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                        color: 'var(--clean-accent-dark, #B4793D)',
                        borderColor: 'var(--clean-accent-border, #E2D5C3)'
                      }}
                      title="Insert AI content directly into your note"
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
                      className="p-1 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
                      title="Copy response"
                    >
                      {aiCopied ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => setAiResponse(null)}
                      className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                      title="Close response"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[var(--clean-text-primary,#26221F)] leading-relaxed select-text">
                  <MarkdownTheologyRenderer content={aiResponse.text} />
                </div>

                {aiResponse.citation && (
                  <div
                    className="text-[9.5px] px-2 py-0.5 rounded border font-mono"
                    style={{
                      backgroundColor: 'var(--clean-highlight-cream, #FAF8F5)',
                      borderColor: 'var(--clean-accent-border, #EBE5DC)',
                      color: 'var(--clean-accent-dark, #78716C)'
                    }}
                  >
                    Ref: {aiResponse.citation}
                  </div>
                )}
              </div>
            )}

            {/* AI Thinking State */}
            {isAiThinking && (
              <div
                className="flex items-center gap-2 p-2 rounded-xl text-xs animate-pulse border"
                style={{
                  backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                  borderColor: 'var(--clean-accent-border, #E2D5C3)',
                  color: 'var(--clean-accent-dark, #78471F)'
                }}
              >
                <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                <span className="text-[11px] font-medium">Consulting Scripture & confessional standards for your notes...</span>
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
                  className="px-2 py-0.5 rounded-full border text-[10px] font-medium transition-colors whitespace-nowrap disabled:opacity-50 shrink-0"
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
              className="flex items-center gap-1.5 bg-white border rounded-xl px-2.5 py-1.5 transition-all shadow-xs"
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
                className="flex-1 bg-transparent text-xs text-[#26221F] placeholder:text-[#A8A29E] outline-none"
              />

              <button
                type="submit"
                disabled={!aiQuery.trim() || isAiThinking}
                className="p-1 rounded-lg text-white disabled:opacity-30 transition-colors shrink-0"
                style={{ backgroundColor: 'var(--clean-accent-caramel, #B4793D)' }}
                title="Ask AI"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
          </>
        )}
      </div>

      {/* 6. STATUS FOOTER */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-t text-[10.5px] text-[#78716C] flex-shrink-0 select-none"
        style={{
          borderTopColor: 'var(--clean-accent-border, #EBE5DC)',
          backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)'
        }}
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-700">
            <Check className="w-3 h-3" />
            <span>Saved locally ({lastSavedTime})</span>
          </span>
          <span>•</span>
          <span>
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
          <span>•</span>
          <span>{charCount} chars</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[9.5px] px-1.5 py-0.5 rounded border"
            style={{
              backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
              borderColor: 'var(--clean-accent-border, #EBE5DC)',
              color: 'var(--clean-accent-dark, #78716C)'
            }}
          >
            {currentFontConfig.label} • {currentSizeConfig.pxLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
