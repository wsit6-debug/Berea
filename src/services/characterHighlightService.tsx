import React from 'react';
import { characterMap } from '../data/characterData';

// Sort names by length descending so longer names match first
const sortedNames = Object.values(characterMap)
  .map(c => c.name)
  .filter(n => n.length > 2) // Ignore tiny 1-2 letter names to avoid false positives
  .sort((a, b) => b.length - a.length);

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const namesPattern = sortedNames.map(escapeRegExp).join('|');
const characterRegex = new RegExp(`(?<![a-zA-Z\\-])(${namesPattern})(?![a-zA-Z\\-])`, 'gi');

export function renderWithCharacters(
  text: string,
  colorStyle: React.CSSProperties,
  className: string,
  onCharClick?: (charId: string) => void
): React.ReactNode {
  if (!text) return null;

  // If no click handler, just return the text as is (or we could still highlight without clicking)
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
          // If the character is in our map, give it a hash color
          if (characterMap[charId]) {
            const hash = charId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
            const hue = hash % 360;
            return (
              <span
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  onCharClick(charId);
                }}
                className={`cursor-pointer hover:bg-black/5 rounded px-0.5 transition-colors ${className}`}
                style={{ ...colorStyle, color: `hsl(${hue}, 70%, 35%)`, fontWeight: 'bold' }}
                title={`View profile for ${part}`}
              >
                {part}
              </span>
            );
          }
        }
        return part ? <span key={i} className={className} style={colorStyle}>{part}</span> : null;
      })}
    </>
  );
}
