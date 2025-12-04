import React from 'react';
import styled from 'styled-components';

type ButtonVariant = 'blue' | 'pink' | 'purple' | 'green' | 'gold';

interface BlurButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
}

const variantColors: Record<ButtonVariant, { border: string; bg: string; shadow: string }> = {
  blue: { border: 'rgb(61, 106, 255)', bg: 'rgb(61, 106, 255)', shadow: 'rgba(0, 142, 236, 0.815)' },
  pink: { border: 'rgb(236, 72, 153)', bg: 'rgb(236, 72, 153)', shadow: 'rgba(236, 72, 153, 0.7)' },
  purple: { border: 'rgb(168, 85, 247)', bg: 'rgb(168, 85, 247)', shadow: 'rgba(168, 85, 247, 0.7)' },
  green: { border: 'rgb(34, 197, 94)', bg: 'rgb(34, 197, 94)', shadow: 'rgba(34, 197, 94, 0.7)' },
  gold: { border: 'rgb(251, 191, 36)', bg: 'rgb(251, 191, 36)', shadow: 'rgba(251, 191, 36, 0.7)' },
};

const BlurButton = ({ children = 'Sign In', onClick, variant = 'blue' }: BlurButtonProps) => {
  const colors = variantColors[variant];
  return (
    <StyledWrapper $borderColor={colors.border} $bgColor={colors.bg} $shadowColor={colors.shadow}>
      <button onClick={onClick}>
        {children}
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div<{ $borderColor: string; $bgColor: string; $shadowColor: string }>`
  button {
    position: relative;
    padding: 10px 20px;
    border-radius: 7px;
    border: 1px solid ${props => props.$borderColor};
    font-size: 14px;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 2px;
    background: transparent;
    color: #fff;
    overflow: hidden;
    box-shadow: 0 0 0 0 transparent;
    -webkit-transition: all 0.2s ease-in;
    -moz-transition: all 0.2s ease-in;
    transition: all 0.2s ease-in;
  }

  button:hover {
    background: ${props => props.$bgColor};
    box-shadow: 0 0 10px 3px ${props => props.$shadowColor};
    -webkit-transition: all 0.2s ease-out;
    -moz-transition: all 0.2s ease-out;
    transition: all 0.2s ease-out;
  }

  button:hover::before {
    -webkit-animation: sh02 0.5s 0s linear;
    -moz-animation: sh02 0.5s 0s linear;
    animation: sh02 0.5s 0s linear;
  }

  button::before {
    content: '';
    display: block;
    width: 0px;
    height: 86%;
    position: absolute;
    top: 7%;
    left: 0%;
    opacity: 0;
    background: #fff;
    box-shadow: 0 0 50px 30px #fff;
    -webkit-transform: skewX(-20deg);
    -moz-transform: skewX(-20deg);
    -ms-transform: skewX(-20deg);
    -o-transform: skewX(-20deg);
    transform: skewX(-20deg);
  }

  @keyframes sh02 {
    from {
      opacity: 0;
      left: 0%;
    }

    50% {
      opacity: 1;
    }

    to {
      opacity: 0;
      left: 100%;
    }
  }

  button:active {
    box-shadow: 0 0 0 0 transparent;
    -webkit-transition: box-shadow 0.2s ease-in;
    -moz-transition: box-shadow 0.2s ease-in;
    transition: box-shadow 0.2s ease-in;
  }`;

export default BlurButton;
