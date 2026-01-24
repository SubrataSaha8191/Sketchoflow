'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ArrowUp } from 'lucide-react';

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      // Avoid division by zero when content height equals viewport height
      let progress = 0;
      if (docHeight > 0) {
        progress = (scrollTop / docHeight) * 100;
        if (!Number.isFinite(progress) || Number.isNaN(progress)) progress = 0;
      }
      // Clamp progress between 0 and 100
      progress = Math.max(0, Math.min(100, progress));
      setScrollProgress(progress);
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // SVG circle properties
  const size = 56;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <StyledWrapper $isVisible={isVisible}>
      <button className="scroll-button" onClick={scrollToTop} aria-label="Scroll to top">
        {/* Circular Progress Ring */}
        <svg className="progress-ring" width={size} height={size}>
          {/* Background circle */}
          <circle
            className="progress-ring-bg"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress circle */}
          <circle
            className="progress-ring-circle"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        {/* Arrow Icon */}
        <div className="icon-container">
          <ArrowUp className="arrow-icon" size={20} />
        </div>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 9999;
  opacity: ${props => props.$isVisible ? 1 : 0};
  visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
  transform: ${props => props.$isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .scroll-button {
    position: relative;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(20, 20, 20, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 
      0 4px 20px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.1);

    &:hover {
      transform: scale(1.1);
      box-shadow: 
        0 6px 30px rgba(168, 85, 247, 0.4),
        0 0 0 1px rgba(168, 85, 247, 0.3);

      .arrow-icon {
        transform: translateY(-2px);
      }

      .progress-ring-circle {
        stroke: #a855f7;
      }
    }
  }

  .progress-ring {
    position: absolute;
    top: 0;
    left: 0;
    transform: rotate(-90deg);
  }

  .progress-ring-bg {
    stroke: rgba(255, 255, 255, 0.1);
  }

  .progress-ring-circle {
    stroke: #8b5cf6;
    stroke-linecap: round;
    transition: stroke 0.3s ease, stroke-dashoffset 0.1s ease;
  }

  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .arrow-icon {
    color: white;
    transition: transform 0.3s ease;
  }
`;

export default ScrollProgress;
