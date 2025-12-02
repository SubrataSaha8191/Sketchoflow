import React from 'react';
import styled from 'styled-components';

interface StartFreeProps {
  text?: string;
  onClick?: () => void;
}

const StartFree: React.FC<StartFreeProps> = ({ text = 'Subscribe', onClick }) => {
  return (
    <StyledWrapper>
      <button className="button" onClick={onClick}>
        {text}
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .button {
    cursor: pointer;
    position: relative;
    padding: 10px 24px;
    font-size: 18px;
    color: rgb(193, 163, 98);
    border: 2px solid rgb(193, 163, 98);
    border-radius: 34px;
    background-color: transparent;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
    overflow: hidden;
  }

  .button::before {
    content: '';
    position: absolute;
    inset: 0;
    margin: auto;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    scale: 0;
    z-index: -1;
    background-color: rgb(193, 163, 98);
    transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
  }

  .button:hover::before {
    scale: 1;
  }

  .button:hover {
    color: #212121;
    scale: 1.05;
    box-shadow: 0 0px 20px rgba(193, 163, 98,0.4);
  }

  .button:active {
    scale: 1;
  }`;

export default StartFree;
