// src/components/layout/Sidebar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, ShoppingCart, Building2,
  Users, Package, Briefcase, UserCheck,
  ChevronLeft, ChevronRight, Store
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { path: '/dashboard',  label: 'Dashboard',     icon: LayoutDashboard },
  { path: '/invoice',    label: 'Invoice',        icon: FileText },
  { path: '/purchase',   label: 'Purchase Entry', icon: ShoppingCart },
  { path: '/vendor',     label: 'Vendor Khata',   icon: Building2 },
  { divider: true, label: 'MASTER DATA' },
  { path: '/customers',  label: 'Customers',      icon: Users },
  { path: '/products',   label: 'Products',       icon: Package },
  { path: '/companies',  label: 'Companies',      icon: Briefcase },
  { path: '/salesmen',   label: 'Salesmen',       icon: UserCheck },
  { path: '/stock',      label: 'Stock Report',   icon: Package },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { isDark } = useTheme();

  return (
    <aside
      className={`
        relative flex flex-col h-screen transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-56'}
        ${isDark
          ? 'bg-[#1e293b] border-r border-[#334155]'
          : 'bg-white border-r border-slate-200 shadow-sm'}
      `}
    >
      {/* ── Logo ── */}
      <div className={`
        flex items-center gap-3 px-4 py-4 border-b
        ${isDark ? 'border-[#334155]' : 'border-slate-200'}
      `}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg">
          <Store size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className={`text-sm font-700 leading-tight truncate
              ${isDark ? 'text-white' : 'text-slate-800'}`}>
              MA Traders
            </p>
            <p className={`text-xs truncate
              ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Inventory System
            </p>
          </div>
        )}
      </div>

      {/* ── Nav Items ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item, i) => {
          if (item.divider) {
            return !collapsed ? (
              <div key={i} className="pt-4 pb-1 px-2">
                <p className={`text-[10px] font-600 tracking-widest uppercase
                  ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {item.label}
                </p>
              </div>
            ) : (
              <div key={i} className={`my-2 border-t ${isDark ? 'border-[#334155]' : 'border-slate-200'}`} />
            );
          }

          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                transition-all duration-150 group relative
                ${isActive
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : isDark
                    ? 'text-slate-400 hover:bg-[#2d3f55] hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }
              `}
            >
              <Icon size={17} className="flex-shrink-0" />
              {!collapsed && (
                <span className="truncate font-medium">{item.label}</span>
              )}
              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className={`
                  absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap
                  opacity-0 group-hover:opacity-100 pointer-events-none z-50
                  transition-opacity duration-150
                  ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-800 text-white'}
                `}>
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Collapse Toggle Button ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`
          absolute -right-3 top-20 z-10 w-6 h-6 rounded-full flex items-center justify-center
          border transition-colors duration-200 shadow-md
          ${isDark
            ? 'bg-[#1e293b] border-[#334155] text-slate-400 hover:text-white'
            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'}
        `}
      >
        {collapsed
          ? <ChevronRight size={12} />
          : <ChevronLeft size={12} />
        }
      </button>

      {/* ── Bottom Version ── */}
      {!collapsed && (
        <div className={`px-4 py-3 border-t text-xs
          ${isDark ? 'border-[#334155] text-slate-500' : 'border-slate-200 text-slate-400'}`}>
          v1.0.0 • MA Traders
        </div>
      )}
    </aside>
  );
}
