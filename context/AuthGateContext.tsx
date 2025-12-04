'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { ColorTheme } from './ThemeContext';

interface AuthGateContextType {
  // Track workspace actions
  actionCount: number;
  incrementAction: (theme?: ColorTheme) => boolean; // Returns true if action is allowed, false if auth required
  resetActionCount: () => void;
  
  // Auth gate popup state
  isAuthGateOpen: boolean;
  authGateTheme: ColorTheme;
  openAuthGate: (theme?: ColorTheme) => void;
  closeAuthGate: () => void;
  
  // Check if user can perform action (authenticated or first action)
  canPerformAction: () => boolean;
  
  // Require auth for specific actions (like export)
  requireAuth: (theme?: ColorTheme) => boolean; // Returns true if authenticated, shows popup if not
}

const AuthGateContext = createContext<AuthGateContextType>({
  actionCount: 0,
  incrementAction: () => true,
  resetActionCount: () => {},
  isAuthGateOpen: false,
  authGateTheme: 'purple',
  openAuthGate: () => {},
  closeAuthGate: () => {},
  canPerformAction: () => true,
  requireAuth: () => true,
});

export const useAuthGate = () => useContext(AuthGateContext);

export const AuthGateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [actionCount, setActionCount] = useState(0);
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false);
  const [authGateTheme, setAuthGateTheme] = useState<ColorTheme>('purple');

  // Check if user can perform action
  const canPerformAction = useCallback(() => {
    // Authenticated users can always perform actions
    if (user) return true;
    // Non-authenticated users can perform first action only
    return actionCount === 0;
  }, [user, actionCount]);

  // Increment action count and check if auth is required
  const incrementAction = useCallback((theme: ColorTheme = 'purple') => {
    // Authenticated users can always proceed
    if (user) {
      setActionCount(prev => prev + 1);
      return true;
    }
    
    // First action is free
    if (actionCount === 0) {
      setActionCount(1);
      return true;
    }
    
    // Second action requires auth - use provided theme
    setAuthGateTheme(theme);
    setIsAuthGateOpen(true);
    return false;
  }, [user, actionCount]);

  // Reset action count (called when user signs in)
  const resetActionCount = useCallback(() => {
    setActionCount(0);
  }, []);

  // Open auth gate popup
  const openAuthGate = useCallback((theme: ColorTheme = 'purple') => {
    setAuthGateTheme(theme);
    setIsAuthGateOpen(true);
  }, []);

  // Close auth gate popup
  const closeAuthGate = useCallback(() => {
    setIsAuthGateOpen(false);
  }, []);

  // Require auth for specific actions (export, etc.)
  const requireAuth = useCallback((theme: ColorTheme = 'purple') => {
    if (user) return true;
    setAuthGateTheme(theme);
    setIsAuthGateOpen(true);
    return false;
  }, [user]);

  return (
    <AuthGateContext.Provider
      value={{
        actionCount,
        incrementAction,
        resetActionCount,
        isAuthGateOpen,
        authGateTheme,
        openAuthGate,
        closeAuthGate,
        canPerformAction,
        requireAuth,
      }}
    >
      {children}
    </AuthGateContext.Provider>
  );
};

export default AuthGateContext;
