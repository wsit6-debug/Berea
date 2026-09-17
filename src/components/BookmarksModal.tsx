import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Bookmark, Search, X, Trash2, Copy, Check, ArrowRight, ArrowUpDown, GripHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { BookmarkedVerse, useBookmarkedVerses, removeBookmark, clearAllBookmarks, getCanonicalBookIndex } from '../services/bookmarkService';

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
  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed z-50 bg-[#FAF7F2] rounded-2xl flex flex-col overflow-hidden select-auto transition-[max-height] duration-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: 'min(490px, calc(100vw - 32px))',
        maxHeight: isMinimized ? 'auto' : 'min(620px, calc(100vh - 90px))',
        border: '1px solid #DCD5C9',
        boxShadow: '0 20px 50px rgba(38, 34, 31, 0.26)',
      }}
    >
      {/* Movable Drag Header */}
      <div
        onPointerDown={handleDragStart}
        className="p-3.5 border-b border-[#EBE5DC] bg-[#FAF5ED] flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'none' }}
        title="Click and drag to move window"
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <GripHorizontal className="w-4 h-4 text-[#A8A29E] shrink-0 hover:text-[#B4793D] transition-colors" />
          <div className="w-6 h-6 rounded-lg bg-[#FAF7F2] border border-[#D4A373]/30 flex items-center justify-center text-[#B4793D] shrink-0">
            <Bookmark className="w-3.5 h-3.5 fill-[#B4793D]" />
          </div>
          <h2 className="font-heading font-bold text-sm text-[#26221F] truncate">
            Bookmarked Verses
          </h2>
          <span className="px-2 py-0.5 bg-white text-[#B4793D] border border-[#D4A373]/30 rounded-full text-[10px] font-bold shrink-0">
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
            className="p-1.5 rounded-lg hover:bg-white text-[#78716C] hover:text-[#26221F] transition-colors cursor-pointer"
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
            className="p-1.5 rounded-lg hover:bg-white text-[#78716C] hover:text-[#26221F] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Search bar & Filters */}
          <div className="p-3 border-b border-[#EBE5DC] bg-white space-y-2.5">
            {/* Flex Search Row (Icon will never overlap input text) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                backgroundColor: '#FAF7F2',
                borderRadius: '10px',
                border: '1px solid #EBE5DC',
              }}
            >
              <Search className="w-4 h-4 text-[#B4793D] shrink-0" />
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
                  color: '#26221F',
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
                    color: '#A8A29E',
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
              <div className="ios-segmented-capsule">
                <button
                  onClick={() => setTestamentFilter('ALL')}
                  className={`ios-segment-pill !text-[11px] ${testamentFilter === 'ALL' ? 'active' : ''}`}
                >
                  All ({bookmarks.length})
                </button>
                <button
                  onClick={() => setTestamentFilter('OT')}
                  className={`ios-segment-pill !text-[11px] ${testamentFilter === 'OT' ? 'active' : ''}`}
                >
                  Old Testament
                </button>
                <button
                  onClick={() => setTestamentFilter('NT')}
                  className={`ios-segment-pill !text-[11px] ${testamentFilter === 'NT' ? 'active' : ''}`}
                >
                  New Testament
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#78716C',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ArrowUpDown className="w-3 h-3" />
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  style={{
                    backgroundColor: '#FAF7F2',
                    border: '1px solid #EBE5DC',
                    color: '#26221F',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    padding: '3px 8px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
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
          <div className="p-3 overflow-y-auto flex-1 custom-scrollbar space-y-2.5 bg-[#FAF9F6]">
            {bookmarks.length === 0 ? (
              <div className="text-center py-10 px-4 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FAF5ED] border border-[#D4A373]/30 flex items-center justify-center text-[#B4793D] mx-auto shadow-xs">
                  <Bookmark className="w-5 h-5 text-[#B4793D]" />
                </div>
                <h3 className="font-heading font-semibold text-xs sm:text-sm text-[#26221F]">
                  No Bookmarked Verses Yet
                </h3>
                <p className="text-[11px] text-[#78716C] max-w-xs mx-auto leading-relaxed">
                  Click the <span className="font-semibold text-[#B4793D]">Bookmark</span> icon next to any verse while reading to save it here for fast retrieval.
                </p>
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <div className="text-center py-8 px-4 space-y-2">
                <p className="text-xs font-semibold text-[#26221F]">No bookmarks match "{searchQuery}"</p>
                <p className="text-[11px] text-[#78716C]">Try a different reference or keyword.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-1 px-2.5 py-1 bg-white border border-[#EBE5DC] text-[#B4793D] text-[11px] font-semibold rounded-md hover:border-[#D4A373] transition-colors shadow-xs cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              filteredBookmarks.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleNavigate(b)}
                  className="group p-3 bg-white rounded-xl border border-[#EBE5DC] hover:border-[#D4A373] hover:shadow-sm transition-all cursor-pointer relative space-y-1.5"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-heading font-bold text-xs sm:text-sm text-[#B4793D] group-hover:text-[#9A632E] transition-colors">
                        {b.bookName} {b.chapter}:{b.verseNumber}
                      </span>
                      <span className="px-1.5 py-0.2 text-[9.5px] font-mono font-bold bg-[#FAF5ED] text-[#78471F] border border-[#D4A373]/30 rounded">
                        {b.translation}
                      </span>
                      {b.timestamp && (
                        <span className="text-[10px] text-[#A8A29E]">
                          • {formatDate(b.timestamp)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleCopy(b, e)}
                        title="Copy verse"
                        className="p-1 rounded-md text-[#78716C] hover:text-[#26221F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
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
                        className="p-1 rounded-md text-[#78716C] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center gap-0.5 text-[11px] font-semibold text-[#B4793D] pl-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  {/* Card Verse Content */}
                  <p className="font-scripture text-[13px] leading-relaxed text-[#38332E] border-l-2 border-[#EBE5DC] group-hover:border-[#B4793D] pl-2.5 py-0.5 transition-colors line-clamp-3">
                    "{b.text}"
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-3 py-2 border-t border-[#EBE5DC] bg-[#FAF7F2] flex items-center justify-between text-[11px] text-[#78716C] select-none">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {filteredBookmarks.length} of {bookmarks.length} {bookmarks.length === 1 ? 'verse' : 'verses'}
              </span>
              {bookmarks.length > 0 && !showClearConfirm && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-red-600 hover:underline font-medium ml-1 cursor-pointer"
                >
                  Clear all
                </button>
              )}
              {showClearConfirm && (
                <div className="flex items-center gap-1.5 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  <span className="text-red-700 text-[10px] font-medium">Clear all?</span>
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
                    className="px-1 text-[#78716C] hover:text-[#26221F] text-[9.5px] cursor-pointer"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10.5px] text-[#A8A29E]">
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#EBE5DC] text-[9px] font-mono">⌘B</kbd>
              <span>to toggle</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
