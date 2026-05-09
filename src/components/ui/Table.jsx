// src/components/ui/Table.jsx
import { useTheme } from '../../context/ThemeContext';

export default function Table({ columns = [], rows = [], emptyMsg = 'Koi data nahi' }) {
  const { isDark } = useTheme();

  return (
    <div className="w-full overflow-x-auto rounded-lg">
      <table className="w-full text-sm border-collapse">
        {/* Head */}
        <thead>
          <tr className={isDark ? 'bg-[#0f172a]' : 'bg-slate-50'}>
            {columns.map((col, i) => (
              <th
                key={i}
                className={`
                  px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider
                  border-b whitespace-nowrap
                  ${isDark ? 'text-slate-400 border-[#334155]' : 'text-slate-500 border-slate-200'}
                `}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={`px-4 py-8 text-center text-sm
                  ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
              >
                {emptyMsg}
              </td>
            </tr>
          ) : (
            rows.map((row, ri) => (
              <tr
                key={ri}
                className={`
                  border-b transition-colors duration-100
                  ${isDark
                    ? `border-[#334155] ${ri % 2 === 0 ? 'bg-[#1e293b]' : 'bg-[#1a2840]'} hover:bg-[#2d3f55]`
                    : `border-slate-100 ${ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-orange-50/30`}
                `}
              >
                {columns.map((col, ci) => (
                  <td
                    key={ci}
                    className={`px-4 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
