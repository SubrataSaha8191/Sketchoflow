import React from 'react';
import styled from 'styled-components';

const Button = () => {
  return (
    <StyledWrapper>
      <div className="button-wrapper">
        <svg style={{position: 'absolute', width: 0, height: 0}}>
          <filter width="300%" x="-100%" height="300%" y="-100%" id="unopaq">
            <feColorMatrix values="1 0 0 0 0 
            0 1 0 0 0 
            0 0 1 0 0 
            0 0 0 9 0" />
          </filter>
          <filter width="300%" x="-100%" height="300%" y="-100%" id="unopaq2">
            <feColorMatrix values="1 0 0 0 0 
            0 1 0 0 0 
            0 0 1 0 0 
            0 0 0 3 0" />
          </filter>
          <filter width="300%" x="-100%" height="300%" y="-100%" id="unopaq3">
            <feColorMatrix values="1 0 0 0.2 0 
            0 1 0 0.2 0 
            0 0 1 0.2 0 
            0 0 0 2 0" />
          </filter>
        </svg>
        <button className="real-button" />
        <div className="button-container">
          <div className="spin spin-blur" />
          <div className="spin spin-intense" />
          <div className="button-border">
            <div className="spin spin-inside" />
            <div className="button">Get Started →</div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: inline-block;
  
  .button-wrapper {
    position: relative;
    border-radius: 14px;
  }

  .button-container {
    position: relative;
  }

  .button-border {
    padding: 2px;
    inset: 0;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.6), rgba(236, 72, 153, 0.6), rgba(139, 92, 246, 0.6));
    background-size: 200% 200%;
    animation: gradient-shift 4s ease infinite;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 
      0 0 15px rgba(139, 92, 246, 0.4),
      0 0 30px rgba(236, 72, 153, 0.2),
      inset 0 0 10px rgba(255, 255, 255, 0.1);
    transition: box-shadow 0.3s ease;
  }

  .button-wrapper:hover .button-border {
    box-shadow: 
      0 0 20px rgba(139, 92, 246, 0.6),
      0 0 40px rgba(236, 72, 153, 0.4),
      0 0 60px rgba(139, 92, 246, 0.2),
      inset 0 0 15px rgba(255, 255, 255, 0.15);
  }

  .button {
    justify-content: center;
    align-items: center;
    border: none;
    border-radius: 12px;
    width: 180px;
    height: 52px;
    background: linear-gradient(135deg, rgba(17, 17, 23, 0.98), rgba(30, 25, 40, 0.98));
    display: flex;
    flex-direction: column;
    color: #fff;
    overflow: hidden;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
  }

  .button-wrapper:hover .button {
    color: #fff;
    text-shadow: 
      0 0 8px rgba(255, 255, 255, 0.5),
      0 0 15px rgba(139, 92, 246, 0.4);
  }

  .real-button {
    position: absolute;
    width: 180px;
    height: 52px;
    z-index: 1;
    outline: none;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    opacity: 0;
  }

  .spin {
    position: absolute;
    inset: 0;
    z-index: -2;
    opacity: 0.3;
    overflow: hidden;
    transition: opacity 0.4s ease;
  }

  .real-button:hover ~ div .spin {
    opacity: 0.8;
  }

  .real-button:active ~ div .spin {
    opacity: 1;
  }

  .spin-blur {
    filter: blur(10px);
    border-radius: 14px;
  }

  .spin-intense {
    inset: -2px;
    filter: blur(4px);
    border-radius: 14px;
  }

  .spin-inside {
    inset: -1px;
    border-radius: inherit;
    filter: blur(2px);
    z-index: 0;
  }

  .spin::before {
    content: "";
    position: absolute;
    inset: -150%;
    animation:
      speen 6s cubic-bezier(0.56, 0.15, 0.28, 0.86) infinite,
      woah 3s infinite;
  }

  .real-button:hover ~ div .spin::before {
    animation-play-state: running;
  }

  .spin-blur::before {
    background: linear-gradient(90deg, #8b5cf6 30%, transparent 50%, #ec4899 70%);
  }

  .spin-intense::before {
    background: linear-gradient(90deg, #a78bfa 25%, transparent 45% 55%, #f472b6 75%);
  }

  .spin-inside::before {
    background: linear-gradient(90deg, #c4b5fd 30%, transparent 45% 55%, #fbcfe8 70%);
  }

  @keyframes speen {
    0% {
      rotate: 10deg;
    }
    50% {
      rotate: 190deg;
    }
    to {
      rotate: 370deg;
    }
  }

  @keyframes woah {
    0%, to {
      scale: 1;
    }
    50% {
      scale: 0.85;
    }
  }

  @keyframes gradient-shift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

export default Button;
