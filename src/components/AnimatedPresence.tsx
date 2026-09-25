import React, { useState, useEffect } from 'react';

interface AnimatedPresenceProps {
  isVisible: boolean;
  children: (isClosing: boolean) => React.ReactNode;
  duration?: number;
}

export const AnimatedPresence: React.FC<AnimatedPresenceProps> = ({ 
  isVisible, 
  children, 
  duration = 350 
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender, duration]);

  if (!shouldRender) return null;

  return <>{children(isClosing)}</>;
};
