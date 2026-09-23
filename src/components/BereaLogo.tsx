import React from 'react';

interface BereaLogoProps {
  className?: string;
  size?: number; // Size in px (e.g. 36, 42, 48, 64)
  showText?: boolean;
  textColor?: string;
  variant?: 'mark' | 'full' | 'hero' | 'compact';
  onClick?: () => void;
}

export const BereaLogo: React.FC<BereaLogoProps> = ({
  className = '',
  size = 40,
  showText = true,
  textColor = '#26221F',
  variant = 'mark',
  onClick
}) => {
  if (variant === 'hero') {
    return (
      <div 
        onClick={onClick}
        className={`flex flex-col items-center text-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <div 
          style={{ width: `${size * 2.4}px`, height: `${size * 2.4}px` }} 
          className="rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(180,121,61,0.22)] border-2 border-[#D4A373]/50 bg-[#FAF7F2] p-2 transition-all duration-300 hover:scale-105 hover:shadow-[0_16px_40px_rgba(180,121,61,0.3)]"
        >
          <img
            src="/berea-logo.jpg"
            alt="Berea Gold Monogram"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
        {showText && (
          <div className="mt-3 text-center">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-[#26221F]">
              Berea
            </h2>
            <p className="text-xs font-medium tracking-wide">
              <span className="text-[#B4793D]">Acts 17:11</span> <span className="text-[#8C827A]">• Examine Daily • Be Known</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div 
        onClick={onClick}
        style={{ width: `${size}px`, height: `${size}px` }}
        className={`rounded-xl overflow-hidden shadow-xs border border-[#EBE5DC] bg-[#FAF7F2] p-0.5 flex-shrink-0 transition-transform duration-200 hover:scale-105 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <img
          src="/berea-logo.jpg"
          alt="Berea Emblem"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Gold & Ivory Monogram Mark */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: 'var(--clean-surface, #FAF7F2)',
          borderColor: 'var(--clean-accent-border, #EBE5DC)'
        }}
        className="rounded-xl overflow-hidden shadow-sm border p-0.5 flex-shrink-0 transition-transform duration-200 hover:scale-105 flex items-center justify-center"
      >
        <img
          src="/berea-logo.jpg"
          alt="Berea Monogram"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5">
            <span
              className="font-heading font-bold text-base sm:text-lg tracking-tight leading-none"
              style={{ color: textColor || 'var(--clean-text-primary, #26221F)' }}
            >
              Berea
            </span>
            <span
              className="inline-flex items-center text-[9.5px] font-bold px-1.5 py-0.5 rounded-full border shadow-2xs leading-none shrink-0"
              style={{
                color: 'var(--clean-accent-dark, #B4793D)',
                backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                borderColor: 'var(--clean-accent-border, #E2D5C3)'
              }}
            >
              Acts 17:11
            </span>
          </div>
          <span
            className="text-[9px] tracking-wide font-medium hidden sm:inline leading-tight mt-0.5"
            style={{ color: 'var(--clean-text-secondary, #78716C)' }}
          >
            Examine Daily • Be Known
          </span>
        </div>
      )}
    </div>
  );
};

