"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
  from?: { opacity?: number; y?: number; x?: number };
  to?: { opacity?: number; y?: number; x?: number };
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: React.CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 40,
  duration = 0.5,
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.2,
  tag = 'p',
  textAlign = 'center',
  onLetterAnimationComplete
}) => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Split text into chars or words
  const elements = useMemo(() => {
    if (splitType === 'chars' || splitType === 'words, chars') {
      return text.split('').map((char, i) => ({
        char: char === ' ' ? '\u00A0' : char,
        index: i
      }));
    } else if (splitType === 'words') {
      return text.split(' ').map((word, i) => ({
        char: word,
        index: i
      }));
    }
    return [{ char: text, index: 0 }];
  }, [text, splitType]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  // Trigger callback when animation completes
  useEffect(() => {
    if (isVisible && onLetterAnimationComplete) {
      const totalDuration = (elements.length * delay) + (duration * 1000);
      const timer = setTimeout(onLetterAnimationComplete, totalDuration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, elements.length, delay, duration, onLetterAnimationComplete]);

  const getCharStyle = (index: number): React.CSSProperties => {
    const delayMs = index * delay;
    
    return {
      display: 'inline-block',
      opacity: isVisible ? (to.opacity ?? 1) : (from.opacity ?? 0),
      transform: isVisible 
        ? `translateY(${to.y ?? 0}px) translateX(${to.x ?? 0}px)`
        : `translateY(${from.y ?? 40}px) translateX(${from.x ?? 0}px)`,
      transition: `opacity ${duration}s ease-out ${delayMs}ms, transform ${duration}s ease-out ${delayMs}ms`,
      willChange: 'opacity, transform'
    };
  };

  const containerStyle: React.CSSProperties = {
    textAlign,
    wordWrap: 'break-word',
  };

  const content = elements.map(({ char, index }) => (
    <span key={index} style={getCharStyle(index)}>
      {char}
    </span>
  ));

  const props = {
    ref: ref as any,
    style: containerStyle,
    className: `overflow-hidden inline-block whitespace-normal ${className}`
  };

  switch (tag) {
    case 'h1': return <h1 {...props}>{content}</h1>;
    case 'h2': return <h2 {...props}>{content}</h2>;
    case 'h3': return <h3 {...props}>{content}</h3>;
    case 'h4': return <h4 {...props}>{content}</h4>;
    case 'h5': return <h5 {...props}>{content}</h5>;
    case 'h6': return <h6 {...props}>{content}</h6>;
    case 'span': return <span {...props}>{content}</span>;
    default: return <p {...props}>{content}</p>;
  }
};

export default SplitText;
