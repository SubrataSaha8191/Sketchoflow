'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ColorTheme = 'purple' | 'blue' | 'gold' | 'green' | 'pink';

interface ThemeContextType {
  buttonTheme: ColorTheme;
  setButtonTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [buttonTheme, setButtonTheme] = useState<ColorTheme>('purple');

  return (
    <ThemeContext.Provider value={{ buttonTheme, setButtonTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export type { ColorTheme };
