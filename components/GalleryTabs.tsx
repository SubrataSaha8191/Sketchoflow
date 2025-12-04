import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface GalleryTabsProps {
  tabs: { key: string; label: string }[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

interface TabProps {
  children: React.ReactNode;
  tabKey: string;
  isActive: boolean;
  onClick: () => void;
  setPosition: React.Dispatch<React.SetStateAction<{ left: number; width: number; opacity: number }>>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const Tab: React.FC<TabProps> = ({ children, tabKey, isActive, onClick, setPosition, containerRef }) => {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    // Hide the hover cursor when clicking
    setPosition(pv => ({ ...pv, opacity: 0 }));
    onClick();
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      onMouseEnter={() => {
        if (!ref?.current || !containerRef?.current) return;

        const { width } = ref.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const buttonRect = ref.current.getBoundingClientRect();

        setPosition({
          left: buttonRect.left - containerRect.left,
          width,
          opacity: 1,
        });
      }}
      className={`relative cursor-pointer px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap rounded-full border ${
        isActive 
          ? 'bg-black border-white/20 text-white' 
          : 'bg-zinc-800/50 border-white/10 text-gray-400'
      }`}
    >
      <span className="relative z-20 flex items-center gap-2 mix-blend-difference text-white">
        {children}
        {isActive && (
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
        )}
      </span>
    </button>
  );
};

interface CursorProps {
  position: { left: number; width: number; opacity: number };
}

const Cursor: React.FC<CursorProps> = ({ position }) => {
  return (
    <motion.div
      animate={{
        ...position,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="absolute z-10 h-8 rounded-full bg-white pointer-events-none"
      style={{ top: '50%', transform: 'translateY(-50%)' }}
    />
  );
};

const GalleryTabs: React.FC<GalleryTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <div
      ref={containerRef}
      onMouseLeave={() => {
        setPosition((pv) => ({
          ...pv,
          opacity: 0,
        }));
      }}
      className="relative flex gap-2 items-center"
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.key}
          tabKey={tab.key}
          isActive={activeTab === tab.key}
          onClick={() => onTabChange(tab.key)}
          setPosition={setPosition}
          containerRef={containerRef}
        >
          {tab.label}
        </Tab>
      ))}

      <Cursor position={position} />
    </div>
  );
};

export default GalleryTabs;