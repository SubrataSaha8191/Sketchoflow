'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme, ColorTheme } from '@/context/ThemeContext';
import AuthPopup from './AuthPopup';

const colorThemes: Record<ColorTheme, { gradient: string; text: string; glow: string }> = {
  purple: {
    gradient: 'linear-gradient(to right, #5b21b6, #a855f7, #5b21b6, #5b21b6, #a855f7, #5b21b6)',
    text: '#c084fc',
    glow: '#a855f7'
  },
  blue: {
    gradient: 'linear-gradient(to right, #1e40af, #3b82f6, #1e40af, #1e40af, #3b82f6, #1e40af)',
    text: '#93c5fd',
    glow: '#3b82f6'
  },
  gold: {
    gradient: 'linear-gradient(to right, #77530a, #ffd277, #77530a, #77530a, #ffd277, #77530a)',
    text: '#ffd277',
    glow: '#fbbf24'
  },
  green: {
    gradient: 'linear-gradient(to right, #166534, #22c55e, #166534, #166534, #22c55e, #166534)',
    text: '#86efac',
    glow: '#22c55e'
  },
  pink: {
    gradient: 'linear-gradient(to right, #9d174d, #ec4899, #9d174d, #9d174d, #ec4899, #9d174d)',
    text: '#f9a8d4',
    glow: '#ec4899'
  }
};

const AuthButtons = () => {
  const { buttonTheme } = useTheme();
  const theme = colorThemes[buttonTheme];
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleSignIn = () => {
    setAuthMode('signin');
    setIsPopupOpen(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleToggleMode = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <>
      <StyledWrapper $gradient={theme.gradient} $text={theme.text} $glow={theme.glow}>
        <button className="Btn" onClick={handleSignIn}>
          <span className="text">Sign In</span>
        </button>
        <button className="Btn" onClick={handleSignUp}>
          <span className="text">Sign Up</span>
        </button>
      </StyledWrapper>
      <AuthPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        mode={authMode}
        onToggleMode={handleToggleMode}
      />
    </>
  );
}

interface StyledWrapperProps {
  $gradient: string;
  $text: string;
  $glow: string;
}

const StyledWrapper = styled.div<StyledWrapperProps>`
  display: flex;
  align-items: center;
  gap: 12px;

  .Btn {
    width: 100px;
    height: 40px;
    border: none;
    border-radius: 10px;
    background: ${props => props.$gradient};
    background-size: 250%;
    background-position: left;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.6s ease;
    overflow: hidden;
  }

  .Btn::before {
    position: absolute;
    content: "";
    display: flex;
    align-items: center;
    justify-content: center;
    width: 97%;
    height: 90%;
    border-radius: 8px;
    transition: all 0.6s ease;
    background-color: rgba(0, 0, 0, 0.842);
    background-size: 200%;
  }

  .text {
    position: relative;
    z-index: 1;
    color: ${props => props.$text};
    font-size: 14px;
    font-weight: 500;
    transition: color 0.6s ease;
  }

  .Btn:hover {
    background-position: right;
    box-shadow: 0 0 20px ${props => props.$glow}40;
  }

  .Btn:hover::before {
    background-position: right;
  }

  .Btn:active {
    transform: scale(0.95);
  }
`;

export default AuthButtons;
