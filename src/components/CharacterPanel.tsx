import React, { useEffect, useState } from 'react';
import { X, Sparkles, User } from 'lucide-react';
import { characterMap } from '../data/characterData';
import { generateCharacterProfile } from '../services/aiService';
import { Chapter } from '../data/bibleData';

interface CharacterPanelProps {
  charId: string | null;
  bookName: string;
  chapter: Chapter;
}

export const CharacterPanel: React.FC<CharacterPanelProps> = ({ charId, bookName, chapter }) => {
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [profile, setProfile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const character = charId ? characterMap[charId] : null;

  useEffect(() => {
    if (!character) {
      setProfile(null);
      return;
    }

    let isMounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      setProfile(null);
      setProgressText('Initializing AI engine...');
      try {
        const text = chapter.verses.map(v => v.text['KJV'] || Object.values(v.text)[0]).join(' ');
        const result = await generateCharacterProfile(
          character.name, 
          bookName, 
          chapter.chapterNumber, 
          text,
          (prog) => {
            if (isMounted) setProgressText(prog.text);
          }
        );
        if (isMounted) {
          setProfile(result);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to generate profile.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => { isMounted = false; };
  }, [character, bookName, chapter]);

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
          
          {loading ? (
            <div className="space-y-3">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-[#FAF5ED] rounded w-full"></div>
                <div className="h-4 bg-[#FAF5ED] rounded w-5/6"></div>
                <div className="h-4 bg-[#FAF5ED] rounded w-4/6"></div>
              </div>
              {progressText && (
                <div className="text-xs text-[#B4793D] italic text-center mt-4 px-2">
                  {progressText}
                </div>
              )}
            </div>
          ) : error ? (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          ) : profile ? (
            <div className="text-sm text-[#38332E] leading-relaxed space-y-4">
              {profile.split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
