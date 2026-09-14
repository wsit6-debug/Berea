import React, { useState } from 'react';
import { BIBLE_BOOKS, BibleBook } from '../data/bibleData';
import { Search, Book, X } from 'lucide-react';

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

  if (!isOpen) return null;

  const filteredBooks = BIBLE_BOOKS.filter(b => {
    const matchesTestament = activeTestament === 'ALL' || b.testament === activeTestament;
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.theme.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTestament && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xl animate-fadeIn select-none">
      <div className="bg-white border border-[#EBE5DC] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_20px_50px_rgba(180,160,140,0.2)] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#FAF7F2] border-b border-[#EBE5DC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#B4793D] to-[#8C5E32] flex items-center justify-center text-white shadow-xs">
              <Book className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-heading text-sm font-semibold text-[#26221F]">Select Scripture Passage</h3>
          </div>
          <button
            onClick={onClose}
            className="ios-icon-btn !w-6 !h-6"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-3 bg-white border-b border-[#EBE5DC] flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#B4793D] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search books, categories, themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF5ED] focus:bg-white focus:border-[#D4A373] border border-[#EBE5DC] rounded-full pl-8 pr-3 py-1.5 text-xs text-[#26221F] placeholder-[#A8A29E] focus:outline-none transition-colors"
            />
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
        <div className="flex-1 overflow-hidden grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#EBE5DC]">
          {/* Books List */}
          <div className="overflow-y-auto p-3 space-y-1.5 max-h-[340px] sm:max-h-[420px] custom-scrollbar">
            <div className="grid grid-cols-2 gap-1.5">
              {filteredBooks.map((book) => {
                const isSelected = selectedBook.id === book.id;
                return (
                  <button
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className={`text-left p-2.5 rounded-xl text-xs transition-all flex flex-col justify-between border ${
                      isSelected
                        ? 'bg-[#FAF3E8] border-[#B4793D] text-[#78471F] font-semibold shadow-xs ring-1 ring-[#B4793D]/30'
                        : 'bg-white border-[#EBE5DC] text-[#26221F] hover:bg-[#FAF5ED]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-xs">{book.name}</span>
                      <span className={`text-[9.5px] ${isSelected ? 'text-[#B4793D]' : 'text-[#A8A29E]'}`}>{book.testament}</span>
                    </div>
                    <span className={`text-[9.5px] truncate mt-0.5 ${isSelected ? 'text-[#B4793D]' : 'text-[#A8A29E]'}`}>{book.category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapter Selector */}
          <div className="overflow-y-auto p-4 space-y-3 max-h-[340px] sm:max-h-[420px] custom-scrollbar bg-[#FAF7F2]">
            <div>
              <div className="flex items-baseline justify-between">
                <h4 className="text-sm font-heading font-bold text-[#26221F]">{selectedBook.name}</h4>
                <span className="text-[11px] text-[#78716C]">{selectedBook.author} • {selectedBook.chaptersCount} Ch</span>
              </div>
              <p className="text-xs text-[#78716C] mt-0.5 italic line-clamp-2">
                "{selectedBook.theme}"
              </p>
            </div>

            <div className="pt-2 border-t border-[#EBE5DC]">
              <span className="text-[10px] font-bold text-[#B4793D] uppercase tracking-wider block mb-2">
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
                      className={isCurrent ? 'clean-caramel-btn !py-1 text-xs shadow-xs' : 'ios-glass-btn !py-1 text-xs hover:border-[#D4A373]'}
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
  );
};
