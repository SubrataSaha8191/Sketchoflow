'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ResultModalProps {
  isOpen: boolean;
  image: string | null;
  onClose: () => void;
  alt?: string;
}

const ResultModal: React.FC<ResultModalProps> = ({ isOpen, image, onClose, alt = 'Result image' }) => {
  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
      
      window.addEventListener('keydown', handleEscKey);
    }

    return () => {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !image) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-9998 bg-black/95 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
        {/* Card */}
        <div 
          className="relative max-w-5xl w-full max-h-[90vh] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
            <h3 className="text-lg font-semibold text-white">Result Preview</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="Close (ESC)"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Image Container */}
          <div className="flex-1 overflow-auto flex items-center justify-center bg-black/50">
            <img 
              src={image} 
              alt={alt}
              className="max-w-full max-h-full object-contain p-4"
            />
          </div>

          {/* Footer with Instructions */}
          <div className="px-6 py-3 border-t border-white/5 bg-zinc-950/50 text-center text-xs text-gray-500 shrink-0">
            Press <span className="text-white font-medium">ESC</span> or click the close button to dismiss
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultModal;
