import React from 'react';
import bereaLogoUrl from '../assets/berea-logo.jpg';

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
            src={bereaLogoUrl}
            alt="Berea Gold Monogram"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
        {showText && (
          <div className="mt-3 text-center">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-[#26221F]">
              Berea
            </h2>
            <p className="text-xs text-[#B4793D] font-medium tracking-wide">
              Acts 17:11 • Examine Daily • Be Known
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
          src={bereaLogoUrl}
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
        style={{ width: `${size}px`, height: `${size}px` }}
        className="rounded-xl overflow-hidden shadow-sm border border-[#EBE5DC] bg-[#FAF7F2] p-0.5 flex-shrink-0 transition-transform duration-200 hover:scale-105 flex items-center justify-center"
      >
        <img
          src={bereaLogoUrl}
          alt="Berea Monogram"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-heading font-bold text-base sm:text-lg tracking-tight leading-none"
              style={{ color: textColor }}
            >
              Berea
            </span>
            <span className="hidden sm:inline text-[9.5px] font-medium text-[#B4793D] bg-[#FAF5ED] px-1.5 py-0.2 rounded-full border border-[#EBE5DC]">
              Acts 17:11
            </span>
          </div>
          <span className="text-[9px] tracking-wide text-[#8C827A] font-medium hidden md:inline leading-tight">
            Examine Daily • Be Known
          </span>
        </div>
      )}
    </div>
  );
};

