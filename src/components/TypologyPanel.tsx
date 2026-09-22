import React, { useState, useEffect } from 'react';
import { Network, Search, Loader2 } from 'lucide-react';
import { generateTypologyTracker } from '../services/aiService';
import { TypologyMotif } from '../types';

interface TypologyPanelProps {
  currentBook: string;
  currentChapter: number;
  chapterText: string;
}

const TypologyPanel: React.FC<TypologyPanelProps> = ({ currentBook, currentChapter, chapterText }) => {
  const [motifData, setMotifData] = useState<TypologyMotif | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset when chapter changes
    setMotifData(null);
    setError(null);
  }, [currentBook, currentChapter]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateTypologyTracker(`${currentBook} ${currentChapter}`, chapterText, (p) => setProgress(p.text));
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
            onClick={handleGenerate}
            className="clean-caramel-btn text-xs font-semibold px-4 py-2"
          >
            Trace Biblical Motif
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 className="w-8 h-8 text-[#B4793D] animate-spin" />
          <p className="text-xs text-[#B4793D] font-medium animate-pulse">{progress || 'Analyzing text...'}</p>
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
             <button onClick={handleGenerate} className="text-[10px] text-[#B4793D] hover:underline font-medium uppercase tracking-wider">
               Generate Different Motif
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypologyPanel;
