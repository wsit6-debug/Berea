import React, { useState } from 'react';
import { X, Download, CheckCircle2, Lock, Globe, HardDrive, ShieldCheck, AlertCircle, FileText } from 'lucide-react';
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

  // Group translations
  const offlineReadyList = TRANSLATIONS.filter(t =>
    BUNDLED_OFFLINE_TRANSLATIONS.has(t.apiCode.toUpperCase())
  );

  const proprietaryList = TRANSLATIONS.filter(t =>
    !BUNDLED_OFFLINE_TRANSLATIONS.has(t.apiCode.toUpperCase())
  );

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
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-md ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              borderRadius: '24px',
              borderColor: 'var(--clean-accent-border, #EBE5DC)',
              backgroundColor: 'var(--clean-surface, #FFFFFF)',
              color: 'var(--clean-text-primary, #26221F)'
            }}
            className={`border rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden max-h-[88vh] isolate ${isClosing ? 'animate-springScaleOut' : 'animate-springScaleIn'}`}
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
                    Licensing compliance & local offline database management
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

            {/* Modal Body */}
            <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6">
              {/* Compliance Overview Notice */}
              <div
                style={{
                  backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)',
                  borderLeftWidth: '4px',
                  borderLeftColor: 'var(--clean-accent-border-strong, #B4793D)'
                }}
                className="p-4 rounded-xl border space-y-1.5 shadow-2xs text-xs"
              >
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10.5px] text-[var(--clean-accent-dark,#8C5E2E)]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--clean-accent-caramel,#B4793D)]" />
                  100% Licensing Compliance Standard
                </div>
                <p className="text-[var(--clean-text-secondary,#57524E)] leading-relaxed">
                  Berea guarantees full legal compliance with international copyright law and YouVersion/publisher API terms. Full-text offline downloads are restricted exclusively to <strong>Public Domain</strong> and <strong>CC0</strong> translations. Proprietary commercial translations are protected and queried on-demand.
                </p>
              </div>

              {/* Section 1: Offline Ready & Free to Download */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Offline Ready Translations ({offlineReadyList.length})
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Public Domain & CC0
                  </span>
                </div>

                <div className="space-y-2">
                  {offlineReadyList.map((t) => {
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
                        className="p-3 rounded-xl border flex items-center justify-between gap-3 shadow-2xs transition-all hover:border-[var(--clean-accent-caramel,#B4793D)]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: color.primary }}
                            />
                            <span className="font-bold text-xs">{t.id}</span>
                            <span className="text-[10px] text-[var(--clean-text-secondary,#78716C)] font-mono">
                              ({t.year})
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {t.id === 'BSB' ? 'CC0 Free' : 'Public Domain'}
                            </span>
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
                              Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(t)}
                            disabled={isDownloading}
                            className={`text-[10.5px] px-3 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
                              isSuccess
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : 'bg-[var(--clean-accent-caramel,#B4793D)] text-white hover:bg-[var(--clean-accent-dark,#78471F)] border-[var(--clean-accent-dark,#8C5E2E)]'
                            }`}
                            title={`Download full ${t.id} JSON dataset`}
                          >
                            <Download className="w-3 h-3" />
                            {isDownloading ? 'Exporting...' : isSuccess ? 'Saved!' : 'Download JSON'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Online-Only Proprietary Translations */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-600" />
                    Online Exegetical Study Only ({proprietaryList.length})
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Publisher Protected
                  </span>
                </div>

                <div className="space-y-2">
                  {proprietaryList.map((t) => {
                    const isSelected = activeTranslation === t.id;
                    const color = getTranslationColor(t.id);

                    return (
                      <div
                        key={t.id}
                        style={{
                          backgroundColor: isSelected ? 'var(--clean-highlight-cream, #FAF3E8)' : 'var(--clean-surface, #FFFFFF)',
                          borderColor: isSelected ? 'var(--clean-accent-border-strong, #B4793D)' : 'var(--clean-accent-border, #EBE5DC)'
                        }}
                        className="p-3 rounded-xl border flex items-center justify-between gap-3 shadow-2xs opacity-85 hover:opacity-100 transition-opacity"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: color.primary }}
                            />
                            <span className="font-bold text-xs">{t.id}</span>
                            <span className="text-[10px] text-[var(--clean-text-secondary,#78716C)] font-mono">
                              ({t.year})
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-amber-50 text-amber-800 border border-amber-200">
                              Publisher Copyright
                            </span>
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
                              Read Online
                            </button>
                          )}
                          <div
                            className="text-[10px] px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 font-medium flex items-center gap-1 select-none"
                            title="Publisher terms prohibit bulk offline downloads. Queried dynamically online for personal study."
                          >
                            <Lock className="w-2.5 h-2.5" />
                            Online Only
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedPresence>
  );
};
