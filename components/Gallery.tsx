'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Images, X, Trash2, Download, ExternalLink, Filter, Loader2, Image as ImageIcon, Wand2, Upload, Zap, Film, Video, Play, Code } from 'lucide-react';
import { useTheme, ColorTheme } from '@/context/ThemeContext';
import GalleryTabs from './GalleryTabs';

export interface GalleryItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: 'generate' | 'sketch' | 'transform' | 'animation' | 'css' | 'svg' | 'gif' | 'video';
  prompt: string;
  createdAt: string;
  width?: number;
  height?: number;
  format?: string;
  code?: string; // For CSS/SVG animations
}

const colorThemes: Record<ColorTheme, { bg: string; border: string; text: string; glow: string; accent: string }> = {
  purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'hover:shadow-purple-500/20', accent: 'purple' },
  blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'hover:shadow-blue-500/20', accent: 'blue' },
  gold: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', glow: 'hover:shadow-yellow-500/20', accent: 'yellow' },
  green: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400', glow: 'hover:shadow-green-500/20', accent: 'green' },
  pink: { bg: 'bg-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-400', glow: 'hover:shadow-pink-500/20', accent: 'pink' }
};

const typeIcons: Record<GalleryItem['type'], React.ReactNode> = {
  generate: <ImageIcon className="w-4 h-4" />,
  sketch: <Wand2 className="w-4 h-4" />,
  transform: <Upload className="w-4 h-4" />,
  animation: <Play className="w-4 h-4" />,
  css: <Code className="w-4 h-4" />,
  svg: <Zap className="w-4 h-4" />,
  gif: <Film className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />
};

const typeLabels: Record<GalleryItem['type'], string> = {
  generate: 'Generated',
  sketch: 'Sketch',
  transform: 'Transform',
  animation: 'Animation',
  css: 'CSS',
  svg: 'SVG',
  gif: 'GIF',
  video: 'Video'
};

const typeColors: Record<GalleryItem['type'], string> = {
  generate: 'bg-purple-500',
  sketch: 'bg-blue-500',
  transform: 'bg-pink-500',
  animation: 'bg-cyan-500',
  css: 'bg-cyan-500',
  svg: 'bg-green-500',
  gif: 'bg-orange-500',
  video: 'bg-red-500'
};

// Local storage for gallery items (backup/cache)
const STORAGE_KEY = 'sketchoflow_gallery';

// Save to gallery (both local and Cloudinary)
export const saveToGallery = async (item: Omit<GalleryItem, 'id' | 'createdAt'>) => {
  try {
    // For CSS/SVG code animations, save to local storage only (no Cloudinary upload needed)
    if (item.type === 'css' || (item.type === 'svg' && item.code)) {
      const localItem = saveToLocalGallery({
        ...item,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      });
      window.dispatchEvent(new CustomEvent('galleryUpdated'));
      return localItem;
    }

    // Save to Cloudinary only if it's a real HTTP URL (not data URLs)
    if (item.url && item.url.startsWith('http')) {
      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: item.url,
          type: item.type,
          prompt: item.prompt,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Also save to local storage as cache
        saveToLocalGallery({
          ...item,
          id: data.data.id,
          url: data.data.url,
          thumbnailUrl: data.data.thumbnailUrl,
          createdAt: data.data.createdAt,
        });
        window.dispatchEvent(new CustomEvent('galleryUpdated'));
        return data.data;
      }
    }

    // Fallback to local storage for data URLs or any other content
    const localItem = saveToLocalGallery({
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
    window.dispatchEvent(new CustomEvent('galleryUpdated'));
    return localItem;
  } catch (error) {
    console.error('Failed to save to gallery:', error);
    // Fallback to local storage
    const localItem = saveToLocalGallery({
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
    window.dispatchEvent(new CustomEvent('galleryUpdated'));
    return localItem;
  }
};

const saveToLocalGallery = (item: GalleryItem) => {
  if (typeof window === 'undefined') return item;
  
  const items = getLocalGallery();
  const updatedItems = [item, ...items].slice(0, 100); // Keep last 100
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
  return item;
};

const getLocalGallery = (): GalleryItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const clearGallery = async () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('galleryUpdated'));
};

interface GalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ isOpen, onClose }) => {
  const { buttonTheme } = useTheme();
  const theme = colorThemes[buttonTheme];
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<GalleryItem['type'] | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    let cloudinaryItems: GalleryItem[] = [];
    
    try {
      // Try to fetch from Cloudinary first
      const response = await fetch(`/api/gallery?limit=50${filter !== 'all' ? `&type=${filter}` : ''}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          cloudinaryItems = data.data;
        }
      }
    } catch (error) {
      console.error('Failed to fetch from Cloudinary:', error);
    }

    // Get local storage items
    let localItems = getLocalGallery();
    if (filter !== 'all') {
      localItems = localItems.filter(item => item.type === filter);
    }

    // Merge Cloudinary and local items, removing duplicates (prefer Cloudinary version)
    const cloudinaryIds = new Set(cloudinaryItems.map(item => item.id));
    const uniqueLocalItems = localItems.filter(item => !cloudinaryIds.has(item.id));
    const allItems = [...cloudinaryItems, ...uniqueLocalItems];
    
    // Sort by creation date (newest first)
    allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setItems(allItems);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    if (isOpen) {
      fetchGallery();
    }
  }, [isOpen, fetchGallery]);

  useEffect(() => {
    const handleUpdate = () => fetchGallery();
    window.addEventListener('galleryUpdated', handleUpdate);
    return () => window.removeEventListener('galleryUpdated', handleUpdate);
  }, [fetchGallery]);

  const handleDelete = async (id: string) => {
    try {
      // Try to delete from Cloudinary
      await fetch(`/api/gallery?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete from Cloudinary:', error);
    }

    // Remove from local storage
    const localItems = getLocalGallery().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localItems));
    
    setItems(prev => prev.filter(item => item.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleDownload = async (item: GalleryItem) => {
    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sketchoflow-${item.type}-${Date.now()}.${item.format || 'png'}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-200"
        onClick={onClose}
      />
      
      {/* Main Popup */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-4xl h-[80vh] max-h-[700px] bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-201 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${theme.bg} ${theme.border} border`}>
              <Images className={`w-5 h-5 ${theme.text}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Gallery</h3>
              <p className="text-xs text-gray-500">{items.length} creations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-white/5 overflow-x-auto shrink-0">
          <Filter className="w-4 h-4 text-gray-500 shrink-0" />
          <GalleryTabs
            tabs={[
              { key: 'all', label: 'All' },
              { key: 'generate', label: 'Generated' },
              { key: 'sketch', label: 'Sketch' },
              { key: 'transform', label: 'Transform' },
              { key: 'css', label: 'CSS' },
              { key: 'svg', label: 'SVG' },
              { key: 'gif', label: 'GIF' },
              { key: 'video', label: 'Video' },
            ]}
            activeTab={filter}
            onTabChange={(key) => setFilter(key as GalleryItem['type'] | 'all')}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className={`w-8 h-8 ${theme.text} animate-spin`} />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Images className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400 mb-2">No creations yet</p>
              <p className="text-sm text-gray-500">Your generated images and animations will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-square bg-zinc-800 rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Thumbnail */}
                  {item.type === 'svg' && item.code ? (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-zinc-800 to-zinc-900 p-4">
                      <div dangerouslySetInnerHTML={{ __html: item.code }} className="w-full h-full flex items-center justify-center" />
                    </div>
                  ) : item.type === 'css' ? (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-zinc-800 to-zinc-900">
                      <Code className="w-12 h-12 text-gray-500" />
                    </div>
                  ) : (
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.prompt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}

                  {/* Type Badge */}
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium text-white ${typeColors[item.type]}`}>
                    {typeLabels[item.type]}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <p className="text-xs text-white line-clamp-2 mb-1">{item.prompt || 'No prompt'}</p>
                    <p className="text-[10px] text-gray-400">{formatDate(item.createdAt)}</p>
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                      className="p-1.5 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="p-1.5 bg-black/50 hover:bg-red-500/70 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 z-300"
            onClick={() => setSelectedItem(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-3xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-301 overflow-hidden">
            {/* Image/Preview */}
            <div className="relative aspect-video bg-zinc-950 flex items-center justify-center">
              {selectedItem.type === 'svg' && selectedItem.code ? (
                <div className="p-8 w-full h-full flex items-center justify-center" style={{ minHeight: '400px' }}>
                  <div 
                    className="svg-preview-modal"
                    dangerouslySetInnerHTML={{ __html: selectedItem.code }} 
                    style={{ width: '100%', maxWidth: '500px', maxHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                  />
                </div>
              ) : selectedItem.type === 'css' ? (
                <div className="p-8 w-full">
                  <pre className="text-xs text-gray-300 overflow-auto max-h-64">
                    <code>{selectedItem.code || 'Code preview not available'}</code>
                  </pre>
                </div>
              ) : selectedItem.type === 'video' ? (
                <video src={selectedItem.url} controls className="max-h-full max-w-full" />
              ) : (
                <img src={selectedItem.url} alt={selectedItem.prompt} className="max-h-full max-w-full object-contain" />
              )}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`p-1.5 rounded-lg ${theme.bg}`}>
                      {typeIcons[selectedItem.type]}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${typeColors[selectedItem.type]}`}>
                      {typeLabels[selectedItem.type]}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(selectedItem.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-300">{selectedItem.prompt || 'No prompt provided'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(selectedItem)}
                    className={`px-4 py-2 ${theme.bg} ${theme.border} border rounded-lg text-sm ${theme.text} hover:opacity-80 transition-opacity flex items-center gap-2`}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <a
                    href={selectedItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </a>
                </div>
              </div>

              {/* Metadata */}
              {(selectedItem.width || selectedItem.format) && (
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-white/5">
                  {selectedItem.width && selectedItem.height && (
                    <span>{selectedItem.width} × {selectedItem.height}</span>
                  )}
                  {selectedItem.format && <span className="uppercase">{selectedItem.format}</span>}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

// Gallery Button Component
interface GalleryButtonProps {
  onClick: () => void;
}

export const GalleryButton: React.FC<GalleryButtonProps> = ({ onClick }) => {
  const { buttonTheme } = useTheme();
  const theme = colorThemes[buttonTheme];
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const items = getLocalGallery();
      setItemCount(items.length);
    };
    
    updateCount();
    window.addEventListener('galleryUpdated', updateCount);
    return () => window.removeEventListener('galleryUpdated', updateCount);
  }, []);

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-lg ${theme.bg} ${theme.border} border hover:scale-105 transition-all duration-200 ${theme.glow} hover:shadow-lg`}
      title="Gallery"
    >
      <Images className={`w-5 h-5 ${theme.text}`} />
      {itemCount > 0 && (
        <span className={`absolute -top-1 -right-1 w-4 h-4 ${theme.bg} ${theme.border} border rounded-full text-[10px] font-bold ${theme.text} flex items-center justify-center`}>
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default Gallery;
