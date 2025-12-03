import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { useTheme, ColorTheme } from '../context/ThemeContext';

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
}

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

const AuthPopup: React.FC<AuthPopupProps> = ({ isOpen, onClose, mode, onToggleMode }) => {
  const [mounted, setMounted] = useState(false);
  const { buttonTheme } = useTheme();
  const colors = themeColors[buttonTheme];

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const popupContent = (
    <StyledWrapper 
      $primaryColor={colors.primary}
      $secondaryColor={colors.secondary}
      $shadowColor={colors.shadow}
      $gradient={colors.gradient}
    >
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="container">
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="heading">{mode === 'signin' ? 'Sign In' : 'Sign Up'}</div>
          <form className="form" onSubmit={(e) => e.preventDefault()}>
            {mode === 'signup' && (
              <input required className="input" type="text" name="name" id="name" placeholder="Full Name" />
            )}
            <input required className="input" type="email" name="email" id="email" placeholder="E-mail" />
            <input required className="input" type="password" name="password" id="password" placeholder="Password" />
            {mode === 'signup' && (
              <input required className="input" type="password" name="confirmPassword" id="confirmPassword" placeholder="Confirm Password" />
            )}
            {mode === 'signin' && (
              <span className="forgot-password"><a href="#">Forgot Password ?</a></span>
            )}
            <input className="login-button" type="submit" value={mode === 'signin' ? 'Sign In' : 'Sign Up'} />
          </form>
          <div className="social-account-container">
            <span className="title">Or {mode === 'signin' ? 'Sign in' : 'Sign up'} with</span>
            <div className="social-accounts">
              <button className="social-button google" type="button">
                <svg className="svg" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 488 512">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                </svg>
              </button>
              <button className="social-button apple" type="button">
                <svg className="svg" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
              </button>
              <button className="social-button twitter" type="button">
                <svg className="svg" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                  <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="toggle-mode">
            {mode === 'signin' ? (
              <span>Don&apos;t have an account? <button type="button" onClick={onToggleMode}>Sign Up</button></span>
            ) : (
              <span>Already have an account? <button type="button" onClick={onToggleMode}>Sign In</button></span>
            )}
          </div>
          <span className="agreement"><a href="#">Learn user licence agreement</a></span>
        </div>
      </div>
    </StyledWrapper>
  );

  // Use portal to render at document body level
  return createPortal(popupContent, document.body);
}

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
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-container {
    position: relative;
    z-index: 1;
    animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-100px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #3f3f46;
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
    max-width: 350px;
    background: #18181b;
    background: linear-gradient(0deg, #18181b 0%, #27272a 100%);
    border-radius: 40px;
    padding: 25px 35px;
    border: 2px solid #3f3f46;
    box-shadow: ${props => props.$shadowColor} 0px 30px 30px -20px;
    margin: 20px;
  }

  .heading {
    text-align: center;
    font-weight: 900;
    font-size: 30px;
    color: ${props => props.$primaryColor};
  }

  .form {
    margin-top: 20px;
  }

  .form .input {
    width: 100%;
    background: #27272a;
    border: none;
    padding: 15px 20px;
    border-radius: 20px;
    margin-top: 15px;
    box-shadow: ${props => props.$shadowColor.replace('0.4', '0.15')} 0px 10px 10px -5px;
    border-inline: 2px solid transparent;
    color: #fff;
  }

  .form .input::-moz-placeholder {
    color: #71717a;
  }

  .form .input::placeholder {
    color: #71717a;
  }

  .form .input:focus {
    outline: none;
    border-inline: 2px solid ${props => props.$primaryColor};
  }

  .form .forgot-password {
    display: block;
    margin-top: 10px;
    margin-left: 10px;
  }

  .form .forgot-password a {
    font-size: 11px;
    color: ${props => props.$primaryColor};
    text-decoration: none;
  }

  .form .login-button {
    display: block;
    width: 100%;
    font-weight: bold;
    background: ${props => props.$gradient};
    color: white;
    padding-block: 15px;
    margin: 20px auto;
    border-radius: 20px;
    box-shadow: ${props => props.$shadowColor} 0px 20px 10px -15px;
    border: none;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
  }

  .form .login-button:hover {
    transform: scale(1.03);
    box-shadow: ${props => props.$shadowColor.replace('0.4', '0.5')} 0px 23px 10px -20px;
  }

  .form .login-button:active {
    transform: scale(0.95);
    box-shadow: ${props => props.$shadowColor} 0px 15px 10px -10px;
  }

  .social-account-container {
    margin-top: 25px;
  }

  .social-account-container .title {
    display: block;
    text-align: center;
    font-size: 10px;
    color: #71717a;
  }

  .social-account-container .social-accounts {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 5px;
  }

  .social-account-container .social-accounts .social-button {
    background: linear-gradient(45deg, #3f3f46 0%, #52525b 100%);
    border: 3px solid #27272a;
    padding: 5px;
    border-radius: 50%;
    width: 40px;
    aspect-ratio: 1;
    display: grid;
    place-content: center;
    box-shadow: ${props => props.$shadowColor.replace('0.4', '0.2')} 0px 12px 10px -8px;
    transition: all 0.2s ease-in-out;
  }

  .social-account-container .social-accounts .social-button .svg {
    fill: #a1a1aa;
    margin: auto;
  }

  .social-account-container .social-accounts .social-button:hover {
    transform: scale(1.2);
  }

  .social-account-container .social-accounts .social-button:hover .svg {
    fill: #fff;
  }

  .social-account-container .social-accounts .social-button:active {
    transform: scale(0.9);
  }

  .agreement {
    display: block;
    text-align: center;
    margin-top: 15px;
  }

  .agreement a {
    text-decoration: none;
    color: ${props => props.$primaryColor};
    font-size: 9px;
  }

  .toggle-mode {
    text-align: center;
    margin-top: 15px;
    font-size: 12px;
    color: #a1a1aa;
  }

  .toggle-mode button {
    background: none;
    border: none;
    color: ${props => props.$primaryColor};
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    padding: 0;
    margin-left: 4px;
  }

  .toggle-mode button:hover {
    text-decoration: underline;
  }
`;

export default AuthPopup;
