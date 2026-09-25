import React from 'react';
import lockupNavyUrl from '../assets/brand/GFU_A2I2_Lockup_Navy.png';
import iconNavyUrl from '../assets/brand/A2I2_Icon_Navy.png';

export type A2I2Variant = 'lockup-navy' | 'icon-navy';

interface AppliedAiLogoProps {
  variant?: A2I2Variant;
  className?: string;
  height?: number | string;
  alt?: string;
}

const LOGO_SRC_MAP: Record<A2I2Variant, string> = {
  'lockup-navy': lockupNavyUrl,
  'icon-navy': iconNavyUrl,
};

export const AppliedAiLogo: React.FC<AppliedAiLogoProps> = ({
  variant = 'lockup-navy',
  className = '',
  height = 24,
  alt = 'George Fox University Applied AI Institute'
}) => {
  return (
    <img
      src={LOGO_SRC_MAP[variant]}
      alt={alt}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      className={`w-auto object-contain select-none ${className}`}
      loading="lazy"
    />
  );
};
