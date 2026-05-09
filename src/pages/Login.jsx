// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Eye, EyeOff, LogIn, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

// Simple hardcoded auth (backend auth Step mein add ho sakta hai)
const USERS = [
  { username: 'admin',  password: 'admin123',  role: 'Admin'   },
  { username: 'trader', password: 'trader123', role: 'Manager' },
];

export default function Login() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [form,     setForm]     = useState({ username:'', password:'' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return toast.error('Username aur password daalen');

    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // Simulate API call

    const user = USERS.find(
      u => u.username === form.username && u.password === form.password
    );

    if (user) {
      localStorage.setItem('ma-traders-token', 'demo-token-' + user.role);
      localStorage.setItem('ma-traders-user',  JSON.stringify(user));
      toast.success(`Khush Aamdeed, ${user.role}! 👋`);
      navigate('/dashboard');
    } else {
      toast.error('Username ya password galat hai');
    }
    setLoading(false);
  };

  const inp = `w-full px-4 py-3 rounded-xl text-sm outline-none border transition-all duration-200
    ${isDark
      ? 'bg-[#0f172a] border-[#334155] text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20'
      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20'}`;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300
      ${isDark ? 'bg-[#0f172a]' : 'bg-slate-100'}`}>

      {/* Theme Toggle */}
      <button onClick={toggleTheme}
        className={`fixed top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs
          font-medium border transition-all duration-200
          ${isDark
            ? 'bg-[#1e293b] border-[#334155] text-yellow-400 hover:border-yellow-400/50'
            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
        {isDark ? <><Sun size={13}/> Light</> : <><Moon size={13}/> Dark</>}
      </button>

      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20
          ${isDark ? 'bg-orange-500' : 'bg-orange-300'}`}/>
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-10
          ${isDark ? 'bg-blue-500' : 'bg-blue-300'}`}/>
      </div>

      {/* Login Card */}
      <div className={`relative w-full max-w-sm rounded-2xl border shadow-2xl
        ${isDark
          ? 'bg-[#1e293b] border-[#334155] shadow-black/40'
          : 'bg-white border-slate-200 shadow-slate-200/80'}`}>

        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 rounded-t-2xl"/>

        <div className="p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600
              flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4">
              <Store size={28} className="text-white"/>
            </div>
            <h1 className={`text-xl font-bold ${isDark?'text-white':'text-slate-800'}`}>
              MA Traders
            </h1>
            <p className={`text-xs mt-1 ${isDark?'text-slate-400':'text-slate-500'}`}>
              Inventory & Billing System
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className={`block text-xs font-medium mb-1.5
                ${isDark?'text-slate-400':'text-slate-600'}`}>
                Username
              </label>
              <input
                type="text"
                className={inp}
                placeholder="apna username daalen"
                value={form.username}
                onChange={e => setForm(p=>({...p, username:e.target.value}))}
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div>
              <label className={`block text-xs font-medium mb-1.5
                ${isDark?'text-slate-400':'text-slate-600'}`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className={`${inp} pr-11`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p=>({...p, password:e.target.value}))}
                  autoComplete="current-password"
                />
                <button type="button"
                  onClick={() => setShowPass(p=>!p)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2
                    ${isDark?'text-slate-500 hover:text-slate-300':'text-slate-400 hover:text-slate-600'}`}>
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button type="submit" disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-sm text-white
                bg-gradient-to-r from-orange-500 to-orange-600
                hover:from-orange-600 hover:to-orange-700
                shadow-lg shadow-orange-500/25
                transition-all duration-200
                flex items-center justify-center gap-2
                disabled:opacity-70 disabled:cursor-not-allowed
                ${!loading ? 'hover:scale-[1.01] active:scale-[0.99]' : ''}`}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Login ho raha hai...
                </>
              ) : (
                <><LogIn size={15}/> Login karein</>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className={`mt-6 p-3 rounded-xl border text-xs
            ${isDark?'bg-[#0f172a] border-[#334155]':'bg-slate-50 border-slate-200'}`}>
            <p className={`font-semibold mb-2 ${isDark?'text-slate-300':'text-slate-700'}`}>
              Demo Credentials:
            </p>
            <div className="space-y-1">
              {USERS.map(u => (
                <div key={u.username}
                  className="flex justify-between cursor-pointer hover:opacity-80"
                  onClick={() => setForm({ username:u.username, password:u.password })}>
                  <span className={isDark?'text-slate-400':'text-slate-500'}>
                    {u.role}:
                  </span>
                  <span className="text-orange-400 font-mono">
                    {u.username} / {u.password}
                  </span>
                </div>
              ))}
            </div>
            <p className={`mt-2 ${isDark?'text-slate-600':'text-slate-400'}`}>
              👆 Click to auto-fill
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
