// src/components/ui/Button.jsx
export default function Button({
  children, onClick, type = 'button',
  variant = 'orange', size = 'md',
  disabled = false, className = '', icon: Icon
}) {
  const base = `
    inline-flex items-center justify-center gap-2 font-medium rounded-lg
    transition-all duration-150 select-none cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-sm',
  };

  const variants = {
    orange: 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20',
    green:  'bg-green-500  hover:bg-green-600  text-white shadow-sm shadow-green-500/20',
    red:    'bg-red-500    hover:bg-red-600    text-white shadow-sm shadow-red-500/20',
    blue:   'bg-blue-500   hover:bg-blue-600   text-white shadow-sm',
    ghost:  'bg-transparent hover:bg-slate-700 text-slate-300 border border-slate-600',
    'ghost-light': 'bg-transparent hover:bg-slate-100 text-slate-600 border border-slate-300',
    outline:'border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}
