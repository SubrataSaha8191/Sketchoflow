'use client';

import React from 'react';
import styled from 'styled-components';
import { useTheme, ColorTheme } from '@/context/ThemeContext';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  disabled?: boolean;
  loading?: boolean;
  tags?: string[];
  onTagClick?: (tag: string) => void;
  className?: string;
}

const colorThemes: Record<ColorTheme, { gradient: string; accent: string; glow: string }> = {
  purple: { gradient: 'linear-gradient(to bottom right, #7e3ff2, #363636, #363636, #363636, #363636)', accent: '#a855f7', glow: 'rgba(168, 85, 247, 0.5)' },
  blue: { gradient: 'linear-gradient(to bottom right, #3b82f6, #363636, #363636, #363636, #363636)', accent: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' },
  gold: { gradient: 'linear-gradient(to bottom right, #fbbf24, #363636, #363636, #363636, #363636)', accent: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)' },
  green: { gradient: 'linear-gradient(to bottom right, #22c55e, #363636, #363636, #363636, #363636)', accent: '#22c55e', glow: 'rgba(34, 197, 94, 0.5)' },
  pink: { gradient: 'linear-gradient(to bottom right, #ec4899, #363636, #363636, #363636, #363636)', accent: '#ec4899', glow: 'rgba(236, 72, 153, 0.5)' }
};

const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  placeholder = "Imagine Something...✦˚",
  onSubmit,
  disabled = false,
  loading = false,
  tags,
  onTagClick,
  className
}) => {
  const { buttonTheme } = useTheme();
  const theme = colorThemes[buttonTheme];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && onSubmit && !disabled) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <StyledWrapper $gradient={theme.gradient} $accent={theme.accent} $glow={theme.glow} className={className}>
      <div className="container_chat_bot">
        <div className="container-chat-options">
          <div className="chat">
            <div className="chat-bot">
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
              />
            </div>
            <div className="options">
              <button 
                className="btn-submit" 
                onClick={onSubmit}
                disabled={disabled || loading}
                type="button"
              >
                <i>
                  {loading ? (
                    <svg className="animate-spin" viewBox="0 0 24 24" width={18} height={18}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 512 512">
                      <path fill="currentColor" d="M473 39.05a24 24 0 0 0-25.5-5.46L47.47 185h-.08a24 24 0 0 0 1 45.16l.41.13l137.3 58.63a16 16 0 0 0 15.54-3.59L422 80a7.07 7.07 0 0 1 10 10L226.66 310.26a16 16 0 0 0-3.59 15.54l58.65 137.38c.06.2.12.38.19.57c3.2 9.27 11.3 15.81 21.09 16.25h1a24.63 24.63 0 0 0 23-15.46L478.39 64.62A24 24 0 0 0 473 39.05" />
                    </svg>
                  )}
                </i>
              </button>
            </div>
          </div>
        </div>
        {tags && tags.length > 0 && (
          <div className="tags">
            {tags.map((tag, idx) => (
              <span 
                key={idx} 
                onClick={() => onTagClick?.(tag)}
                role="button"
                tabIndex={0}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ $gradient: string; $accent: string; $glow: string }>`
  .container_chat_bot {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .container_chat_bot .container-chat-options {
    position: relative;
    display: flex;
    background: ${props => props.$gradient};
    border-radius: 16px;
    padding: 1.5px;
    overflow: hidden;

    &::after {
      position: absolute;
      content: "";
      top: -10px;
      left: -10px;
      background: radial-gradient(
        ellipse at center,
        ${props => props.$accent},
        ${props => props.$glow},
        rgba(255, 255, 255, 0.1),
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0)
      );
      width: 30px;
      height: 30px;
      filter: blur(1px);
    }
  }

  .container_chat_bot .container-chat-options .chat {
    display: flex;
    flex-direction: column;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 15px;
    width: 100%;
    overflow: hidden;
  }

  .container_chat_bot .container-chat-options .chat .chat-bot {
    position: relative;
    display: flex;
  }

  .container_chat_bot .chat .chat-bot textarea {
    background-color: transparent;
    border-radius: 16px;
    border: none;
    width: 100%;
    min-height: 80px;
    color: #ffffff;
    font-family: inherit;
    font-size: 14px;
    font-weight: 400;
    padding: 12px 16px;
    resize: none;
    outline: none;

    &::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 5px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #555;
      cursor: pointer;
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
      transition: all 0.3s ease;
    }
    
    &:focus::placeholder {
      color: rgba(255, 255, 255, 0.2);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .container_chat_bot .chat .options {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    padding: 8px 12px;
  }

  .container_chat_bot .chat .options .btn-submit {
    display: flex;
    padding: 2px;
    background-image: linear-gradient(to top, #292929, #555555, #292929);
    border-radius: 10px;
    box-shadow: inset 0 6px 2px -4px rgba(255, 255, 255, 0.5);
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.15s ease;

    & i {
      width: 32px;
      height: 32px;
      padding: 7px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      backdrop-filter: blur(3px);
      color: #8b8b8b;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    & svg {
      transition: all 0.3s ease;
    }
    
    &:hover:not(:disabled) svg {
      color: ${props => props.$accent};
      filter: drop-shadow(0 0 5px ${props => props.$glow});
    }

    &:focus:not(:disabled) svg {
      color: ${props => props.$accent};
      filter: drop-shadow(0 0 5px ${props => props.$glow});
      transform: scale(1.2) rotate(45deg) translateX(-2px) translateY(1px);
    }

    &:active:not(:disabled) {
      transform: scale(0.92);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .container_chat_bot .tags {
    padding: 12px 0 0 0;
    display: flex;
    flex-wrap: wrap;
    color: #ffffff;
    font-size: 11px;
    gap: 6px;

    & span {
      padding: 6px 12px;
      background-color: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;

      &:hover {
        background-color: ${props => props.$accent}20;
        border-color: ${props => props.$accent}50;
        color: ${props => props.$accent};
      }
    }
  }
`;

export default PromptInput;
