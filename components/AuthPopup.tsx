import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { useTheme, ColorTheme } from '../context/ThemeContext';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  signInWithFacebook, 
  signInWithGithub,
  resetPassword 
} from '../lib/firebase';

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
  themeOverride?: ColorTheme;
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

const AuthPopup: React.FC<AuthPopupProps> = ({ isOpen, onClose, mode, onToggleMode, themeOverride }) => {
  const [mounted, setMounted] = useState(false);
  const { buttonTheme } = useTheme();
  const colors = themeColors[themeOverride || buttonTheme];
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset form when mode changes
  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [mode]);

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

  // Handle email/password auth
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const { user, error } = await signUpWithEmail(email, password, name);
      if (error) {
        setError(error);
      } else if (user) {
        setSuccess('Account created successfully!');
        setTimeout(() => onClose(), 1500);
      }
    } else {
      const { user, error } = await signInWithEmail(email, password);
      if (error) {
        setError(error);
      } else if (user) {
        setSuccess('Signed in successfully!');
        setTimeout(() => onClose(), 1500);
      }
    }
    setLoading(false);
  };

  // Handle social auth
  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    const { user, error } = await signInWithGoogle();
    if (error) {
      setError(error);
    } else if (user) {
      setSuccess('Signed in with Google!');
      setTimeout(() => onClose(), 1500);
    }
    setLoading(false);
  };

  const handleFacebookAuth = async () => {
    setError(null);
    setLoading(true);
    const { user, error } = await signInWithFacebook();
    if (error) {
      setError(error);
    } else if (user) {
      setSuccess('Signed in with Facebook!');
      setTimeout(() => onClose(), 1500);
    }
    setLoading(false);
  };

  const handleGithubAuth = async () => {
    setError(null);
    setLoading(true);
    const { user, error } = await signInWithGithub();
    if (error) {
      setError(error);
    } else if (user) {
      setSuccess('Signed in with GitHub!');
      setTimeout(() => onClose(), 1500);
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    setError(null);
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      setError(error);
    } else {
      setSuccess('Password reset email sent! Check your inbox.');
    }
    setLoading(false);
  };

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
          
          {/* Error/Success Messages */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form className="form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <input 
                required 
                className="input" 
                type="text" 
                name="name" 
                id="name" 
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            )}
            <input 
              required 
              className="input" 
              type="email" 
              name="email" 
              id="email" 
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <div className="password-wrapper">
              <input 
                required 
                className="input" 
                type={showPassword ? "text" : "password"}
                name="password" 
                id="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button 
                type="button" 
                className="eye-button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {mode === 'signup' && (
              <div className="password-wrapper">
                <input 
                  required 
                  className="input" 
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword" 
                  id="confirmPassword" 
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="eye-button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            )}
            {mode === 'signin' && (
              <span className="forgot-password">
                <button type="button" onClick={handleForgotPassword} disabled={loading}>
                  Forgot Password?
                </button>
              </span>
            )}
            <button 
              className="login-button" 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
            </button>
          </form>
          <div className="social-account-container">
            <span className="title">Or {mode === 'signin' ? 'Sign in' : 'Sign up'} with</span>
            <div className="social-accounts">
              <button 
                className="social-button google" 
                type="button" 
                onClick={handleGoogleAuth}
                disabled={loading}
                title="Continue with Google"
              >
                <svg className="svg" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 488 512">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                </svg>
              </button>
              <button 
                className="social-button facebook" 
                type="button"
                onClick={handleFacebookAuth}
                disabled={loading}
                title="Continue with Facebook"
              >
                <svg className="svg" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                  <path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5V334.2H141.4V256h52.8V222.3c0-87.1 39.4-127.5 125-127.5c16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1c-42 0-58.2 15.9-58.2 57.2V256h83.6l-14.4 78.2H287V510.1C413.8 494.8 512 386.9 512 256z" />
                </svg>
              </button>
              <button 
                className="social-button github" 
                type="button"
                onClick={handleGithubAuth}
                disabled={loading}
                title="Continue with GitHub"
              >
                <svg className="svg" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 496 512">
                  <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
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

  .error-message {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fca5a5;
    padding: 10px 15px;
    border-radius: 12px;
    font-size: 12px;
    margin-top: 15px;
    text-align: center;
  }

  .success-message {
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: #86efac;
    padding: 10px 15px;
    border-radius: 12px;
    font-size: 12px;
    margin-top: 15px;
    text-align: center;
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

  .form .password-wrapper {
    position: relative;
    width: 100%;
  }

  .form .password-wrapper .input {
    padding-right: 45px;
  }

  .form .eye-button {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    margin-top: 7.5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #71717a;
    transition: color 0.2s ease;
  }

  .form .eye-button:hover {
    color: ${props => props.$primaryColor};
  }

  .form .forgot-password {
    display: block;
    margin-top: 10px;
    margin-left: 10px;
  }

  .form .forgot-password button {
    font-size: 11px;
    color: ${props => props.$primaryColor};
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .form .forgot-password button:hover {
    text-decoration: underline;
  }

  .form .forgot-password button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

  .form .login-button:hover:not(:disabled) {
    transform: scale(1.03);
    box-shadow: ${props => props.$shadowColor.replace('0.4', '0.5')} 0px 23px 10px -20px;
  }

  .form .login-button:active:not(:disabled) {
    transform: scale(0.95);
    box-shadow: ${props => props.$shadowColor} 0px 15px 10px -10px;
  }

  .form .login-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
    cursor: pointer;
  }

  .social-account-container .social-accounts .social-button .svg {
    fill: #a1a1aa;
    margin: auto;
  }

  .social-account-container .social-accounts .social-button:hover:not(:disabled) {
    transform: scale(1.2);
  }

  .social-account-container .social-accounts .social-button:hover:not(:disabled) .svg {
    fill: #fff;
  }

  .social-account-container .social-accounts .social-button:active:not(:disabled) {
    transform: scale(0.9);
  }

  .social-account-container .social-accounts .social-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .social-account-container .social-accounts .social-button.google:hover:not(:disabled) .svg {
    fill: #ea4335;
  }

  .social-account-container .social-accounts .social-button.facebook:hover:not(:disabled) .svg {
    fill: #1877f2;
  }

  .social-account-container .social-accounts .social-button.github:hover:not(:disabled) .svg {
    fill: #fff;
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
