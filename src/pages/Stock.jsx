// src/pages/Stock.jsx — Stock Report Page
import { useState, useEffect } from 'react';
import { Package, RefreshCw, AlertTriangle, TrendingUp, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Stock() {
  const { isDark } = useTheme();
  const [products,  setProducts]  = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search,    setSearch]    = useState('');
  const [filterCo,  setFilterCo]  = useState('');
  const [filterLow, setFilterLow] = useState(false);
  const [loading,   setLoading]   = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [p,c] = await Promise.all([api.get('/products'), api.get('/companies')]);
      setProducts(p.data.data||[]);
      setCompanies(c.data.data||[]);
    } catch { toast.error('Load fail'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCo     = !filterCo || String(p.company?._id||p.company) === filterCo;
    const matchLow    = !filterLow || p.stockUnits <= 10;
    return matchSearch && matchCo && matchLow;
  });

  const totalStock = filtered.reduce((s,p) => s+(p.stockUnits||0), 0);
  const lowStock   = filtered.filter(p => p.stockUnits <= 10).length;
  const totalValue = filtered.reduce((s,p) => s+((p.stockUnits||0)*(p.salePrice||0)), 0);

  const card = `rounded-xl border ${isDark?'bg-[#1e293b] border-[#334155]':'bg-white border-slate-200 shadow-sm'}`;
  const inp  = `px-3 py-1.5 rounded-lg text-xs outline-none border transition-colors
    ${isDark?'bg-[#0f172a] border-[#334155] text-white placeholder-slate-500 focus:border-orange-500':'bg-white border-slate-300 text-slate-800 focus:border-orange-400'}`;
  const sel  = `px-3 py-1.5 rounded-lg text-xs outline-none border appearance-none
    ${isDark?'bg-[#0f172a] border-[#334155] text-white':'bg-white border-slate-300 text-slate-800'}`;
  const th   = `px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider border-b
    ${isDark?'text-slate-400 border-[#334155] bg-[#0f172a]':'text-slate-500 border-slate-200 bg-slate-50'}`;
  const td   = `px-4 py-3 text-sm ${isDark?'text-slate-300':'text-slate-600'}`;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Products', value: filtered.length,            color:'text-blue-400',   bg:'bg-blue-500/10',   icon:Package },
          { label:'Total Stock',    value: totalStock+' pcs',          color:'text-green-400',  bg:'bg-green-500/10',  icon:TrendingUp },
          { label:'Low Stock Items',value: lowStock,                   color:'text-red-400',    bg:'bg-red-500/10',    icon:AlertTriangle },
          { label:'Stock Value',    value:'Rs. '+Number(totalValue).toLocaleString(), color:'text-orange-400', bg:'bg-orange-500/10', icon:Package },
        ].map(s => (
          <div key={s.label} className={`${card} p-4`}>
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={16} className={s.color}/>
            </div>
            <p className={`text-lg font-bold ${s.color}`}>{loading?'...':s.value}</p>
            <p className={`text-xs mt-0.5 ${isDark?'text-slate-400':'text-slate-500'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + Table */}
      <div className={card}>
        {/* Filter Bar */}
        <div className={`flex flex-wrap items-center gap-3 p-4 border-b
          ${isDark?'border-[#334155]':'border-slate-200'}`}>
          <div className="relative flex-1 min-w-[160px]">
            <Search size={13} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark?'text-slate-500':'text-slate-400'}`}/>
            <input className={`${inp} pl-8 w-full`} placeholder="Product search..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className={sel} value={filterCo} onChange={e=>setFilterCo(e.target.value)}>
            <option value="">All Companies</option>
            {companies.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <label className={`flex items-center gap-2 text-xs cursor-pointer
            ${isDark?'text-slate-400':'text-slate-600'}`}>
            <input type="checkbox" checked={filterLow} onChange={e=>setFilterLow(e.target.checked)}
              className="accent-orange-500 w-3.5 h-3.5"/>
            Low Stock Only
          </label>
          <button onClick={load}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border
              ${isDark?'border-[#334155] text-slate-400 hover:bg-[#2d3f55]':'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <RefreshCw size={11} className={loading?'animate-spin':''}/> Refresh
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <p className={`text-center py-10 text-sm ${isDark?'text-slate-500':'text-slate-400'}`}>Loading...</p>
          ) : filtered.length===0 ? (
            <p className={`text-center py-10 text-sm ${isDark?'text-slate-500':'text-slate-400'}`}>Koi product nahi</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  {['#','Product','Company','Purchase Rate','Sale Rate','Stock','Stock Value','Status'].map(h=>(
                    <th key={h} className={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p,i) => {
                  const isLow   = p.stockUnits <= 10;
                  const isOut   = p.stockUnits <= 0;
                  const stockVal= (p.stockUnits||0) * (p.salePrice||0);
                  return (
                    <tr key={p._id}
                      className={`border-b transition-colors
                        ${isLow && !isOut ? isDark?'bg-yellow-500/5':'bg-yellow-50/50' : ''}
                        ${isOut ? isDark?'bg-red-500/5':'bg-red-50/30' : ''}
                        ${isDark?`border-[#334155] hover:bg-[#2d3f55]`:`border-slate-100 hover:bg-orange-50/30`}`}>
                      <td className={`${td} text-xs ${isDark?'text-slate-500':'text-slate-400'}`}>{i+1}</td>
                      <td className={`${td} font-semibold ${isDark?'text-white':'text-slate-800'}`}>{p.name}</td>
                      <td className={td}>
                        <span className={`px-2 py-0.5 rounded-full text-xs
                          ${isDark?'bg-purple-500/15 text-purple-400':'bg-purple-100 text-purple-700'}`}>
                          {p.company?.name||'—'}
                        </span>
                      </td>
                      <td className={`${td} text-red-400`}>Rs. {Number(p.purchasePrice||0).toLocaleString()}</td>
                      <td className={`${td} text-green-400`}>Rs. {Number(p.salePrice||0).toLocaleString()}</td>
                      <td className={td}>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold
                          ${isOut
                            ? 'bg-red-500/20 text-red-400'
                            : isLow
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-green-500/15 text-green-400'}`}>
                          {p.stockUnits||0} pcs
                        </span>
                      </td>
                      <td className={`${td} font-medium ${isDark?'text-orange-400':'text-orange-600'}`}>
                        Rs. {Number(stockVal).toLocaleString()}
                      </td>
                      <td className={td}>
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/15 text-red-400 font-medium">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/15 text-yellow-400 font-medium">
                            ⚠ Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/15 text-green-400 font-medium">
                            ✓ Available
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer totals */}
        {!loading && filtered.length > 0 && (
          <div className={`flex flex-wrap gap-6 p-4 border-t text-xs
            ${isDark?'border-[#334155] text-slate-400':'border-slate-200 text-slate-500'}`}>
            <span>Total Items: <b className={isDark?'text-white':'text-slate-800'}>{filtered.length}</b></span>
            <span>Total Stock: <b className="text-blue-400">{totalStock} pcs</b></span>
            <span>Low/Out: <b className="text-red-400">{lowStock}</b></span>
            <span>Total Value: <b className="text-orange-400">Rs. {Number(totalValue).toLocaleString()}</b></span>
          </div>
        )}
      </div>
    </div>
  );
}
