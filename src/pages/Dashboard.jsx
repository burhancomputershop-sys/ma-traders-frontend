// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ShoppingCart, TrendingUp, Package,
  Users, Building2, AlertCircle, Plus,
  ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

function StatCard({ title, value, subtitle, icon: Icon, color, trend }) {
  const { isDark } = useTheme();
  const colors = {
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', icon: 'text-orange-400' },
    green:  { bg: 'bg-green-500/10',  text: 'text-green-500',  icon: 'text-green-400'  },
    red:    { bg: 'bg-red-500/10',    text: 'text-red-500',    icon: 'text-red-400'    },
    blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-500',   icon: 'text-blue-400'   },
  };
  const c = colors[color] || colors.orange;
  return (
    <div className={`rounded-xl border p-5 transition-all duration-200 hover:scale-[1.01]
      ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon size={18} className={c.icon} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs flex items-center gap-0.5 font-medium
            ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold mb-0.5 ${c.text}`}>{value}</p>
      <p className={`text-xs font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-slate-700'}`}>{title}</p>
      {subtitle && <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    paid:    'bg-green-500/15 text-green-400 border border-green-500/20',
    partial: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
    pending: 'bg-red-500/15 text-red-400 border border-red-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || map.pending}`}>
      {status === 'paid' ? 'Paid' : status === 'partial' ? 'Partial' : 'Pending'}
    </span>
  );
}

function QuickAction({ label, icon: Icon, color, onClick }) {
  const colors = {
    orange: 'bg-orange-500 hover:bg-orange-600',
    green:  'bg-green-500  hover:bg-green-600',
    blue:   'bg-blue-500   hover:bg-blue-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
  };
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-white text-xs
        font-medium transition-all duration-150 w-full shadow-md ${colors[color]}`}>
      <Icon size={14} />{label}
    </button>
  );
}

export default function Dashboard() {
  const { isDark } = useTheme();
  const navigate   = useNavigate();
  const [loading, setLoading]   = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats]       = useState({
    totalInvoices:0, todayInvoices:0, totalSales:0,
    outstanding:0, totalProducts:0, totalCustomers:0,
    totalCompanies:0, lowStock:0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, prodRes, custRes, compRes] = await Promise.all([
        api.get('/invoices?limit=50'),
        api.get('/products'),
        api.get('/customers'),
        api.get('/companies'),
      ]);
      const allInvoices  = invRes.data.data  || [];
      const allProducts  = prodRes.data.data || [];
      const allCustomers = custRes.data.data || [];
      const allCompanies = compRes.data.data || [];

      const today = new Date(); today.setHours(0,0,0,0);
      const todayInv  = allInvoices.filter(i => new Date(i.date||i.createdAt) >= today);
      const totalSales= allInvoices.reduce((s,i) => s+(i.grandTotal||0), 0);
      const outstanding=allInvoices.reduce((s,i) => s+(i.outstanding||0), 0);
      const lowStock  = allProducts.filter(p => p.stockUnits <= 10).length;

      setInvoices(allInvoices.slice(0,8));
      setStats({
        totalInvoices:  allInvoices.length,
        todayInvoices:  todayInv.length,
        totalSales, outstanding,
        totalProducts:  allProducts.length,
        totalCustomers: allCustomers.length,
        totalCompanies: allCompanies.length,
        lowStock,
      });
    } catch { toast.error('Data load nahi ho saka'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const fmt = (n) => `Rs. ${Number(n||0).toLocaleString('en-PK')}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Khush Aamdeed
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {new Date().toLocaleDateString('en-PK',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
          </p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border
            transition-colors ${isDark
              ? 'border-[#334155] text-slate-400 hover:text-white hover:bg-[#2d3f55]'
              : 'border-slate-200 text-slate-500 hover:bg-slate-100'}
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Aaj ki Invoices" value={loading?'...':stats.todayInvoices}
          subtitle={`Kul: ${stats.totalInvoices}`} icon={FileText}  color="orange" trend={12}/>
        <StatCard title="Total Sales"     value={loading?'...':fmt(stats.totalSales)}
          subtitle="Sab invoices"              icon={TrendingUp}   color="green"  trend={8}/>
        <StatCard title="Outstanding"     value={loading?'...':fmt(stats.outstanding)}
          subtitle="Baqi raqam"               icon={AlertCircle}  color="red"    trend={-3}/>
        <StatCard title="Products"        value={loading?'...':stats.totalProducts}
          subtitle={`Low: ${stats.lowStock}`} icon={Package}      color="blue"/>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Invoices Table */}
        <div className={`lg:col-span-2 rounded-xl border
          ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className={`flex items-center justify-between px-5 py-3.5 border-b
            ${isDark ? 'border-[#334155]' : 'border-slate-200'}`}>
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Recent Invoices
            </h3>
            <button onClick={() => navigate('/invoice')}
              className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1 font-medium">
              Sab dekho <ArrowUpRight size={12}/>
            </button>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <p className={`p-8 text-center text-sm ${isDark?'text-slate-500':'text-slate-400'}`}>Loading...</p>
            ) : invoices.length === 0 ? (
              <p className={`p-8 text-center text-sm ${isDark?'text-slate-500':'text-slate-400'}`}>
                Koi invoice nahi — pehli invoice banayein!
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className={isDark ? 'bg-[#0f172a]' : 'bg-slate-50'}>
                    {['Invoice #','Customer','Amount','Cash','Status'].map(h => (
                      <th key={h} className={`px-4 py-2.5 text-left font-semibold uppercase
                        tracking-wider border-b
                        ${isDark?'text-slate-400 border-[#334155]':'text-slate-500 border-slate-200'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv,i) => (
                    <tr key={inv._id} className={`border-b transition-colors
                      ${isDark
                        ? `border-[#334155] ${i%2===0?'':'bg-[#1a2840]'} hover:bg-[#2d3f55]`
                        : `border-slate-100 ${i%2===0?'':'bg-slate-50/50'} hover:bg-orange-50/30`}`}>
                      <td className={`px-4 py-2.5 font-mono ${isDark?'text-orange-400':'text-orange-500'}`}>
                        {inv.invoiceNo}
                      </td>
                      <td className={`px-4 py-2.5 ${isDark?'text-slate-300':'text-slate-700'}`}>
                        {inv.customerName||'—'}
                      </td>
                      <td className={`px-4 py-2.5 font-medium ${isDark?'text-white':'text-slate-800'}`}>
                        {fmt(inv.grandTotal)}
                      </td>
                      <td className={`px-4 py-2.5 ${isDark?'text-green-400':'text-green-600'}`}>
                        {fmt(inv.cashReceived)}
                      </td>
                      <td className="px-4 py-2.5"><StatusBadge status={inv.status}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className={`rounded-xl border p-4
            ${isDark?'bg-[#1e293b] border-[#334155]':'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className={`text-sm font-semibold mb-3 ${isDark?'text-white':'text-slate-800'}`}>
              Quick Actions
            </h3>
            <div className="space-y-2">
              <QuickAction label="New Invoice"    icon={Plus}         color="orange" onClick={()=>navigate('/invoice')}  />
              <QuickAction label="Purchase Entry" icon={ShoppingCart} color="green"  onClick={()=>navigate('/purchase')} />
              <QuickAction label="Vendor Payment" icon={Building2}    color="blue"   onClick={()=>navigate('/vendor')}   />
              <QuickAction label="Add Customer"   icon={Users}        color="purple" onClick={()=>navigate('/customers')}/>
            </div>
          </div>

          {/* Summary */}
          <div className={`rounded-xl border p-4
            ${isDark?'bg-[#1e293b] border-[#334155]':'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className={`text-sm font-semibold mb-2 ${isDark?'text-white':'text-slate-800'}`}>
              Summary
            </h3>
            {[
              {label:'Customers', value:stats.totalCustomers, color:'text-blue-400'},
              {label:'Companies', value:stats.totalCompanies, color:'text-purple-400'},
              {label:'Products',  value:stats.totalProducts,  color:'text-green-400'},
              {label:'Low Stock', value:stats.lowStock,       color:'text-red-400'},
            ].map(item => (
              <div key={item.label}
                className={`flex items-center justify-between py-2 border-b last:border-0
                  ${isDark?'border-[#334155]':'border-slate-100'}`}>
                <span className={`text-xs ${isDark?'text-slate-400':'text-slate-500'}`}>{item.label}</span>
                <span className={`text-sm font-bold ${item.color}`}>
                  {loading?'...':item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
