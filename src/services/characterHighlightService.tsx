import React, { useState } from 'react';
import { characterMap } from '../data/characterData';
import { BIBLICAL_LOCATIONS, ANCIENT_BIBLICAL_REGIONS } from '../data/geoData';
import { generateLocalAiResponse } from './webLlmService';

// Collect all known geographic locations and regions from application geo-data
const GEO_LOCATIONS = new Set<string>();

ANCIENT_BIBLICAL_REGIONS.forEach(r => {
  if (r.name) GEO_LOCATIONS.add(r.name.toLowerCase().trim());
  if (r.ancientName) GEO_LOCATIONS.add(r.ancientName.toLowerCase().trim());
});

Object.values(BIBLICAL_LOCATIONS).forEach(loc => {
  if (loc.id) {
    GEO_LOCATIONS.add(loc.id.toLowerCase().replace(/_/g, '-'));
    GEO_LOCATIONS.add(loc.id.toLowerCase().replace(/_/g, ' '));
  }
  if (loc.name) {
    const cleanName = loc.name.replace(/\(.*?\)/g, '').split(/[—/&,]/)[0].trim().toLowerCase();
    if (cleanName) GEO_LOCATIONS.add(cleanName);
  }
  if (loc.ancientName) {
    const cleanAnc = loc.ancientName.replace(/\(.*?\)/g, '').split(/[—/&,]/)[0].trim().toLowerCase();
    if (cleanAnc) GEO_LOCATIONS.add(cleanAnc);
  }
});

// Names that can refer to either a historical person (e.g. Genesis genealogy / eponymous patriarch)
// or a geographic location (city, mountain, river, region).
export const AMBIGUOUS_PLACE_NAMES = new Set<string>([
  'canaan', 'shechem', 'hebron', 'jordan', 'moab', 'gilead', 'midian', 'seir', 'ebal',
  'sidon', 'tarshish', 'dan', 'eden', 'jezreel', 'penuel', 'tekoa', 'anathoth', 'nebo',
  'laish', 'arad', 'jabesh', 'shimron', 'jabal', 'uz', 'ophir', 'havilah', 'asshur',
  'elam', 'aram', 'cush', 'mizraim', 'put', 'lud', 'haran', 'mamre', 'sheva', 'gad'
]);

// Pure geographic locations and non-character words that should never be treated as persons
export const PURE_PLACES_AND_WORDS = new Set<string>([
  'put', 'so', 'on', 'no', 'do', 'as', 'let', 'us', 'or', 'are', 'will', 'some', 'all', 'any',
  'am', 'an', 'at', 'be', 'by', 'he', 'if', 'in', 'is', 'it', 'me', 'my', 'of', 'to', 'we',
  'man', 'men', 'son', 'ark',
  'egypt', 'babylon', 'babel', 'tyre', 'damascus', 'nazareth', 'jerusalem', 'bethlehem',
  'jericho', 'bethel', 'beersheba', 'shiloh', 'gilgal', 'joppa', 'gath', 'gaza', 'ashdod',
  'ashkelon', 'ekron', 'caesarea', 'antioch', 'rome', 'corinth', 'ephesus', 'philippi',
  'colossae', 'thessalonica', 'berea', 'athens', 'troas', 'patmos', 'sardis', 'smyrna',
  'pergamum', 'thyatira', 'philadelphia', 'laodicea', 'sinai', 'ararat', 'ur', 'bashan',
  'ammon', 'edom', 'goshen', 'mesopotamia', 'syria', 'judea', 'samaria', 'galilee',
  'decapolis', 'perea', 'phoenicia', 'macedonia', 'achaia', 'asia', 'cyprus', 'crete',
  'malta', 'shinar', 'moriah', 'zion', 'calvary', 'golgotha', 'gethsemane', 'bethany',
  'bethsaida', 'capernaum', 'cana', 'emmaus', 'nain', 'sychar', 'lydda', 'arimathea',
  'jabbok', 'cherith', 'kidron', 'hinnom', 'carmel', 'hermon', 'tabor', 'gerizim',
  'peor', 'hor', 'lebanon', 'sirion', 'senir', 'parpar', 'abana', 'euphrates', 'tigris',
  'hiddekel', 'gihon', 'pishon', 'kadesh', 'kadesh-barnea', 'marah', 'elim', 'rephidim',
  'ezion-geber', 'ramah', 'mizpah', 'gibeah', 'gibeon', 'nob', 'en-gedi', 'engedi',
  'masada', 'lachish', 'gezer', 'megiddo', 'hazor', 'succoth', 'mahanaim', 'ramoth',
  'ramoth-gilead', 'aroe', 'medeba', 'heshbon', 'dibon', 'bozrah', 'sela', 'petra',
  'paran', 'zoar', 'sodom', 'gomorrah', 'admah', 'zeboiim', 'akkad', 'erech', 'calneh',
  'nineveh', 'calah', 'rehoboth', 'carchemish', 'armageddon',
  'caesar', 'caesar-augustus', 'aeneas', 'ishi', 'hattush', 'izziah'
]);

export function isPlaceOrNonCharacter(charId: string, charName?: string, bio?: string): boolean {
  const lowerId = charId.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const lowerName = (charName || charId).toLowerCase();
  
  if (PURE_PLACES_AND_WORDS.has(lowerId) || PURE_PLACES_AND_WORDS.has(lowerName)) {
    return true;
  }
  if (AMBIGUOUS_PLACE_NAMES.has(lowerId) || AMBIGUOUS_PLACE_NAMES.has(lowerName)) {
    return true;
  }
  if (GEO_LOCATIONS.has(lowerId) || GEO_LOCATIONS.has(lowerName)) {
    return true;
  }
  if (bio) {
    if (
      /not a (person|biblical (character|figure)|human)/i.test(bio) ||
      /rather a (city|town|place|location|region|mountain|river|valley|seaport)/i.test(bio) ||
      /is not a biblical/i.test(bio)
    ) {
      return true;
    }
  }
  return false;
}

export function isCharacterHighlighted(
  charId: string,
  charName: string,
  aiVerifiedPeople?: Set<string> | null
): boolean {
  const lowerId = charId.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const lowerName = charName.toLowerCase();

  // 1. Pure places and common words are never characters
  if (PURE_PLACES_AND_WORDS.has(lowerId) || PURE_PLACES_AND_WORDS.has(lowerName)) {
    return false;
  }
  if (GEO_LOCATIONS.has(lowerId) || GEO_LOCATIONS.has(lowerName)) {
    if (!AMBIGUOUS_PLACE_NAMES.has(lowerId) && !AMBIGUOUS_PLACE_NAMES.has(lowerName)) {
      return false;
    }
  }

  // 2. Ambiguous place names: only highlight if AI explicitly confirmed as a person in this chapter
  if (AMBIGUOUS_PLACE_NAMES.has(lowerId) || AMBIGUOUS_PLACE_NAMES.has(lowerName)) {
    return Boolean(aiVerifiedPeople && (aiVerifiedPeople.has(lowerId) || aiVerifiedPeople.has(lowerName)));
  }

  // 3. Real biblical characters (Eve, Adam, Abraham, Sarah, Noah, Moses, Jesus, God, etc.): ALWAYS highlight!
  return true;
}

// Sort names by length descending so longer names match first
const sortedNames = Object.values(characterMap)
  .filter(c => c.name.length > 2) // Ignore tiny 1-2 letter names to avoid false positives
  .filter(c => !PURE_PLACES_AND_WORDS.has(c.id.toLowerCase()) && !PURE_PLACES_AND_WORDS.has(c.name.toLowerCase()))
  .map(c => c.name)
  .sort((a, b) => b.length - a.length);

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const namesPattern = sortedNames.map(escapeRegExp).join('|');
// Using 'g' instead of 'gi' for case-sensitive matching so we don't highlight lowercase verbs (e.g. "mark", "job")
const characterRegex = new RegExp(`(?<![a-zA-Z\\-])(${namesPattern})(?![a-zA-Z\\-])`, 'g');

/**
 * AI-assisted chapter analysis: disambiguates candidate names that could be either a person or a place
 */
export async function detectChapterPersonsWithAi(
  bookName: string,
  chapterNum: number,
  verseTexts: string[]
): Promise<Set<string>> {
  const cacheKey = `berea_chapter_ambiguous_v3_${bookName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${chapterNum}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return new Set(parsed.map((n: string) => n.toLowerCase().replace(/[^a-z0-9]/g, '-')));
      }
    }
  } catch (_) {
    // ignore localStorage errors
  }

  const fullText = verseTexts.join(' ');
  // Identify ambiguous candidate names present in this chapter
  const ambiguousCandidates: string[] = [];
  for (const name of AMBIGUOUS_PLACE_NAMES) {
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    const reg = new RegExp(`\\b${escapeRegExp(capitalized)}\\b`);
    if (reg.test(fullText)) {
      ambiguousCandidates.push(capitalized);
    }
  }

  if (ambiguousCandidates.length === 0) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify([]));
    } catch (_) {}
    return new Set<string>();
  }

  const snippet = fullText.slice(0, 1500);
  const prompt = `You are a biblical scholar analyzing scripture text to distinguish individual persons from places, cities, nations, or regions.
Context: ${bookName} Chapter ${chapterNum}.
Text snippet: "${snippet}"

Ambiguous names to classify: ${JSON.stringify(ambiguousCandidates)}.

Task: For each name above, determine whether it refers to an individual PERSON / divine figure in this specific chapter, or if it refers to a PLACE (city, nation, region, landmark, river, mountain).
Return ONLY a valid JSON array of names that are strictly referring to an individual PERSON in this chapter: e.g. ["Name1"]. If none refer to a person, return []. Do not return markdown, code fences, or any other text.`;

  try {
    const response = await generateLocalAiResponse([
      { role: 'system', content: 'You are a biblical scholar. Always return a raw JSON array.' },
      { role: 'user', content: prompt }
    ], undefined, true);

    const jsonMatch = response.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        const resultIds = parsed.map((n: string) => n.toLowerCase().replace(/[^a-z0-9]/g, '-'));
        try {
          localStorage.setItem(cacheKey, JSON.stringify(resultIds));
        } catch (_) {}
        return new Set<string>(resultIds);
      }
    }
  } catch (err) {
    console.warn('AI chapter person disambiguation fallback:', err);
  }

  return new Set<string>();
}

function CharacterHighlightNode({
  charId,
  part,
  className,
  colorStyle,
  isSelected,
  hue,
  onCharClick
}: {
  charId: string;
  part: string;
  className: string;
  colorStyle: React.CSSProperties;
  isSelected: boolean;
  hue: number;
  onCharClick?: (charId: string) => void;
}) {
  const spanRef = React.useRef<HTMLSpanElement>(null);
  const [popoverState, setPopoverState] = useState<{ rect: DOMRect, containerRect: DOMRect, isClosing: boolean, isOpening: boolean } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const profile = characterMap[charId];

  // Use a ref to hold the latest state so we don't have to re-attach event listeners on every state change,
  // which causes React 18 bubbling bugs where the window catches the same click that opened it.
  const stateRef = React.useRef(popoverState);
  stateRef.current = popoverState;

  React.useEffect(() => {
    const handleCloseAll = (e?: Event) => {
      const current = stateRef.current;
      if (!current || current.isClosing) return;
      
      // If it's a window click, ignore it if the click originated from inside our own component
      if (e && e.type === 'click' && spanRef.current && spanRef.current.contains(e.target as Node)) {
        return;
      }

      setPopoverState({ ...current, isClosing: true, isOpening: false });
      setTimeout(() => {
        setPopoverState(curr => curr?.isClosing ? null : curr);
        setIsExpanded(false);
      }, 300);
    };

    window.addEventListener('berea-close-character-popovers', handleCloseAll);
    window.addEventListener('click', handleCloseAll, { capture: true });
    
    return () => {
      window.removeEventListener('berea-close-character-popovers', handleCloseAll);
      window.removeEventListener('click', handleCloseAll, { capture: true });
    };
  }, []); // Run only once on mount

  const togglePopover = (e: React.MouseEvent) => {
    e.stopPropagation();
    const current = stateRef.current;
    if (current && !current.isClosing) {
      setPopoverState({ ...current, isClosing: true, isOpening: false });
      setTimeout(() => {
        setPopoverState(curr => curr?.isClosing ? null : curr);
        setIsExpanded(false);
      }, 300);
    } else if (spanRef.current) {
      window.dispatchEvent(new CustomEvent('berea-close-character-popovers'));
      
      const container = spanRef.current.closest('.overflow-y-auto') || document.body;
      setPopoverState({ 
        rect: spanRef.current.getBoundingClientRect(), 
        containerRect: container.getBoundingClientRect(),
        isClosing: false,
        isOpening: true
      });
      setIsExpanded(false);
      
      // Trigger the opening animation on the next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPopoverState(curr => curr ? { ...curr, isOpening: false } : null);
        });
      });
    }
  };

  const closePopover = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const current = stateRef.current;
    if (current && !current.isClosing) {
      setPopoverState({ ...current, isClosing: true, isOpening: false });
      setTimeout(() => {
        setPopoverState(curr => curr?.isClosing ? null : curr);
        setIsExpanded(false);
      }, 300);
    }
  };

  if (isSelected) {
    return (
      <span
        className={`rounded px-1 transition-colors ${className}`}
        style={{ ...colorStyle, backgroundColor: `hsl(${hue}, 70%, 85%)`, color: `hsl(${hue}, 80%, 30%)`, fontWeight: 'bold' }}
      >
        {part}
      </span>
    );
  }

  return (
    <span className={`relative inline-block group ${popoverState && !popoverState.isClosing ? 'z-50' : 'z-auto'}`} ref={spanRef}>
      <span
        onClick={togglePopover}
        className={`cursor-pointer hover:bg-black/5 rounded px-0.5 transition-colors ${className}`}
        style={{ ...colorStyle, color: `hsl(${hue}, 70%, 35%)`, fontWeight: 'bold' }}
        title={`View profile for ${part}`}
      >
        {part}
      </span>
      {popoverState && profile && (() => {
        const { rect, containerRect, isClosing, isOpening } = popoverState;
        
        // Determine if we should open upwards or downwards based on the container position
        const isTopHalf = rect.top < containerRect.top + containerRect.height / 2;
        
        const boxWidth = isExpanded ? 340 : 280;
        const boxHeight = isExpanded ? 420 : 280;
        const halfWidth = boxWidth / 2;
        
        // Calculate shift to keep the box from bleeding off the edges of the scrolling container
        const centerX = rect.left + rect.width / 2;
        let shiftX = 0;
        
        if (centerX + halfWidth + 10 > containerRect.right) {
          shiftX = containerRect.right - (centerX + halfWidth + 20);
        } else if (centerX - halfWidth - 10 < containerRect.left) {
          shiftX = containerRect.left - (centerX - halfWidth - 20);
        }

        const isAnimatingOut = isClosing || isOpening;

        return (
          <span 
            className="absolute z-[99999] rounded-2xl text-sm font-sans flex flex-col justify-between text-left"
            style={{ 
              cursor: 'default', 
              lineHeight: '1.4',
              backgroundColor: '#FDFBF7',
              borderColor: '#B4793D',
              borderWidth: '2px',
              borderStyle: 'solid',
              boxShadow: '0 20px 50px -12px rgba(0,0,0,0.5)',
              width: `${boxWidth}px`,
              height: `${boxHeight}px`,
              top: isTopHalf ? '100%' : 'auto',
              bottom: isTopHalf ? 'auto' : '100%',
              marginTop: isTopHalf ? '15px' : '0',
              marginBottom: isTopHalf ? '0' : '15px',
              left: '50%',
              transform: `translateX(calc(-50% + ${shiftX}px)) scale(${isAnimatingOut ? 0.85 : 1}) translateY(${isAnimatingOut ? (isTopHalf ? -15 : 15) : 0}px)`,
              opacity: isAnimatingOut ? 0 : 1,
              transition: 'opacity 0.25s ease-out, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transformOrigin: isTopHalf ? 'top center' : 'bottom center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* The Arrow Tail */}
            <div 
              style={{
                position: 'absolute',
                left: `calc(50% - ${shiftX}px)`,
                transform: 'translateX(-50%) rotate(45deg)',
                width: '18px',
                height: '18px',
                backgroundColor: '#FDFBF7',
                top: isTopHalf ? '-10px' : 'auto',
                bottom: isTopHalf ? 'auto' : '-10px',
                borderTop: isTopHalf ? '2px solid #B4793D' : 'none',
                borderLeft: isTopHalf ? '2px solid #B4793D' : 'none',
                borderBottom: isTopHalf ? 'none' : '2px solid #B4793D',
                borderRight: isTopHalf ? 'none' : '2px solid #B4793D',
                borderTopLeftRadius: isTopHalf ? '3px' : '0',
                borderBottomRightRadius: isTopHalf ? '0' : '3px',
                transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            />
            
            <div className="flex flex-col h-full overflow-hidden p-5 z-10 relative">
              <span className="flex justify-between items-start border-b pb-2 mb-3 shrink-0" style={{ borderColor: '#E6DCCC' }}>
                <span className="flex flex-col">
                  <span className="font-bold text-xl" style={{ color: '#26221F' }}>{profile.name}</span>
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#B4793D' }}>{profile.meaning}</span>
                </span>
                <button onClick={closePopover} className="text-2xl px-1 -mt-1 leading-none transition-colors" style={{ color: '#A8A29E' }} onMouseEnter={(e) => e.currentTarget.style.color = '#26221F'} onMouseLeave={(e) => e.currentTarget.style.color = '#A8A29E'}>&times;</button>
              </span>
              
              <div className={`flex-grow relative ${isExpanded ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}`}>
                {profile.aiBiography ? (
                  <span 
                    className="text-sm leading-relaxed" 
                    style={{ 
                      color: '#5C5449',
                      display: isExpanded ? 'block' : '-webkit-box',
                      WebkitLineClamp: isExpanded ? 'unset' : 5,
                      WebkitBoxOrient: isExpanded ? 'unset' : 'vertical',
                      overflow: isExpanded ? 'visible' : 'hidden',
                      textOverflow: isExpanded ? 'clip' : 'ellipsis'
                    }}
                  >
                    {profile.aiBiography.split('\n').map((paragraph, idx) => (
                      <React.Fragment key={idx}>
                        {paragraph}
                        {idx < (profile.aiBiography || '').split('\n').length - 1 && <><br /><br /></>}
                      </React.Fragment>
                    ))}
                  </span>
                ) : (
                  <span className="text-sm italic" style={{ color: '#A8A29E' }}>No biography available.</span>
                )}
              </div>
              
              {!isExpanded && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                  }}
                  className="mt-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors shadow-md w-full flex justify-center items-center gap-2 shrink-0"
                  style={{ backgroundColor: '#26221F', color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B4793D'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#26221F'}
                >
                  <span>Read Full Profile</span>
                  <span className="text-lg">↓</span>
                </button>
              )}
            </div>
          </span>
        );
      })()}
    </span>
  );
}

export function renderWithCharacters(
  text: string,
  colorStyle: React.CSSProperties,
  className: string,
  onCharClick?: (charId: string) => void,
  matchedCharacters?: Set<string>,
  selectedCharacter?: string | null,
  allowedCharacters?: Set<string> | null
): React.ReactNode {
  if (!text) return null;

  // If no click handler, just return the text as is
  if (!onCharClick) {
    return <span className={className} style={colorStyle}>{text}</span>;
  }

  // Split keeps the captured groups in the array at odd indices
  const parts = text.split(characterRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 !== 0) {
          const charId = part.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const isHighlighted = isCharacterHighlighted(charId, part, allowedCharacters);

          // If the character is in our map and verified as a character
          if (characterMap[charId] && isHighlighted) {
            const hash = charId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
            const hue = hash % 360;
            const isSelected = charId === selectedCharacter;
            
            // If we've already matched it, just render as plain text to limit 1 highlight per page
            if (matchedCharacters && matchedCharacters.has(charId)) {
              return part ? <span key={i} className={className} style={colorStyle}>{part}</span> : null;
            }

            // Mark it as matched
            if (matchedCharacters) {
              matchedCharacters.add(charId);
            }

            return (
              <CharacterHighlightNode
                key={i}
                charId={charId}
                part={part}
                className={className}
                colorStyle={colorStyle}
                isSelected={isSelected}
                hue={hue}
                onCharClick={onCharClick}
              />
            );
          }
        }
        return part ? <span key={i} className={className} style={colorStyle}>{part}</span> : null;
      })}
    </>
  );
}
