import React, { useState } from 'react';
import { BIBLE_BOOKS, BibleBook } from '../data/bibleData';
import { Search, Book, X } from 'lucide-react';
import { AnimatedPresence } from './AnimatedPresence';

interface BookSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBookId: string;
  currentChapterNum: number;
  onSelectPassage: (bookId: string, chapterNum: number) => void;
}

export const BookSelectorModal: React.FC<BookSelectorModalProps> = ({
  isOpen,
  onClose,
  currentBookId,
  currentChapterNum,
  onSelectPassage
}) => {
  const [activeTestament, setActiveTestament] = useState<'ALL' | 'OT' | 'NT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<BibleBook>(
    BIBLE_BOOKS.find(b => b.id === currentBookId) || BIBLE_BOOKS[0]
  );

  const filteredBooks = BIBLE_BOOKS.filter(b => {
    const matchesTestament = activeTestament === 'ALL' || b.testament === activeTestament;
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.theme.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTestament && matchesSearch;
  });

  return (
    <AnimatedPresence isVisible={isOpen} duration={250}>
      {(isClosing) => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl select-none ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
      <div 
        style={{
          backgroundColor: 'var(--clean-surface, #FFFFFF)',
          borderColor: 'var(--clean-accent-border, #EBE5DC)',
          color: 'var(--clean-text-primary, #26221F)'
        }}
        className={`border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden ${isClosing ? 'animate-springScaleOut' : 'animate-springScaleIn'}`}
      >
        {/* Header */}
        <div 
          style={{
            backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
            borderBottomColor: 'var(--clean-accent-border, #EBE5DC)'
          }}
          className="p-4 border-b flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div 
              style={{
                backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
                color: 'var(--clean-accent-contrast-text, #FFFFFF)'
              }}
              className="w-6 h-6 rounded-md flex items-center justify-center shadow-xs"
            >
              <Book className="w-3.5 h-3.5" />
            </div>
            <h3 
              style={{ color: 'var(--clean-text-primary, #26221F)' }}
              className="font-heading text-sm font-semibold"
            >
              Select Scripture Passage
            </h3>
          </div>
          <button
            onClick={onClose}
            className="ios-icon-btn !w-6 !h-6 text-[var(--clean-text-secondary,#78716C)] hover:text-[var(--clean-text-primary,#26221F)]"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div 
          style={{
            backgroundColor: 'var(--clean-surface, #FFFFFF)',
            borderBottomColor: 'var(--clean-accent-border, #EBE5DC)'
          }}
          className="p-3 border-b flex flex-col sm:flex-row gap-2"
        >
          {/* Search */}
          <div 
            className="flex-1 flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors focus-within:ring-1 focus-within:ring-[var(--clean-accent-caramel,#B4793D)]/40 shadow-2xs"
            style={{
              backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
              borderColor: 'var(--clean-accent-border, #EBE5DC)'
            }}
          >
            <Search 
              className="w-3.5 h-3.5 shrink-0" 
              style={{ color: 'var(--clean-accent-caramel, #B4793D)' }}
            />
            <input
              type="text"
              placeholder="Search books, categories, themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                color: 'var(--clean-text-primary, #26221F)',
                border: 'none',
                outline: 'none',
                boxShadow: 'none'
              }}
              className="flex-1 bg-transparent text-xs placeholder-[var(--clean-text-secondary,#A8A29E)] focus:outline-none min-w-0 border-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[11px] text-stone-400 hover:text-stone-700 px-1 cursor-pointer select-none"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Testament Toggle */}
          <div className="ios-segmented-capsule">
            <button
              onClick={() => setActiveTestament('ALL')}
              className={`ios-segment-pill ${activeTestament === 'ALL' ? 'active' : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTestament('OT')}
              className={`ios-segment-pill ${activeTestament === 'OT' ? 'active' : ''}`}
            >
              Old Testament
            </button>
            <button
              onClick={() => setActiveTestament('NT')}
              className={`ios-segment-pill ${activeTestament === 'NT' ? 'active' : ''}`}
            >
              New Testament
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div 
          style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
          className="flex-1 overflow-hidden grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x"
        >
          {/* Books List */}
          <div 
            style={{ backgroundColor: 'var(--clean-surface, #FFFFFF)' }}
            className="overflow-y-auto p-3 space-y-1.5 max-h-[340px] sm:max-h-[420px] custom-scrollbar"
          >
            <div className="grid grid-cols-2 gap-1.5">
              {filteredBooks.map((book) => {
                const isSelected = selectedBook.id === book.id;
                return (
                  <button
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    style={{
                      backgroundColor: isSelected ? 'var(--clean-highlight-cream, #FAF3E8)' : 'var(--clean-surface, #FFFFFF)',
                      borderColor: isSelected ? 'var(--clean-accent-border-strong, #B4793D)' : 'var(--clean-accent-border, #EBE5DC)',
                      color: 'var(--clean-text-primary, #26221F)'
                    }}
                    className={`text-left p-2.5 rounded-xl text-xs transition-all flex flex-col justify-between border ${
                      isSelected ? 'font-semibold shadow-xs ring-1 ring-[var(--clean-accent-border-strong,#B4793D)]/30' : 'hover:bg-[var(--clean-highlight-cream,#FAF5ED)]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-xs">{book.name}</span>
                      <span 
                        style={{ color: isSelected ? 'var(--clean-accent-dark, #B4793D)' : 'var(--clean-text-secondary, #A8A29E)' }}
                        className="text-[9.5px]"
                      >
                        {book.testament}
                      </span>
                    </div>
                    <span 
                      style={{ color: isSelected ? 'var(--clean-accent-dark, #B4793D)' : 'var(--clean-text-secondary, #A8A29E)' }}
                      className="text-[9.5px] truncate mt-0.5"
                    >
                      {book.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapter Selector */}
          <div 
            style={{ backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)' }}
            className="overflow-y-auto p-4 space-y-3 max-h-[340px] sm:max-h-[420px] custom-scrollbar"
          >
            <div>
              <div className="flex items-baseline justify-between">
                <h4 
                  style={{ color: 'var(--clean-text-primary, #26221F)' }}
                  className="text-sm font-heading font-bold"
                >
                  {selectedBook.name}
                </h4>
                <span 
                  style={{ color: 'var(--clean-text-secondary, #78716C)' }}
                  className="text-[11px]"
                >
                  {selectedBook.author} • {selectedBook.chaptersCount} Ch
                </span>
              </div>
              <p 
                style={{ color: 'var(--clean-text-secondary, #78716C)' }}
                className="text-xs mt-0.5 italic line-clamp-2"
              >
                "{selectedBook.theme}"
              </p>
            </div>

            <div 
              style={{ borderTopColor: 'var(--clean-accent-border, #EBE5DC)' }}
              className="pt-2 border-t"
            >
              <span 
                style={{ color: 'var(--clean-accent-dark, #B4793D)' }}
                className="text-[10px] font-bold uppercase tracking-wider block mb-2"
              >
                Select Chapter (1 – {selectedBook.chaptersCount})
              </span>
              <div className="grid grid-cols-6 sm:grid-cols-5 gap-1.5">
                {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((chNum) => {
                  const isCurrent = selectedBook.id === currentBookId && currentChapterNum === chNum;
                  return (
                    <button
                      key={chNum}
                      onClick={() => {
                        onSelectPassage(selectedBook.id, chNum);
                        onClose();
                      }}
                      style={isCurrent ? {
                        backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
                        borderColor: 'var(--clean-accent-border-strong, #B4793D)',
                        color: 'var(--clean-accent-contrast-text, #FFFFFF)'
                      } : {
                        backgroundColor: 'var(--clean-surface, #FFFFFF)',
                        borderColor: 'var(--clean-accent-border, #EBE5DC)',
                        color: 'var(--clean-text-primary, #26221F)'
                      }}
                      className="ios-glass-btn !py-1 text-xs transition-all shadow-xs"
                    >
                      {chNum}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      )}
    </AnimatedPresence>
  );
};
