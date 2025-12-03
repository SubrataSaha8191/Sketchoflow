'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '@/context/AuthContext';
import { useTheme, ColorTheme } from '@/context/ThemeContext';
import { updateUserAvatar, removeUserAvatar } from '@/lib/firebase';

const colorThemes: Record<ColorTheme, { primary: string; text: string; glow: string; gradient: string }> = {
  purple: {
    primary: '#a855f7',
    text: '#c084fc',
    glow: '#a855f7',
    gradient: 'linear-gradient(to right, #5b21b6, #a855f7)'
  },
  blue: {
    primary: '#3b82f6',
    text: '#93c5fd',
    glow: '#3b82f6',
    gradient: 'linear-gradient(to right, #1e40af, #3b82f6)'
  },
  gold: {
    primary: '#f59e0b',
    text: '#ffd277',
    glow: '#fbbf24',
    gradient: 'linear-gradient(to right, #77530a, #ffd277)'
  },
  green: {
    primary: '#22c55e',
    text: '#86efac',
    glow: '#22c55e',
    gradient: 'linear-gradient(to right, #166534, #22c55e)'
  },
  pink: {
    primary: '#ec4899',
    text: '#f9a8d4',
    glow: '#ec4899',
    gradient: 'linear-gradient(to right, #9d174d, #ec4899)'
  }
};

const UserProfileMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const { buttonTheme } = useTheme();
  const theme = colorThemes[buttonTheme];
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (!user) return null;

  // Check if user signed in with social auth (has photoURL from provider)
  const isSocialAuth = user.providerData.some(
    provider => ['google.com', 'facebook.com', 'github.com'].includes(provider.providerId)
  );

  // Get profile photo URL - check user.photoURL first, then provider data, then use default
  const getProfilePhotoUrl = (): string | null => {
    // If user has a custom uploaded photo, use it
    if (user.photoURL) return user.photoURL;
    
    // Check provider data for social auth photos
    for (const provider of user.providerData) {
      if (provider.photoURL) return provider.photoURL;
    }
    
    // For email/password users without a photo, use default profile image
    if (!isSocialAuth) return '/Profile.jpg';
    
    return null;
  };

  const profilePhotoUrl = getProfilePhotoUrl();

  const handleAvatarClick = () => {
    setIsOpen(!isOpen);
  };

  const handleUpdateAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const { error } = await updateUserAvatar(file);
      if (error) {
        alert(error);
      }
    } catch {
      alert('Failed to update avatar');
    } finally {
      setIsUploading(false);
      setIsOpen(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploading(true);
    try {
      const { error } = await removeUserAvatar();
      if (error) {
        alert(error);
      }
    } catch {
      alert('Failed to remove avatar');
    } finally {
      setIsUploading(false);
      setIsOpen(false);
    }
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  return (
    <StyledWrapper ref={menuRef} $primary={theme.primary} $text={theme.text} $glow={theme.glow} $gradient={theme.gradient}>
      <button className="avatar-button" onClick={handleAvatarClick} disabled={isUploading}>
        {profilePhotoUrl ? (
          <img src={profilePhotoUrl} alt="Profile" className="avatar-image" referrerPolicy="no-referrer" />
        ) : (
          <div className="avatar-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        )}
        {isUploading && <div className="loading-overlay"><span className="spinner"></span></div>}
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="user-info">
            <span className="user-name">{user.displayName || 'User'}</span>
            <span className="user-email">{user.email}</span>
          </div>
          <div className="menu-divider" />
          <button className="menu-item" onClick={handleUpdateAvatar} disabled={isUploading}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Update Avatar
          </button>
          {profilePhotoUrl && profilePhotoUrl !== '/Profile.jpg' && (
            <button className="menu-item danger" onClick={handleRemoveAvatar} disabled={isUploading}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Remove Avatar
            </button>
          )}
          <div className="menu-divider" />
          <button className="menu-item danger" onClick={handleSignOut}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign Out
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden-input"
      />
    </StyledWrapper>
  );
};

interface StyledWrapperProps {
  $primary: string;
  $text: string;
  $glow: string;
  $gradient: string;
}

const StyledWrapper = styled.div<StyledWrapperProps>`
  position: relative;

  .avatar-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid ${props => props.$glow}60;
    background: transparent;
    cursor: pointer;
    padding: 0;
    overflow: hidden;
    transition: all 0.3s ease;
    position: relative;
  }

  .avatar-button:hover {
    border-color: ${props => props.$primary};
    box-shadow: 0 0 15px ${props => props.$glow}40;
    transform: scale(1.05);
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    background: ${props => props.$gradient};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .loading-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top-color: ${props => props.$primary};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: #18181b;
    border: 1px solid #3f3f46;
    border-radius: 12px;
    min-width: 200px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    z-index: 1000;
    overflow: hidden;
    animation: slideDown 0.2s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .user-info {
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .user-name {
    color: #fff;
    font-size: 14px;
    font-weight: 600;
  }

  .user-email {
    color: #71717a;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .menu-divider {
    height: 1px;
    background: #3f3f46;
    margin: 4px 0;
  }

  .menu-item {
    width: 100%;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: transparent;
    border: none;
    color: #a1a1aa;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .menu-item:hover {
    background: ${props => props.$primary}20;
    color: ${props => props.$text};
  }

  .menu-item:hover svg {
    color: ${props => props.$primary};
  }

  .menu-item.danger:hover {
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
  }

  .menu-item.danger:hover svg {
    color: #ef4444;
  }

  .menu-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .hidden-input {
    display: none;
  }
`;

export default UserProfileMenu;
