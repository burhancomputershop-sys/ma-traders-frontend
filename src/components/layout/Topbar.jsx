// src/components/layout/Topbar.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const pageTitles = {
  '/dashboard': { title:'Dashboard',       subtitle:'Overview & Summary'   },
  '/invoice':   { title:'Invoice System',  subtitle:'MA Traders'           },
  '/purchase':  { title:'Purchase Entry',  subtitle:'Stock In'             },
  '/vendor':    { title:'Vendor Khata',    subtitle:'Payment Ledger'       },
  '/customers': { title:'Customers',       subtitle:'Manage Customers'     },
  '/products':  { title:'Products',        subtitle:'Manage Products'      },
  '/companies': { title:'Companies',       subtitle:'Manage Companies'     },
  '/salesmen':  { title:'Salesmen',        subtitle:'Manage Salesmen'      },
  '/stock':     { title:'Stock Report',    subtitle:'Inventory Overview'   },
};

export default function Topbar() {
  const { isDark, toggleTheme } = useTheme();
  const location  = useNavigate ? useLocation() : { pathname:'' };
  const navigate  = useNavigate();
  const page      = pageTitles[location.pathname] || { title:'MA Traders', subtitle:'' };

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('ma-traders-user')||'{}'); }
    catch { return {}; }
  })();

  const handleLogout = () => {
    localStorage.removeItem('ma-traders-token');
    localStorage.removeItem('ma-traders-user');
    toast.success('Logout ho gaye');
    navigate('/login');
  };

  return (
    <header className={`flex items-center justify-between px-6 py-3 border-b flex-shrink-0
      ${isDark?'bg-[#1e293b] border-[#334155]':'bg-white border-slate-200 shadow-sm'}`}>
      {/* Left */}
      <div>
        <h1 className={`text-base font-semibold leading-tight ${isDark?'text-white':'text-slate-800'}`}>
          {page.title}
        </h1>
        <p className={`text-xs ${isDark?'text-slate-400':'text-slate-500'}`}>{page.subtitle}</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <span className={`text-xs hidden sm:block ${isDark?'text-slate-400':'text-slate-500'}`}>
          {new Date().toLocaleDateString('en-PK',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}
        </span>

        {/* Theme Toggle */}
        <button onClick={toggleTheme}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200
            ${isDark?'bg-[#0f172a] border-[#334155] text-yellow-400 hover:border-yellow-400/50':'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300'}`}>
          {isDark ? <><Sun size={13}/><span className="hidden sm:inline">Light</span></>
                  : <><Moon size={13}/><span className="hidden sm:inline">Dark</span></>}
        </button>

        {/* User + Logout */}
        <div className="flex items-center gap-2">
          <div className={`hidden sm:flex flex-col items-end ${isDark?'text-slate-300':'text-slate-700'}`}>
            <span className="text-xs font-semibold">{user.username||'Admin'}</span>
            <span className={`text-xs ${isDark?'text-slate-500':'text-slate-400'}`}>{user.role||'User'}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shadow cursor-pointer">
            {(user.username||'A').charAt(0).toUpperCase()}
          </div>
          <button onClick={handleLogout} title="Logout"
            className={`p-2 rounded-lg transition-colors ${isDark?'text-slate-400 hover:bg-red-500/10 hover:text-red-400':'text-slate-500 hover:bg-red-50 hover:text-red-500'}`}>
            <LogOut size={15}/>
          </button>
        </div>
      </div>
    </header>
  );
}
