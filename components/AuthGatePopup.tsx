'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { useAuthGate } from '@/context/AuthGateContext';
import { useAuth } from '@/context/AuthContext';
import { ColorTheme } from '@/context/ThemeContext';
import AuthPopup from './AuthPopup';

// Color configurations for each theme
const themeColors: Record<ColorTheme, { primary: string; secondary: string; shadow: string; gradient: string }> = {
  purple: {
    primary: '#a855f7',
    secondary: '#7c3aed',
    shadow: 'rgba(168, 85, 247, 0.4)',
    gradient: 'linear-gradient(45deg, #7c3aed 0%, #a855f7 100%)'
  },
  blue: {
    primary: '#3b82f6',
    secondary: '#2563eb',
    shadow: 'rgba(59, 130, 246, 0.4)',
    gradient: 'linear-gradient(45deg, #2563eb 0%, #3b82f6 100%)'
  },
  gold: {
    primary: '#f59e0b',
    secondary: '#d97706',
    shadow: 'rgba(245, 158, 11, 0.4)',
    gradient: 'linear-gradient(45deg, #d97706 0%, #f59e0b 100%)'
  },
  green: {
    primary: '#10b981',
    secondary: '#059669',
    shadow: 'rgba(16, 185, 129, 0.4)',
    gradient: 'linear-gradient(45deg, #059669 0%, #10b981 100%)'
  },
  pink: {
    primary: '#ec4899',
    secondary: '#db2777',
    shadow: 'rgba(236, 72, 153, 0.4)',
    gradient: 'linear-gradient(45deg, #db2777 0%, #ec4899 100%)'
  }
};

const AuthGatePopup: React.FC = () => {
  const { isAuthGateOpen, closeAuthGate, authGateTheme, resetActionCount } = useAuthGate();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const colors = themeColors[authGateTheme];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close gate when user authenticates
  useEffect(() => {
    if (user && isAuthGateOpen) {
      resetActionCount();
      closeAuthGate();
      setShowAuthPopup(false);
    }
  }, [user, isAuthGateOpen, closeAuthGate, resetActionCount]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthGateOpen && !showAuthPopup) {
        closeAuthGate();
      }
    };
    if (isAuthGateOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isAuthGateOpen, showAuthPopup, closeAuthGate]);

  if (!mounted || !isAuthGateOpen) return null;

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthPopup(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setShowAuthPopup(true);
  };

  const handleCloseAuthPopup = () => {
    setShowAuthPopup(false);
  };

  const handleToggleMode = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
  };

  const popupContent = (
    <>
      <StyledWrapper
        $primaryColor={colors.primary}
        $secondaryColor={colors.secondary}
        $shadowColor={colors.shadow}
        $gradient={colors.gradient}
      >
        <div className="modal-backdrop" onClick={closeAuthGate} />
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="container">
            <button className="close-btn" onClick={closeAuthGate} aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            
            <h2 className="heading">Sign In Required</h2>
            <p className="message">
              You&apos;ve used your free action! Sign in or create an account to continue using all features.
            </p>
            
            <div className="benefits">
              <div className="benefit-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Unlimited generations</span>
              </div>
              <div className="benefit-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Export in all formats</span>
              </div>
              <div className="benefit-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Save your creations</span>
              </div>
            </div>
            
            <div className="button-group">
              <button className="primary-btn" onClick={handleSignUp}>
                Create Free Account
              </button>
              <button className="secondary-btn" onClick={handleSignIn}>
                Sign In
              </button>
            </div>
            
            <p className="footer-text">
              Free forever • No credit card required
            </p>
          </div>
        </div>
      </StyledWrapper>
      
      {showAuthPopup && (
        <AuthPopup
          isOpen={showAuthPopup}
          onClose={handleCloseAuthPopup}
          mode={authMode}
          onToggleMode={handleToggleMode}
          themeOverride={authGateTheme}
        />
      )}
    </>
  );

  return createPortal(popupContent, document.body);
};

interface StyledWrapperProps {
  $primaryColor: string;
  $secondaryColor: string;
  $shadowColor: string;
  $gradient: string;
}

const StyledWrapper = styled.div<StyledWrapperProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99998;
  display: flex;
  align-items: center;
  justify-content: center;

  .modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
  }

  .modal-container {
    position: relative;
    z-index: 1;
    animation: popIn 0.3s ease;
  }

  @keyframes popIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #27272a;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 10;
    color: #a1a1aa;
  }

  .close-btn:hover {
    transform: scale(1.1);
    background: #52525b;
    color: #fff;
  }

  .container {
    position: relative;
    max-width: 380px;
    background: #18181b;
    background: linear-gradient(0deg, #18181b 0%, #27272a 100%);
    border-radius: 24px;
    padding: 40px 35px;
    border: 2px solid #3f3f46;
    box-shadow: ${props => props.$shadowColor} 0px 30px 60px -20px;
    margin: 20px;
    text-align: center;
  }

  .icon-container {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background: ${props => props.$gradient};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .heading {
    font-weight: 700;
    font-size: 24px;
    color: #fff;
    margin-bottom: 12px;
  }

  .message {
    color: #a1a1aa;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 24px;
  }

  .benefits {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 28px;
  }

  .benefit-item {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #d4d4d8;
    font-size: 13px;
    justify-content: center;
  }

  .benefit-item svg {
    color: ${props => props.$primaryColor};
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .primary-btn {
    width: 100%;
    padding: 14px 24px;
    background: ${props => props.$gradient};
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .primary-btn:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$shadowColor} 0px 15px 30px -10px;
  }

  .secondary-btn {
    width: 100%;
    padding: 14px 24px;
    background: transparent;
    border: 2px solid #3f3f46;
    border-radius: 12px;
    color: #d4d4d8;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .secondary-btn:hover {
    border-color: ${props => props.$primaryColor};
    color: ${props => props.$primaryColor};
  }

  .footer-text {
    margin-top: 20px;
    color: #71717a;
    font-size: 12px;
  }
`;

export default AuthGatePopup;
