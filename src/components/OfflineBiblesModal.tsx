import React, { useState, useMemo } from 'react';
import { X, Download, CheckCircle2, Lock, Globe, HardDrive, ShieldCheck, Search } from 'lucide-react';
import { AnimatedPresence } from './AnimatedPresence';
import { TRANSLATIONS, TranslationInfo, getTranslationColor } from '../data/bibleData';
import { BUNDLED_OFFLINE_TRANSLATIONS } from '../services/youversionService';

interface OfflineBiblesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTranslation?: string;
  onSelectTranslation?: (id: string) => void;
}

export const OfflineBiblesModal: React.FC<OfflineBiblesModalProps> = ({
  isOpen,
  onClose,
  activeTranslation,
  onSelectTranslation
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'offline' | 'online'>('all');

  // Filter translations
  const filteredTranslations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TRANSLATIONS.filter(t => {
      const isOffline = BUNDLED_OFFLINE_TRANSLATIONS.has(t.apiCode.toUpperCase());
      if (filterTab === 'offline' && !isOffline) return false;
      if (filterTab === 'online' && isOffline) return false;

      if (!q) return true;
      return (
        t.id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.apiCode.toLowerCase().includes(q) ||
        (t.year && t.year.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, filterTab]);

  const offlineReadyCount = useMemo(() => 
    TRANSLATIONS.filter(t => BUNDLED_OFFLINE_TRANSLATIONS.has(t.apiCode.toUpperCase())).length
  , []);

  const onlineOnlyCount = TRANSLATIONS.length - offlineReadyCount;

  const handleDownload = (t: TranslationInfo) => {
    setDownloadingId(t.id);
    const link = document.createElement('a');
    link.href = `/bibles/${t.apiCode}.json`;
    link.download = `${t.id}_${t.apiCode}_Bible.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadingId(null);
      setDownloadSuccessId(t.id);
      setTimeout(() => setDownloadSuccessId(null), 3000);
    }, 600);
  };

  return (
    <AnimatedPresence isVisible={isOpen} duration={250}>
      {(isClosing) => (
        <div
          onClick={onClose}
          style={{ overflowY: 'auto' }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-md ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              borderRadius: '24px',
              borderColor: 'var(--clean-accent-border, #EBE5DC)',
              backgroundColor: 'var(--clean-surface, #FFFFFF)',
              color: 'var(--clean-text-primary, #26221F)',
              maxHeight: 'min(86vh, 760px)',
              height: '86vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            className={`border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden isolate ${isClosing ? 'animate-springScaleOut' : 'animate-springScaleIn'}`}
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                borderBottomColor: 'var(--clean-accent-border, #EBE5DC)'
              }}
              className="p-4 sm:p-5 border-b flex items-center justify-between flex-shrink-0 rounded-t-3xl"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--clean-highlight-cream,#FAF3E8)] border border-[var(--clean-accent-border,#EBE5DC)] flex items-center justify-center text-[var(--clean-accent-caramel,#B4793D)] shadow-2xs">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    Offline Bibles & Downloads
                  </h3>
                  <p className="text-[11px] text-[var(--clean-text-secondary,#78716C)]">
                    Licensing compliance & offline database management
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="ios-icon-btn !w-7 !h-7 text-[var(--clean-text-secondary,#78716C)] hover:text-[var(--clean-text-primary,#26221F)]"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-header: Search & Segmented Filter Tabs */}
            <div
              style={{
                backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                borderBottomColor: 'var(--clean-accent-border, #EBE5DC)'
              }}
              className="p-3 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0"
            >
              {/* Search input */}
              <div
                style={{
                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)'
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border flex-1 shadow-2xs"
              >
                <Search className="w-3.5 h-3.5 text-[var(--clean-text-secondary,#A8A29E)] shrink-0" />
                <input
                  type="text"
                  placeholder="Filter by code, name, or year..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-transparent border-none outline-none text-[var(--clean-text-primary,#26221F)] placeholder:text-[var(--clean-text-secondary,#A8A29E)]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[10px] text-[var(--clean-text-secondary,#78716C)] hover:text-[var(--clean-text-primary,#26221F)] p-0.5"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Segmented filter tabs */}
              <div
                style={{
                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)'
                }}
                className="inline-flex items-center p-0.5 rounded-xl border shadow-2xs shrink-0 self-start sm:self-auto"
              >
                <button
                  onClick={() => setFilterTab('all')}
                  className={`text-[10.5px] px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    filterTab === 'all'
                      ? 'bg-[var(--clean-highlight-cream,#FAF3E8)] text-[var(--clean-accent-dark,#78471F)] shadow-2xs'
                      : 'text-[var(--clean-text-secondary,#78716C)] hover:text-[var(--clean-text-primary,#26221F)]'
                  }`}
                >
                  All ({TRANSLATIONS.length})
                </button>
                <button
                  onClick={() => setFilterTab('offline')}
                  className={`text-[10.5px] px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    filterTab === 'offline'
                      ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'text-[var(--clean-text-secondary,#78716C)] hover:text-[var(--clean-text-primary,#26221F)]'
                  }`}
                >
                  Offline ({offlineReadyCount})
                </button>
                <button
                  onClick={() => setFilterTab('online')}
                  className={`text-[10.5px] px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    filterTab === 'online'
                      ? 'bg-amber-50 text-amber-800 shadow-2xs'
                      : 'text-[var(--clean-text-secondary,#78716C)] hover:text-[var(--clean-text-primary,#26221F)]'
                  }`}
                >
                  Online Only ({onlineOnlyCount})
                </button>
              </div>
            </div>

            {/* Scrollable Modal Body */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch'
              }}
              className="overscroll-contain custom-scrollbar p-4 sm:p-6 space-y-4 select-text"
            >
              {/* Compliance Overview Notice */}
              <div
                style={{
                  backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)',
                  borderLeftWidth: '4px',
                  borderLeftColor: 'var(--clean-accent-border-strong, #B4793D)'
                }}
                className="p-3.5 rounded-xl border space-y-1 shadow-2xs text-xs"
              >
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10.5px] text-[var(--clean-accent-dark,#8C5E2E)]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--clean-accent-caramel,#B4793D)]" />
                  100% Licensing Compliance Standard
                </div>
                <p className="text-[var(--clean-text-secondary,#57524E)] leading-relaxed text-[11.5px]">
                  Berea guarantees full legal compliance with international copyright law and publisher API agreements. Full-text offline database downloads are permitted exclusively for <strong>Public Domain</strong> and <strong>CC0</strong> translations. Proprietary translations are protected by publisher copyright and queried live on-demand for personal study.
                </p>
              </div>

              {/* Translation Cards List */}
              <div className="space-y-2">
                {filteredTranslations.length === 0 ? (
                  <div className="text-center py-10 text-xs text-[var(--clean-text-secondary,#78716C)]">
                    No translations match your search.
                  </div>
                ) : (
                  filteredTranslations.map((t) => {
                    const isOffline = BUNDLED_OFFLINE_TRANSLATIONS.has(t.apiCode.toUpperCase());
                    const isSelected = activeTranslation === t.id;
                    const color = getTranslationColor(t.id);
                    const isSuccess = downloadSuccessId === t.id;
                    const isDownloading = downloadingId === t.id;

                    return (
                      <div
                        key={t.id}
                        style={{
                          backgroundColor: isSelected ? 'var(--clean-highlight-cream, #FAF3E8)' : 'var(--clean-surface, #FFFFFF)',
                          borderColor: isSelected ? 'var(--clean-accent-border-strong, #B4793D)' : 'var(--clean-accent-border, #EBE5DC)'
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 shadow-2xs transition-all hover:border-[var(--clean-accent-caramel,#B4793D)] ${
                          !isOffline ? 'opacity-90 hover:opacity-100' : ''
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: color.primary }}
                            />
                            <span className="font-bold text-xs">{t.id}</span>
                            {t.year && (
                              <span className="text-[10px] text-[var(--clean-text-secondary,#78716C)] font-mono">
                                ({t.year})
                              </span>
                            )}
                            {isOffline ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {t.id === 'BSB' ? 'CC0 Free' : 'Public Domain'}
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                Publisher Copyright
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--clean-text-secondary,#57524E)] truncate mt-0.5">
                            {t.name}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {onSelectTranslation && !isSelected && (
                            <button
                              onClick={() => {
                                onSelectTranslation(t.id);
                                onClose();
                              }}
                              className="text-[10.5px] px-2.5 py-1 rounded-lg border border-[var(--clean-accent-border,#EBE5DC)] bg-white hover:bg-[var(--clean-surface-warm,#FAF5ED)] font-medium transition-colors"
                            >
                              {isOffline ? 'Read' : 'Read Online'}
                            </button>
                          )}

                          {isOffline ? (
                            <button
                              onClick={() => handleDownload(t)}
                              disabled={isDownloading}
                              className={`text-[10.5px] px-3 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                                isSuccess
                                  ? 'bg-emerald-600 text-white border-emerald-700'
                                  : 'bg-[var(--clean-accent-caramel,#B4793D)] text-white hover:bg-[var(--clean-accent-dark,#78471F)] border-[var(--clean-accent-dark,#8C5E2E)]'
                              }`}
                              title={`Download full ${t.id} JSON dataset for offline storage`}
                            >
                              <Download className="w-3 h-3" />
                              {isDownloading ? 'Exporting...' : isSuccess ? 'Saved!' : 'Download JSON'}
                            </button>
                          ) : (
                            <div
                              className="text-[10px] px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 font-medium flex items-center gap-1 select-none"
                              title="Publisher copyright strictly prohibits bulk database harvesting. Queried per-chapter for personal study."
                            >
                              <Lock className="w-2.5 h-2.5 text-amber-600" />
                              Online Only
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedPresence>
  );
};
