import React, { useState, useEffect } from 'react';

interface AnimatedPresenceProps {
  isVisible: boolean;
  children: (isClosing: boolean) => React.ReactNode;
  duration?: number;
  onExitComplete?: () => void;
}

export const AnimatedPresence: React.FC<AnimatedPresenceProps> = ({ 
  isVisible, 
  children, 
  duration = 350,
  onExitComplete
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isClosing, setIsClosing] = useState(false);
  const onExitCompleteRef = React.useRef(onExitComplete);
  onExitCompleteRef.current = onExitComplete;

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
        onExitCompleteRef.current?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender, duration]);

  if (!shouldRender) return null;

  return <>{children(isClosing)}</>;
};
