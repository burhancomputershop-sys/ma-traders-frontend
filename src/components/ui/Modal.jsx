// src/components/ui/Modal.jsx
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const { isDark } = useTheme();

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Box */}
      <div className={`
        relative w-full ${sizes[size]} rounded-xl shadow-2xl z-10
        ${isDark
          ? 'bg-[#1e293b] border border-[#334155]'
          : 'bg-white border border-slate-200'}
      `}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b
          ${isDark ? 'border-[#334155]' : 'border-slate-200'}`}>
          <h3 className={`text-sm font-semibold
            ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors
              ${isDark
                ? 'text-slate-400 hover:bg-[#334155] hover:text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
