// src/components/ui/Card.jsx
import { useTheme } from '../../context/ThemeContext';

export default function Card({ children, className = '', title, action }) {
  const { isDark } = useTheme();

  return (
    <div className={`
      rounded-xl border transition-colors duration-300
      ${isDark
        ? 'bg-[#1e293b] border-[#334155] shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
        : 'bg-white border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.06)]'}
      ${className}
    `}>
      {(title || action) && (
        <div className={`flex items-center justify-between px-5 py-3.5 border-b
          ${isDark ? 'border-[#334155]' : 'border-slate-200'}`}>
          {title && (
            <h3 className={`text-sm font-semibold
              ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
