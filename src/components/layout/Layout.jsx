// src/components/layout/Layout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';
import { useTheme } from '../../context/ThemeContext';

export default function Layout() {
  const { isDark } = useTheme();

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300
      ${isDark ? 'bg-[#0f172a]' : 'bg-slate-100'}`}>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Bar */}
        <Topbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
