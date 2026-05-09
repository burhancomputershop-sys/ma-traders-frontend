// src/components/ui/Input.jsx
import { useTheme } from '../../context/ThemeContext';

export default function Input({
  label, value, onChange, placeholder = '',
  type = 'text', name, required = false,
  disabled = false, className = '', readOnly = false
}) {
  const { isDark } = useTheme();

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className={`text-xs font-medium
          ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        className={`
          w-full px-3 py-2 rounded-lg text-sm outline-none
          transition-colors duration-150 border
          ${readOnly ? 'cursor-default' : ''}
          ${isDark
            ? `bg-[#0f172a] border-[#334155] text-white placeholder-slate-500
               focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20
               disabled:opacity-50 read-only:bg-[#1e293b]`
            : `bg-white border-slate-300 text-slate-800 placeholder-slate-400
               focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20
               disabled:opacity-50 read-only:bg-slate-50`
          }
        `}
      />
    </div>
  );
}
