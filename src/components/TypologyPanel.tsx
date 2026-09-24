import React, { useState, useEffect, useRef } from 'react';
import { Network, Search, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { generateTypologyTracker } from '../services/aiService';
import { TypologyMotif } from '../types';

interface TypologyPanelProps {
  currentBook: string;
  currentChapter: number;
  chapterText: string;
}

const LOADING_PHASES = [
  'Detecting symbolic motifs and covenant themes...',
  'Tracing Old Testament types & shadowy promises...',
  'Unfolding Christological climax in the Gospels...',
  'Mapping canonical trajectory to New Creation...'
];

const TypologyPanel: React.FC<TypologyPanelProps> = ({ currentBook, currentChapter, chapterText }) => {
  const [motifData, setMotifData] = useState<TypologyMotif | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [progressPercent, setProgressPercent] = useState(15);
  const [loadingPhaseMessage, setLoadingPhaseMessage] = useState(LOADING_PHASES[0]);
  const [error, setError] = useState<string | null>(null);
  const phaseTimerRef = useRef<number | null>(null);

  // Automatically load typology whenever book or chapter changes
  useEffect(() => {
    let isMounted = true;
    setError(null);
    setIsLoading(true);
    setProgress('');
    setProgressPercent(35);

    generateTypologyTracker(
      `${currentBook} ${currentChapter}`,
      chapterText,
      (p) => {
        if (!isMounted) return;
        if (p.text) setProgress(p.text);
        if (typeof p.progress === 'number' && p.progress > 0) {
          const pct = p.progress <= 1 ? p.progress * 100 : p.progress;
          setProgressPercent(Math.min(100, Math.round(pct)));
        }
      }
    )
      .then((data) => {
        if (!isMounted) return;
        setProgressPercent(100);
        setMotifData(data);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to analyze typology.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentBook, currentChapter]);

  const handleGenerate = async (cycle: boolean = false) => {
    setIsLoading(true);
    setError(null);
    setProgress('');
    setProgressPercent(35);
    try {
      const data = await generateTypologyTracker(
        `${currentBook} ${currentChapter}`,
        chapterText,
        (p) => {
          if (p.text) setProgress(p.text);
          if (typeof p.progress === 'number' && p.progress > 0) {
            const pct = p.progress <= 1 ? p.progress * 100 : p.progress;
            setProgressPercent(Math.min(100, Math.round(pct)));
          }
        },
        cycle ? motifData?.motif : undefined
      );
      setProgressPercent(100);
      setMotifData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze typology.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF7F2] p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-[#26221F] flex items-center gap-2">
          <Network className="w-4 h-4 text-[#B4793D]" />
          Typology & Motif Tracker
        </h2>
      </div>

      {!motifData && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#EBE5DC] flex items-center justify-center mb-2">
            <Search className="w-6 h-6 text-[#B4793D]" />
          </div>
          <p className="text-xs text-[#78716C] max-w-[200px]">
            Discover the deep theological themes and motifs woven throughout the biblical narrative starting from {currentBook} {currentChapter}.
          </p>
          <button 
            onClick={() => handleGenerate(false)}
            className="clean-caramel-btn text-xs font-semibold px-4 py-2"
          >
            Trace Biblical Motif
          </button>
        </div>
      )}

      {isLoading && (
        <div className="space-y-5 py-2 animate-fadeIn">
          {/* Glowing Emblem & Progress Header */}
          <div className="text-center space-y-3">
            <div className="relative inline-flex items-center justify-center">
              {/* Outer pulsing glow */}
              <div className="absolute w-16 h-16 rounded-full bg-[#B4793D]/15 animate-ping opacity-60" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FAF5ED] to-white border border-[#EBE5DC] shadow-sm flex items-center justify-center">
                <Network className="w-6 h-6 text-[#B4793D] animate-pulse" />
                <Sparkles className="w-3 h-3 text-[#D4A373] absolute top-2 right-2 animate-bounce" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[#26221F] uppercase tracking-wider">
                Weaving Canonical Tapestry
              </h3>
              <p className="text-[11px] text-[#78716C] font-medium h-4 transition-all duration-300">
                {progress || loadingPhaseMessage}
              </p>
            </div>

            {/* Smooth Progress Bar */}
            <div className="max-w-xs mx-auto px-4">
              <div className="w-full bg-[#EBE5DC] rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-[#D4A373] via-[#B4793D] to-[#8C5824] transition-all duration-500 ease-out"
                  style={{ width: `${Math.max(12, Math.min(progressPercent, 95))}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[9.5px] text-[#A8A29E] mt-1 font-mono">
                <span>{currentBook} {currentChapter}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
            </div>
          </div>

          {/* Shimmering Canonical Era Skeleton Timeline */}
          <div className="relative border-l-2 border-[#EBE5DC]/80 ml-4 pl-4 space-y-3.5">
            {[
              { era: 'Creation & Patriarchs', label: 'Archetype & Promise' },
              { era: 'Gospels & Passion', label: 'Christological Fulfillment' },
              { era: 'Revelation & Consummation', label: 'Eternal Realization' }
            ].map((skeleton, idx) => (
              <div key={idx} className="relative animate-pulse" style={{ animationDelay: `${idx * 200}ms` }}>
                {/* Node indicator */}
                <div className="absolute -left-[22px] top-2 w-3 h-3 rounded-full bg-[#EBE5DC] border-2 border-[#FAF7F2] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B4793D]/60 animate-ping" />
                </div>

                <div className="bg-white/70 border border-[#EBE5DC] rounded-xl p-3 shadow-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9.5px] font-bold text-[#B4793D]/70 uppercase tracking-wider">
                      {skeleton.era}
                    </span>
                    <span className="h-3 w-16 bg-[#F5EFE6] rounded text-[8.5px] inline-block font-mono" />
                  </div>
                  <div className="h-3 w-3/4 bg-[#EBE5DC] rounded" />
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-[#F5EFE6] rounded" />
                    <div className="h-2 w-5/6 bg-[#F5EFE6] rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Theological Quote Banner */}
          <div className="bg-[#FAF5ED] border border-[#EBE5DC] rounded-xl p-3 text-center space-y-1">
            <p className="text-[10.5px] text-[#57524E] font-serif italic">
              "Novum Testamentum in Vetere latet, Vetus in Novo patet."
            </p>
            <p className="text-[9px] text-[#A8A29E] uppercase tracking-wider font-semibold">
              The New is in the Old concealed; the Old is in the New revealed — St. Augustine
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center">
          {error}
        </div>
      )}

      {motifData && !isLoading && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center space-y-2 pb-4 border-b border-[#EBE5DC]">
            <h3 className="text-xl font-black text-[#26221F] font-serif uppercase tracking-widest">{motifData.motif}</h3>
            <p className="text-xs text-[#78716C] leading-relaxed max-w-sm mx-auto">{motifData.summary}</p>
          </div>

          <div className="relative border-l-2 border-[#EBE5DC] ml-3 pl-4 space-y-6">
            {motifData.nodes.map((node, i) => (
              <div key={i} className="relative">
                {/* Node indicator */}
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#B4793D] border-2 border-[#FAF7F2]" />
                
                <div className="bg-white border border-[#EBE5DC] rounded-xl p-3 shadow-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-[#B4793D] uppercase tracking-wider">{node.era}</span>
                    <span className="text-[9px] font-mono text-[#78716C] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#EBE5DC]">{node.reference}</span>
                  </div>
                  <div className="font-semibold text-xs text-[#26221F] mb-1">{node.event}</div>
                  <p className="text-[11px] text-[#57524E] leading-relaxed italic">
                    {node.significance}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-2">
             <button onClick={() => handleGenerate(true)} className="text-[10px] text-[#B4793D] hover:underline font-medium uppercase tracking-wider">
               Explore Alternate Motif
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypologyPanel;
