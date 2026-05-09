// src/components/ui/Select.jsx
import { useTheme } from '../../context/ThemeContext';

export default function Select({
  label, value, onChange, options = [],
  name, required = false, disabled = false,
  placeholder = 'Select...', className = ''
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
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`
          w-full px-3 py-2 rounded-lg text-sm outline-none
          transition-colors duration-150 border appearance-none cursor-pointer
          ${isDark
            ? `bg-[#0f172a] border-[#334155] text-white
               focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20
               disabled:opacity-50`
            : `bg-white border-slate-300 text-slate-800
               focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20
               disabled:opacity-50`
          }
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  );
}
