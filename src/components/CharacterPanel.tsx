import React from 'react';
import { Sparkles, User } from 'lucide-react';
import { characterMap } from '../data/characterData';
import { Chapter } from '../data/bibleData';

interface CharacterPanelProps {
  charId: string | null;
  bookName: string;
  chapter: Chapter;
}

export const CharacterPanel: React.FC<CharacterPanelProps> = ({ charId, bookName, chapter }) => {
  const character = charId ? characterMap[charId] : null;

  if (!charId || !character) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-[#A8A29E]">
        <User className="w-12 h-12 mb-3 text-[#EBE5DC]" />
        <h3 className="font-semibold text-[#78716C] mb-1">No Character Selected</h3>
        <p className="text-sm">Click on a highlighted character name in the biblical text to view their AI-generated biography and meaning.</p>
      </div>
    );
  }

  const hash = charId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const hue = hash % 360;

  return (
    <div className="flex flex-col h-full animate-fadeIn">
      <div className="flex items-center justify-between p-3 border-b border-[#EBE5DC] bg-[#FAF5ED] rounded-t-xl">
        <h2 className="font-heading font-bold text-sm text-[#26221F] flex items-center gap-2">
          <User className="w-4 h-4" style={{ color: `hsl(${hue}, 70%, 40%)` }} />
          Character Profile
        </h2>
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        <div className="mb-6 text-center">
          <div 
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-md"
            style={{ backgroundColor: `hsl(${hue}, 70%, 40%)` }}
          >
            {character.name.charAt(0)}
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#26221F]" style={{ color: `hsl(${hue}, 70%, 35%)` }}>
            {character.name}
          </h1>
          {character.meaning && (
            <p className="text-sm italic text-[#78716C] mt-1">"{character.meaning}"</p>
          )}
        </div>

        <div className="border-t border-[#EBE5DC] pt-5">
          <h3 className="text-xs font-bold text-[#A8A29E] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#B4793D]" /> AI Biography
          </h3>
          
          {character.aiBiography ? (
            <div className="text-sm text-[#38332E] leading-relaxed space-y-4">
              {character.aiBiography.split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : (
            <div className="text-sm text-[#A8A29E] italic bg-[#FAF5ED] p-4 rounded-xl border border-[#EBE5DC] text-center">
              Biography not available yet for this character.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
