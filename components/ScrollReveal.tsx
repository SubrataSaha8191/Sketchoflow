"use client";

import React, { useRef, useEffect, ReactNode, memo, useState } from 'react';

export type AnimationVariant = 
  | 'fadeUp' 
  | 'fadeDown' 
  | 'fadeLeft' 
  | 'fadeRight' 
  | 'zoomIn' 
  | 'zoomOut' 
  | 'rotateIn' 
  | 'slideUp'
  | 'scaleUp'
  | 'blur';

interface ScrollRevealProps {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  ease?: string;
  threshold?: number;
  stagger?: number;
  className?: string;
  once?: boolean;
}

// CSS-based animations for smooth performance
const getAnimationStyles = (variant: AnimationVariant, isVisible: boolean, duration: number, delay: number) => {
  const baseTransition = `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`;
  
  const variants: Record<AnimationVariant, { hidden: React.CSSProperties; visible: React.CSSProperties }> = {
    fadeUp: {
      hidden: { opacity: 0, transform: 'translateY(40px)' },
      visible: { opacity: 1, transform: 'translateY(0)' }
    },
    fadeDown: {
      hidden: { opacity: 0, transform: 'translateY(-40px)' },
      visible: { opacity: 1, transform: 'translateY(0)' }
    },
    fadeLeft: {
      hidden: { opacity: 0, transform: 'translateX(-40px)' },
      visible: { opacity: 1, transform: 'translateX(0)' }
    },
    fadeRight: {
      hidden: { opacity: 0, transform: 'translateX(40px)' },
      visible: { opacity: 1, transform: 'translateX(0)' }
    },
    zoomIn: {
      hidden: { opacity: 0, transform: 'scale(0.9)' },
      visible: { opacity: 1, transform: 'scale(1)' }
    },
    zoomOut: {
      hidden: { opacity: 0, transform: 'scale(1.1)' },
      visible: { opacity: 1, transform: 'scale(1)' }
    },
    rotateIn: {
      hidden: { opacity: 0, transform: 'rotate(-5deg) translateY(20px)' },
      visible: { opacity: 1, transform: 'rotate(0) translateY(0)' }
    },
    slideUp: {
      hidden: { opacity: 0, transform: 'translateY(60px)' },
      visible: { opacity: 1, transform: 'translateY(0)' }
    },
    scaleUp: {
      hidden: { opacity: 0, transform: 'scale(0.85)' },
      visible: { opacity: 1, transform: 'scale(1)' }
    },
    blur: {
      hidden: { opacity: 0, transform: 'translateY(20px)' },
      visible: { opacity: 1, transform: 'translateY(0)' }
    }
  };

  return {
    ...(isVisible ? variants[variant].visible : variants[variant].hidden),
    transition: baseTransition,
    willChange: 'opacity, transform'
  };
};

const ScrollReveal: React.FC<ScrollRevealProps> = memo(({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.6,
  threshold = 0.15,
  className = '',
  once = true
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, once]);

  const animationStyles = getAnimationStyles(variant, isVisible, duration, delay);

  return (
    <div ref={ref} className={className} style={animationStyles}>
      {children}
    </div>
  );
});

ScrollReveal.displayName = 'ScrollReveal';

export default ScrollReveal;
