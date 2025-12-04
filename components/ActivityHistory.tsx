'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Image, Wand2, Upload, Zap, Film, Video, X, Trash2, Play } from 'lucide-react';
import { useTheme, ColorTheme } from '@/context/ThemeContext';

export interface Activity {
  id: string;
  type: 'generate' | 'sketch' | 'transform' | 'animation' | 'css' | 'svg' | 'gif' | 'video';
  prompt: string;
  timestamp: Date;
  result?: string; // URL or code snippet preview
}

const colorThemes: Record<ColorTheme, { bg: string; border: string; text: string; glow: string }> = {
  purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'hover:shadow-purple-500/20' },
  blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'hover:shadow-blue-500/20' },
  gold: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', glow: 'hover:shadow-yellow-500/20' },
  green: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400', glow: 'hover:shadow-green-500/20' },
  pink: { bg: 'bg-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-400', glow: 'hover:shadow-pink-500/20' }
};

const typeIcons: Record<Activity['type'], React.ReactNode> = {
  generate: <Image className="w-4 h-4" />,
  sketch: <Wand2 className="w-4 h-4" />,
  transform: <Upload className="w-4 h-4" />,
  animation: <Play className="w-4 h-4" />,
  css: <Zap className="w-4 h-4" />,
  svg: <Zap className="w-4 h-4" />,
  gif: <Film className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />
};

const typeLabels: Record<Activity['type'], string> = {
  generate: 'Image Generation',
  sketch: 'Sketch Render',
  transform: 'Image Transform',
  animation: 'Animation',
  css: 'CSS Animation',
  svg: 'SVG Animation',
  gif: 'GIF Creation',
  video: 'Video Creation'
};

// Storage key for localStorage
const STORAGE_KEY = 'sketchoflow_activities';

// Helper functions for activity storage
export const saveActivity = (activity: Omit<Activity, 'id' | 'timestamp'>) => {
  if (typeof window === 'undefined') return;
  
  const activities = getActivities();
  const newActivity: Activity = {
    ...activity,
    id: Date.now().toString(),
    timestamp: new Date()
  };
  
  // Keep only last 50 activities
  const updatedActivities = [newActivity, ...activities].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedActivities));
  
  // Dispatch custom event to notify listeners
  window.dispatchEvent(new CustomEvent('activityUpdated'));
};

export const getActivities = (): Activity[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const activities = JSON.parse(stored);
    return activities.map((a: Activity) => ({
      ...a,
      timestamp: new Date(a.timestamp)
    }));
  } catch {
    return [];
  }
};

export const clearActivities = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('activityUpdated'));
};

interface ActivityHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ isOpen, onClose }) => {
  const { buttonTheme } = useTheme();
  const theme = colorThemes[buttonTheme];
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const loadActivities = () => {
      setActivities(getActivities());
    };

    loadActivities();
    
    // Listen for activity updates
    window.addEventListener('activityUpdated', loadActivities);
    return () => window.removeEventListener('activityUpdated', loadActivities);
  }, []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleClearAll = () => {
    clearActivities();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-200"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="fixed top-20 right-4 md:right-8 w-[90vw] max-w-md bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-201 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${theme.bg} ${theme.border} border`}>
              <Clock className={`w-5 h-5 ${theme.text}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Activity History</h3>
              <p className="text-xs text-gray-500">{activities.length} recent activities</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activities.length > 0 && (
              <button
                onClick={handleClearAll}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Activity List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {activities.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400 text-sm">No activities yet</p>
              <p className="text-gray-600 text-xs mt-1">Your recent generations will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${theme.glow} hover:shadow-lg`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${theme.bg} ${theme.border} border shrink-0`}>
                      <span className={theme.text}>{typeIcons[activity.type]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-medium ${theme.text}`}>
                          {typeLabels[activity.type]}
                        </span>
                        <span className="text-xs text-gray-500 shrink-0">
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                        {activity.prompt}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// History Button Component
export const HistoryButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { buttonTheme } = useTheme();
  const theme = colorThemes[buttonTheme];
  const [activityCount, setActivityCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setActivityCount(getActivities().length);
    };
    
    updateCount();
    window.addEventListener('activityUpdated', updateCount);
    return () => window.removeEventListener('activityUpdated', updateCount);
  }, []);

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-lg ${theme.bg} ${theme.border} border hover:scale-105 transition-all duration-200 ${theme.glow} hover:shadow-lg`}
      title="Activity History"
    >
      <Clock className={`w-5 h-5 ${theme.text}`} />
      {activityCount > 0 && (
        <span className={`absolute -top-1 -right-1 w-4 h-4 ${theme.bg} ${theme.border} border rounded-full text-[10px] font-bold ${theme.text} flex items-center justify-center`}>
          {activityCount > 9 ? '9+' : activityCount}
        </span>
      )}
    </button>
  );
};

export default ActivityHistory;
