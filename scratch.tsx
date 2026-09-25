import React, { useState } from 'react';
export const CharacterHighlight = ({ charId, part, className, colorStyle, isSelected, hue, onCharClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <span onClick={() => setIsOpen(!isOpen)}>{part}</span>
      {isOpen && <div className="absolute top-full left-0 mt-1 bg-white border p-2 rounded shadow">
         <button onClick={() => onCharClick(charId)}>View Character</button>
      </div>}
    </span>
  )
}
