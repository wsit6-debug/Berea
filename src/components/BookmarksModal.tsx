import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Bookmark, Search, X, Trash2, Copy, Check, ArrowRight, ArrowUpDown, GripHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { BookmarkedVerse, useBookmarkedVerses, removeBookmark, clearAllBookmarks, getCanonicalBookIndex } from '../services/bookmarkService';
import { AnimatedPresence } from './AnimatedPresence';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPassage: (bookId: string, chapterNum: number, verseNum?: number) => void;
}

type SortOption = 'newest' | 'oldest' | 'canonical' | 'alpha';
type TestamentFilter = 'ALL' | 'OT' | 'NT';

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPassage
}) => {
  const bookmarks = useBookmarkedVerses();
  const [searchQuery, setSearchQuery] = useState(''); 1
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [testamentFilter, setTestamentFilter] = useState<TestamentFilter>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  // Initial floating position: docked on the right-hand side so chapter reading is unobstructed
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window === 'undefined') return { x: 40, y: 84 };
    const width = Math.min(500, window.innerWidth - 32);
    const initialX = window.innerWidth >= 1024
      ? Math.max(16, window.innerWidth - width - 36)
      : Math.max(16, Math.round((window.innerWidth - width) / 2));
    return { x: initialX, y: 84 };
  });

  // Keep modal inside viewport on window resize or when opened
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const modalWidth = modalRef.current?.offsetWidth || 480;
      const maxX = Math.max(10, window.innerWidth - modalWidth - 16);
      const maxY = Math.max(10, window.innerHeight - 60);

      setPosition(prev => ({
        x: Math.min(Math.max(10, prev.x), maxX),
        y: Math.min(Math.max(10, prev.y), maxY),
      }));
    }
  }, [isOpen]);

  // Auto-close on click outside modal or Escape press
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-bookmarks-toggle="true"]')) return;
      if (modalRef.current && !modalRef.current.contains(target)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Robust pointer-based drag system that captures mouse, pen, and touch seamlessly
  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // Don't initiate drag if clicking buttons or interactive child controls
    if ((e.target as HTMLElement).closest('button, input, select, a')) return;

    isDraggingRef.current = true;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };

    const targetEl = e.currentTarget;
    try {
      targetEl.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if unsupported
    }

    const onPointerMove = (moveEv: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEv.clientX - dragStartRef.current.startX;
      const dy = moveEv.clientY - dragStartRef.current.startY;

      const modalWidth = modalRef.current?.offsetWidth || 480;
      const maxX = Math.max(10, window.innerWidth - modalWidth - 16);
      const maxY = Math.max(10, window.innerHeight - 60);

      const nextX = Math.min(Math.max(10, dragStartRef.current.initialX + dx), maxX);
      const nextY = Math.min(Math.max(10, dragStartRef.current.initialY + dy), maxY);

      setPosition({ x: nextX, y: nextY });
    };

    const onPointerUp = (upEv: PointerEvent) => {
      isDraggingRef.current = false;
      try {
        targetEl.releasePointerCapture(upEv.pointerId);
      } catch {
        // Ignore
      }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Filter and sort bookmarks
  const filteredBookmarks = useMemo(() => {
    let result = [...bookmarks];

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(b => {
        const refStr = `${b.bookName} ${b.chapter}:${b.verseNumber}`.toLowerCase();
        const shortRef = `${b.bookId} ${b.chapter}:${b.verseNumber}`.toLowerCase();
        const textMatch = b.text.toLowerCase().includes(q);
        const transMatch = b.translation.toLowerCase().includes(q);
        return refStr.includes(q) || shortRef.includes(q) || textMatch || transMatch;
      });
    }

    if (testamentFilter !== 'ALL') {
      result = result.filter(b => {
        const idx = getCanonicalBookIndex(b.bookId);
        const isOT = idx < 39;
        return testamentFilter === 'OT' ? isOT : !isOT;
      });
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return b.timestamp - a.timestamp;
      if (sortBy === 'oldest') return a.timestamp - b.timestamp;
      if (sortBy === 'alpha') {
        const bookCompare = a.bookName.localeCompare(b.bookName);
        if (bookCompare !== 0) return bookCompare;
        if (a.chapter !== b.chapter) return a.chapter - b.chapter;
        return a.verseNumber - b.verseNumber;
      }
      if (sortBy === 'canonical') {
        const idxA = getCanonicalBookIndex(a.bookId);
        const idxB = getCanonicalBookIndex(b.bookId);
        if (idxA !== idxB) return idxA - idxB;
        if (a.chapter !== b.chapter) return a.chapter - b.chapter;
        return a.verseNumber - b.verseNumber;
      }
      return 0;
    });

    return result;
  }, [bookmarks, searchQuery, sortBy, testamentFilter]);

  const handleCopy = (b: BookmarkedVerse, e: React.MouseEvent) => {
    e.stopPropagation();
    const formatted = `"${b.text}" — ${b.bookName} ${b.chapter}:${b.verseNumber} (${b.translation})`;
    navigator.clipboard.writeText(formatted);
    setCopiedId(b.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeBookmark(id);
  };

  const handleNavigate = (b: BookmarkedVerse) => {
    onNavigateToPassage(b.bookId, b.chapter, b.verseNumber);
    onClose();
  };

  const formatDate = (timestamp: number) => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  // Do not render anything if modal is closed
  return (
    <AnimatedPresence isVisible={isOpen} duration={250}>
      {(isClosing) => (
    <div
      ref={modalRef}
      className={`fixed z-50 bg-[var(--clean-surface,#FFFFFF)] rounded-2xl flex flex-col overflow-hidden select-auto transition-[max-height] duration-200 ${isClosing ? 'animate-springScaleOut' : 'animate-springScaleIn'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: 'min(490px, calc(100vw - 32px))',
        maxHeight: isMinimized ? 'auto' : 'min(620px, calc(100vh - 90px))',
        border: '1px solid var(--clean-accent-border, #DCD5C9)',
        boxShadow: '0 20px 50px rgba(38, 34, 31, 0.26)',
      }}
    >
      {/* Movable Drag Header */}
      <div
        onPointerDown={handleDragStart}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest('button, input, select, a')) return;
          setIsMinimized(prev => !prev);
        }}
        className="p-3.5 border-b flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
        style={{
          touchAction: 'none',
          backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
          borderBottomColor: 'var(--clean-accent-border, #EBE5DC)',
        }}
        title="Click and drag to move window • Double-click to collapse/expand"
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <GripHorizontal className="w-4 h-4 text-[#A8A29E] shrink-0 hover:text-[var(--clean-accent-caramel,#B4793D)] transition-colors" />
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
            style={{
              backgroundColor: 'var(--clean-surface, #FFFFFF)',
              border: '1px solid var(--clean-accent-border, #D4A373)',
              color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))',
            }}
          >
            <Bookmark
              className="w-3.5 h-3.5"
              style={{
                color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))',
                fill: 'var(--clean-accent-caramel, #B4793D)',
              }}
            />
          </div>
          <h2
            className="font-heading font-bold text-sm truncate"
            style={{ color: 'var(--clean-text-primary, #26221F)' }}
          >
            Bookmarked Verses
          </h2>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold font-heading shrink-0 shadow-2xs"
            style={{
              backgroundColor: 'var(--clean-surface, #FFFFFF)',
              color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))',
              border: '1px solid var(--clean-accent-border, #D4A373)',
            }}
          >
            {bookmarks.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(prev => !prev);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            title={isMinimized ? "Expand window" : "Minimize window"}
            className="p-1.5 rounded-lg hover:bg-[var(--clean-surface,#FFFFFF)] text-[var(--clean-text-secondary,#78716C)] hover:text-[var(--clean-text-primary,#26221F)] transition-colors cursor-pointer"
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            title="Close (Esc)"
            className="p-1.5 rounded-lg hover:bg-[var(--clean-surface,#FFFFFF)] text-[var(--clean-text-secondary,#78716C)] hover:text-[var(--clean-text-primary,#26221F)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Search bar & Filters */}
          <div
            className="p-3 border-b space-y-2.5"
            style={{
              backgroundColor: 'var(--clean-surface, #FFFFFF)',
              borderBottomColor: 'var(--clean-accent-border, #EBE5DC)',
            }}
          >
            {/* Flex Search Row (Icon will never overlap input text) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                borderRadius: '10px',
                border: '1px solid var(--clean-accent-border, #EBE5DC)',
              }}
            >
              <Search
                className="w-4 h-4 shrink-0"
                style={{ color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by reference (e.g. Genesis 8:21) or text..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '12px',
                  color: 'var(--clean-text-primary, #26221F)',
                }}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--clean-text-secondary, #A8A29E)',
                  }}
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills & Sort Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <div
                className="ios-segmented-capsule"
                style={{
                  backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)',
                }}
              >
                <button
                  onClick={() => setTestamentFilter('ALL')}
                  style={
                    testamentFilter === 'ALL'
                      ? {
                          backgroundColor: 'var(--clean-surface, #FFFFFF)',
                          borderColor: 'var(--clean-accent-border-strong, var(--clean-accent-caramel, #B4793D))',
                          color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))',
                          fontWeight: 700,
                        }
                      : { color: 'var(--clean-text-secondary, #57524E)' }
                  }
                  className={`ios-segment-pill !text-[11px] font-heading ${testamentFilter === 'ALL' ? 'active font-bold' : 'font-medium'}`}
                >
                  All ({bookmarks.length})
                </button>
                <button
                  onClick={() => setTestamentFilter('OT')}
                  style={
                    testamentFilter === 'OT'
                      ? {
                          backgroundColor: 'var(--clean-surface, #FFFFFF)',
                          borderColor: 'var(--clean-accent-border-strong, var(--clean-accent-caramel, #B4793D))',
                          color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))',
                          fontWeight: 700,
                        }
                      : { color: 'var(--clean-text-secondary, #57524E)' }
                  }
                  className={`ios-segment-pill !text-[11px] font-heading ${testamentFilter === 'OT' ? 'active font-bold' : 'font-medium'}`}
                >
                  Old Testament
                </button>
                <button
                  onClick={() => setTestamentFilter('NT')}
                  style={
                    testamentFilter === 'NT'
                      ? {
                          backgroundColor: 'var(--clean-surface, #FFFFFF)',
                          borderColor: 'var(--clean-accent-border-strong, var(--clean-accent-caramel, #B4793D))',
                          color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))',
                          fontWeight: 700,
                        }
                      : { color: 'var(--clean-text-secondary, #57524E)' }
                  }
                  className={`ios-segment-pill !text-[11px] font-heading ${testamentFilter === 'NT' ? 'active font-bold' : 'font-medium'}`}
                >
                  New Testament
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--clean-text-secondary, #78716C)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  className="font-heading"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  style={{
                    backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                    border: '1px solid var(--clean-accent-border, #EBE5DC)',
                    color: 'var(--clean-text-primary, #26221F)',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    padding: '3px 8px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                  className="font-heading"
                >
                  <option value="newest">Newest Added</option>
                  <option value="oldest">Oldest Added</option>
                  <option value="canonical">Canonical (Gen → Rev)</option>
                  <option value="alpha">Book Name (A–Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookmarks List */}
          <div
            className="p-3 overflow-y-auto flex-1 custom-scrollbar space-y-2.5"
            style={{ backgroundColor: 'var(--clean-highlight-cream, #FAF9F6)' }}
          >
            {bookmarks.length === 0 ? (
              <div className="text-center py-10 px-4 space-y-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto shadow-xs"
                  style={{
                    backgroundColor: 'var(--clean-surface, #FFFFFF)',
                    border: '1px solid var(--clean-accent-border, #EBE5DC)',
                    color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))',
                  }}
                >
                  <Bookmark
                    className="w-5 h-5"
                    style={{
                      color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))',
                      fill: 'var(--clean-accent-caramel, #B4793D)',
                      fillOpacity: 0.25,
                    }}
                  />
                </div>
                <h3
                  className="font-heading font-bold text-xs sm:text-sm"
                  style={{ color: 'var(--clean-text-primary, #26221F)' }}
                >
                  No Bookmarked Verses Yet
                </h3>
                <p
                  className="text-[11px] max-w-xs mx-auto leading-relaxed"
                  style={{ color: 'var(--clean-text-secondary, #78716C)' }}
                >
                  Click the <span className="font-semibold" style={{ color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' }}>Bookmark</span> icon next to any verse while reading to save it here for fast retrieval.
                </p>
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <div className="text-center py-8 px-4 space-y-2">
                <p
                  className="text-xs font-semibold font-heading"
                  style={{ color: 'var(--clean-text-primary, #26221F)' }}
                >
                  No bookmarks match "{searchQuery}"
                </p>
                <p
                  className="text-[11px]"
                  style={{ color: 'var(--clean-text-secondary, #78716C)' }}
                >
                  Try a different reference or keyword.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    backgroundColor: 'var(--clean-surface, #FFFFFF)',
                    borderColor: 'var(--clean-accent-border, #EBE5DC)',
                    color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))',
                  }}
                  className="mt-1 px-2.5 py-1 border text-[11px] font-semibold font-heading rounded-md hover:opacity-80 transition-colors shadow-xs cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              filteredBookmarks.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleNavigate(b)}
                  style={{
                    backgroundColor: 'var(--clean-surface, #FFFFFF)',
                    borderColor: 'var(--clean-accent-border, #EBE5DC)',
                  }}
                  className="group p-3 rounded-xl border hover:shadow-sm transition-all cursor-pointer relative space-y-1.5"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="font-heading font-bold text-xs sm:text-sm transition-colors"
                        style={{ color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' }}
                      >
                        {b.bookName} {b.chapter}:{b.verseNumber}
                      </span>
                      <span
                        className="px-1.5 py-0.2 text-[9.5px] font-mono font-bold rounded border"
                        style={{
                          backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                          color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #78471F))',
                          borderColor: 'var(--clean-accent-border, #EBE5DC)',
                        }}
                      >
                        {b.translation}
                      </span>
                      {b.timestamp && (
                        <span className="text-[10px]" style={{ color: 'var(--clean-text-secondary, #A8A29E)' }}>
                          • {formatDate(b.timestamp)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleCopy(b, e)}
                        title="Copy verse"
                        className="p-1 rounded-md text-[var(--clean-text-secondary,#78716C)] hover:text-[var(--clean-accent-caramel,#B4793D)] hover:bg-[var(--clean-surface-warm,#FAF5ED)] transition-colors cursor-pointer"
                      >
                        {copiedId === b.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleRemove(b.id, e)}
                        title="Remove bookmark"
                        className="p-1 rounded-md text-[var(--clean-text-secondary,#78716C)] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div
                        className="flex items-center gap-0.5 text-[11px] font-bold pl-1 group-hover:translate-x-0.5 transition-transform font-heading"
                        style={{ color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' }}
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  {/* Card Verse Content */}
                  <p
                    className="font-scripture text-[13px] leading-relaxed border-l-2 pl-2.5 py-0.5 transition-colors line-clamp-3"
                    style={{
                      color: 'var(--clean-text-primary, #38332E)',
                      borderLeftColor: 'var(--clean-accent-border-strong, var(--clean-accent-caramel, #B4793D))',
                    }}
                  >
                    "{b.text}"
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Footer Bar */}
          <div
            className="px-3 py-2 border-t flex items-center justify-between text-[11px] select-none"
            style={{
              borderTopColor: 'var(--clean-accent-border, #EBE5DC)',
              backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
              color: 'var(--clean-text-secondary, #78716C)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold font-heading">
                {filteredBookmarks.length} of {bookmarks.length} {bookmarks.length === 1 ? 'verse' : 'verses'}
              </span>
              {bookmarks.length > 0 && !showClearConfirm && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-red-600 hover:underline font-semibold ml-1 cursor-pointer font-heading"
                >
                  Clear all
                </button>
              )}
              {showClearConfirm && (
                <div className="flex items-center gap-1.5 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  <span className="text-red-700 text-[10px] font-semibold">Clear all?</span>
                  <button
                    onClick={() => {
                      clearAllBookmarks();
                      setShowClearConfirm(false);
                    }}
                    className="px-1.5 py-0.2 bg-red-600 text-white rounded font-bold text-[9.5px] cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-1 text-[var(--clean-text-secondary,#78716C)] hover:text-[var(--clean-text-primary,#26221F)] text-[9.5px] cursor-pointer"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10.5px]" style={{ color: 'var(--clean-text-secondary, #A8A29E)' }}>
              <kbd
                className="px-1.5 py-0.5 rounded border text-[9px] font-mono"
                style={{
                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)',
                  color: 'var(--clean-text-secondary, #78716C)',
                }}
              >
                ⌘B
              </kbd>
              <span className="font-heading font-medium">to toggle</span>
            </div>
          </div>
        </>
      )}
    </div>
      )}
    </AnimatedPresence>
  );
};
