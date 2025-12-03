'use client';

import React from 'react';
import styled from 'styled-components';
import { Sparkles } from 'lucide-react';
import { useTheme, ColorTheme } from '@/context/ThemeContext';

const colorThemes: Record<ColorTheme, { 
  iconBg: string; 
  iconShadow: string; 
  textGradient: string;
  iconColor: string;
}> = {
  purple: {
    iconBg: 'linear-gradient(to bottom right, #7c3aed, #a855f7)',
    iconShadow: 'rgba(168, 85, 247, 0.4)',
    textGradient: 'linear-gradient(to right, #c084fc, #e879f9, #c084fc)',
    iconColor: '#ffffff'
  },
  blue: {
    iconBg: 'linear-gradient(to bottom right, #2563eb, #3b82f6)',
    iconShadow: 'rgba(59, 130, 246, 0.4)',
    textGradient: 'linear-gradient(to right, #93c5fd, #60a5fa, #93c5fd)',
    iconColor: '#ffffff'
  },
  gold: {
    iconBg: 'linear-gradient(to bottom right, #ca8a04, #fbbf24)',
    iconShadow: 'rgba(251, 191, 36, 0.4)',
    textGradient: 'linear-gradient(to right, #fde047, #fbbf24, #fde047)',
    iconColor: '#422006'
  },
  green: {
    iconBg: 'linear-gradient(to bottom right, #16a34a, #22c55e)',
    iconShadow: 'rgba(34, 197, 94, 0.4)',
    textGradient: 'linear-gradient(to right, #86efac, #4ade80, #86efac)',
    iconColor: '#ffffff'
  },
  pink: {
    iconBg: 'linear-gradient(to bottom right, #db2777, #ec4899)',
    iconShadow: 'rgba(236, 72, 153, 0.4)',
    textGradient: 'linear-gradient(to right, #f9a8d4, #f472b6, #f9a8d4)',
    iconColor: '#ffffff'
  }
};

const ThemedLogo = () => {
  const { buttonTheme } = useTheme();
  const theme = colorThemes[buttonTheme];

  return (
    <StyledWrapper 
      $iconBg={theme.iconBg}
      $iconShadow={theme.iconShadow}
      $textGradient={theme.textGradient}
      $iconColor={theme.iconColor}
    >
      <div className="logo-container">
        <div className="logo-icon">
          <Sparkles className="icon" />
        </div>
        <span className="logo-text">SketchoFlow</span>
      </div>
    </StyledWrapper>
  );
};

interface StyledWrapperProps {
  $iconBg: string;
  $iconShadow: string;
  $textGradient: string;
  $iconColor: string;
}

const StyledWrapper = styled.div<StyledWrapperProps>`
  .logo-container {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo-icon {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.75rem;
    background: ${props => props.$iconBg};
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 15px -3px ${props => props.$iconShadow}, 
                0 4px 6px -2px ${props => props.$iconShadow};
    transition: all 0.5s ease;
  }

  .icon {
    width: 1.25rem;
    height: 1.25rem;
    color: ${props => props.$iconColor};
    transition: color 0.5s ease;
  }

  .logo-text {
    font-size: 1.125rem;
    font-weight: 600;
    background: ${props => props.$textGradient};
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    transition: all 0.5s ease;
    animation: shimmer 3s linear infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: 0% center;
    }
    100% {
      background-position: 200% center;
    }
  }

  .logo-container:hover .logo-icon {
    transform: scale(1.05);
  }

  .logo-container:hover .logo-text {
    animation-duration: 1.5s;
  }
`;

export default ThemedLogo;
