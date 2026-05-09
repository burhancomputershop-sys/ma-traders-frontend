// src/pages/VendorKhata.jsx — Vendor Payment & Ledger System
import { useState, useEffect } from 'react';
import { Save, RefreshCw, Building2, Trash2, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const fmt  = (n) => `Rs. ${Number(n||0).toLocaleString('en-PK')}`;
const fmtD = (d) => new Date(d).toLocaleDateString('en-PK',{ day:'2-digit', month:'short', year:'numeric' });
const fmtT = (d) => new Date(d).toLocaleTimeString('en-PK',{ hour:'2-digit', minute:'2-digit' });

const NOTES = ['Purchase Payment','Advance Payment','Partial Payment','Full Settlement','Credit Note','Other'];

export default function VendorKhata() {
  const { isDark } = useTheme();

  const [companies,   setCompanies]   = useState([]);
  const [payments,    setPayments]    = useState([]);
  const [selCompany,  setSelCompany]  = useState('');
  const [companyData, setCompanyData] = useState(null);
  const [cashPaid,    setCashPaid]    = useState('');
  const [note,        setNote]        = useState('');
  const [date,        setDate]        = useState(new Date().toISOString().split('T')[0]);
  const [saving,      setSaving]      = useState(false);
  const [filterComp,  setFilterComp]  = useState('');

  // ── Load data ──
  const loadData = async () => {
    try {
      const [co, py] = await Promise.all([
        api.get('/companies'),
        api.get('/payments?limit=200'),
      ]);
      setCompanies(co.data.data || []);
      setPayments( py.data.data || []);
    } catch { toast.error('Data load fail'); }
  };

  useEffect(() => { loadData(); }, []);

  // ── Company select → load balance ──
  const handleCompanySelect = (id) => {
    setSelCompany(id);
    setCashPaid('');
    const c = companies.find(x => x._id === id);
    setCompanyData(c || null);
  };

  // ── Save Payment ──
  const handleSave = async () => {
    if (!selCompany)              return toast.error('Company select karein');
    if (!cashPaid || cashPaid<=0) return toast.error('Amount daalen');
    if (parseFloat(cashPaid) > (companyData?.balance||0))
      return toast.error('Payment balance se zyada nahi ho sakti');

    setSaving(true);
    try {
      const res = await api.post('/payments', {
        company:     selCompany,
        companyName: companyData?.name,
        cashPaid:    parseFloat(cashPaid),
        note:        note || 'Payment',
        date,
      });
      toast.success('Payment save ho gayi! ✅');

      // Update local company balance
      setCompanies(prev => prev.map(c =>
        c._id === selCompany
          ? { ...c, balance: res.data.data.balanceAfter }
          : c
      ));
      setCompanyData(prev => prev ? { ...prev, balance: res.data.data.balanceAfter } : null);
      setPayments(prev => [res.data.data, ...prev]);
      setCashPaid('');
      setNote('');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save fail');
    } finally { setSaving(false); }
  };

  // ── Full Settle ──
  const handleFullSettle = () => {
    if (companyData?.balance > 0) setCashPaid(String(companyData.balance));
  };

  // ── Delete Payment ──
  const handleDelete = async (id) => {
    if (!window.confirm('Payment delete karein?')) return;
    try {
      await api.delete(`/payments/${id}`);
      setPayments(prev => prev.filter(p => p._id !== id));
      toast.success('Delete ho gayi');
      loadData(); // Reload to get fresh balances
    } catch { toast.error('Delete fail'); }
  };

  // ── Filtered payments ──
  const filteredPayments = filterComp
    ? payments.filter(p => p.company === filterComp || p.companyName === filterComp)
    : payments;

  // ── Total paid (filtered) ──
  const totalPaid = filteredPayments.reduce((s,p) => s+(p.cashPaid||0), 0);

  // ── Styles ──
  const card = `rounded-xl border p-4 ${isDark?'bg-[#1e293b] border-[#334155]':'bg-white border-slate-200 shadow-sm'}`;
  const inp  = `w-full px-3 py-2 rounded-lg text-sm outline-none border transition-colors
    ${isDark
      ? 'bg-[#0f172a] border-[#334155] text-white placeholder-slate-500 focus:border-orange-500'
      : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-orange-400'}`;
  const sel  = `w-full px-3 py-2 rounded-lg text-sm outline-none border appearance-none
    ${isDark
      ? 'bg-[#0f172a] border-[#334155] text-white focus:border-orange-500'
      : 'bg-white border-slate-300 text-slate-800 focus:border-orange-400'}`;
  const lbl  = `block text-xs font-medium mb-1.5 ${isDark?'text-slate-400':'text-slate-600'}`;
  const th   = `px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider border-b
    ${isDark?'text-slate-400 border-[#334155] bg-[#0f172a]':'text-slate-500 border-slate-200 bg-slate-50'}`;
  const td   = `px-4 py-2.5 text-xs ${isDark?'text-slate-300':'text-slate-600'}`;

  return (
    <div className="space-y-4">

      {/* ── TOP ROW: Payment Form + Company Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Payment Form ── */}
        <div className={`lg:col-span-2 ${card}`}>
          <h3 className={`text-sm font-semibold mb-4 ${isDark?'text-white':'text-slate-800'}`}>
            Vendor Payment
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Select */}
            <div>
              <label className={lbl}>Company Select *</label>
              <select className={sel} value={selCompany}
                onChange={e => handleCompanySelect(e.target.value)}>
                <option value="">-- Company chunein --</option>
                {companies.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.balance > 0 ? `— Rs. ${Number(c.balance).toLocaleString()}` : '✓'}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className={lbl}>Date</label>
              <input type="date" className={inp} value={date}
                onChange={e => setDate(e.target.value)} />
            </div>

            {/* Balance to Pay (auto) */}
            <div>
              <label className={lbl}>Balance to Pay</label>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border
                ${isDark
                  ? 'bg-[#0f172a] border-[#334155]'
                  : 'bg-slate-50 border-slate-200'}`}>
                <AlertCircle size={14} className={
                  companyData?.balance > 0 ? 'text-red-400' : 'text-green-400'
                }/>
                <span className={`text-sm font-bold
                  ${companyData?.balance > 0
                    ? isDark ? 'text-red-400' : 'text-red-600'
                    : isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {companyData ? fmt(companyData.balance) : 'Company select karein'}
                </span>
              </div>
            </div>

            {/* Cash Paid */}
            <div>
              <label className={lbl}>Cash Paid *</label>
              <div className="flex gap-2">
                <input type="number" className={inp} value={cashPaid}
                  onChange={e => setCashPaid(e.target.value)}
                  placeholder="Raqam daalen" min="1"
                  max={companyData?.balance||undefined} />
                <button onClick={handleFullSettle}
                  disabled={!companyData?.balance}
                  title="Full settle"
                  className="px-3 rounded-lg bg-green-500 hover:bg-green-600 text-white
                    text-xs font-medium disabled:opacity-40 flex-shrink-0">
                  Full
                </button>
              </div>
            </div>

            {/* Payment Note */}
            <div className="sm:col-span-2">
              <label className={lbl}>Payment Note</label>
              <div className="flex gap-2">
                <select className={sel} value={note}
                  onChange={e => setNote(e.target.value)}>
                  <option value="">-- Note chunein --</option>
                  {NOTES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <input className={`${inp} flex-1`} value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ya khud likhein" />
              </div>
            </div>
          </div>

          {/* Balance Preview */}
          {companyData && cashPaid > 0 && (
            <div className={`mt-4 p-3 rounded-lg border
              ${isDark?'bg-[#0f172a] border-[#334155]':'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between text-xs mb-1">
                <span className={isDark?'text-slate-400':'text-slate-500'}>Pehle ka balance:</span>
                <span className={`font-semibold text-red-400`}>{fmt(companyData.balance)}</span>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span className={isDark?'text-slate-400':'text-slate-500'}>Payment:</span>
                <span className="font-semibold text-green-400">- {fmt(cashPaid)}</span>
              </div>
              <div className={`flex justify-between text-sm font-bold pt-1 border-t
                ${isDark?'border-[#334155]':'border-slate-200'}`}>
                <span className={isDark?'text-white':'text-slate-800'}>Baad ka balance:</span>
                <span className={
                  Math.max(0, (companyData.balance||0) - parseFloat(cashPaid||0)) === 0
                    ? 'text-green-400'
                    : 'text-red-400'
                }>
                  {fmt(Math.max(0,(companyData.balance||0) - parseFloat(cashPaid||0)))}
                </span>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} disabled={saving || !selCompany || !cashPaid}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-500
                hover:bg-orange-600 text-white text-sm font-semibold
                disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20">
              <Save size={14}/> {saving ? 'Saving...' : 'Save Payment'}
            </button>
            <button onClick={() => { setCashPaid(''); setNote(''); setSelCompany(''); setCompanyData(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border
                ${isDark?'border-[#334155] text-slate-400 hover:bg-[#2d3f55]':'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <RefreshCw size={13}/> Reset
            </button>
          </div>
        </div>

        {/* ── Company Balances ── */}
        <div className={card}>
          <h3 className={`text-sm font-semibold mb-3 ${isDark?'text-white':'text-slate-800'}`}>
            All Company Balances
          </h3>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {companies.length === 0 ? (
              <p className={`text-xs text-center py-4 ${isDark?'text-slate-500':'text-slate-400'}`}>
                Koi company nahi
              </p>
            ) : companies.map(c => (
              <div
                key={c._id}
                onClick={() => handleCompanySelect(c._id)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer
                  transition-all duration-150
                  ${selCompany === c._id
                    ? 'border-orange-500 bg-orange-500/10'
                    : isDark
                      ? 'border-[#334155] bg-[#0f172a] hover:border-orange-500/40'
                      : 'border-slate-200 bg-slate-50 hover:border-orange-300'
                  }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                    ${c.balance > 0 ? 'bg-red-500/15 text-red-400' : 'bg-green-500/15 text-green-400'}`}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <p className={`text-xs font-medium truncate max-w-[100px]
                    ${isDark?'text-white':'text-slate-800'}`}>
                    {c.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold
                    ${c.balance > 0
                      ? isDark ? 'text-red-400' : 'text-red-600'
                      : isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {fmt(c.balance)}
                  </p>
                  {c.balance <= 0 && (
                    <span className="text-xs text-green-400 flex items-center gap-0.5 justify-end">
                      <CheckCircle size={9}/> Clear
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Total owed */}
          <div className={`mt-3 pt-3 border-t ${isDark?'border-[#334155]':'border-slate-200'}`}>
            <div className="flex justify-between text-xs">
              <span className={isDark?'text-slate-400':'text-slate-500'}>Kul Payable:</span>
              <span className="font-bold text-red-400">
                {fmt(companies.reduce((s,c)=>s+(c.balance||0),0))}
              </span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className={isDark?'text-slate-400':'text-slate-500'}>Clear Companies:</span>
              <span className="font-bold text-green-400">
                {companies.filter(c=>c.balance<=0).length} / {companies.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment Ledger Table ── */}
      <div className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className={`text-sm font-semibold ${isDark?'text-white':'text-slate-800'}`}>
            Payment Ledger
          </h3>
          <div className="flex items-center gap-2">
            {/* Filter by company */}
            <select className={`${sel} w-44 text-xs py-1.5`} value={filterComp}
              onChange={e => setFilterComp(e.target.value)}>
              <option value="">All Companies</option>
              {companies.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <button onClick={loadData}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border
                ${isDark?'border-[#334155] text-slate-400 hover:bg-[#2d3f55]':'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              <RefreshCw size={11}/>
            </button>
          </div>
        </div>

        {/* Summary bar */}
        <div className={`flex flex-wrap gap-4 p-3 rounded-lg mb-3
          ${isDark?'bg-[#0f172a]':'bg-slate-50'}`}>
          <div>
            <p className={`text-xs ${isDark?'text-slate-500':'text-slate-400'}`}>Total Records</p>
            <p className="text-sm font-bold text-orange-400">{filteredPayments.length}</p>
          </div>
          <div>
            <p className={`text-xs ${isDark?'text-slate-500':'text-slate-400'}`}>Total Paid</p>
            <p className="text-sm font-bold text-green-400">{fmt(totalPaid)}</p>
          </div>
          {filterComp && companyData && (
            <div>
              <p className={`text-xs ${isDark?'text-slate-500':'text-slate-400'}`}>Current Balance</p>
              <p className={`text-sm font-bold ${companyData.balance>0?'text-red-400':'text-green-400'}`}>
                {fmt(companies.find(c=>c._id===filterComp)?.balance||0)}
              </p>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredPayments.length === 0 ? (
            <p className={`text-center py-8 text-sm ${isDark?'text-slate-500':'text-slate-400'}`}>
              Koi payment record nahi
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  {['Date','Company','Pehle Balance','Paid','Baad Balance','Note',''].map(h => (
                    <th key={h} className={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((pay, i) => (
                  <tr key={pay._id}
                    className={`border-b transition-colors
                      ${isDark
                        ? `border-[#334155] ${i%2===0?'':'bg-[#1a2840]'} hover:bg-[#2d3f55]`
                        : `border-slate-100 ${i%2===0?'':'bg-slate-50/50'} hover:bg-orange-50/30`}`}>
                    <td className={td}>
                      <p>{fmtD(pay.date||pay.createdAt)}</p>
                      <p className={`text-xs ${isDark?'text-slate-500':'text-slate-400'}`}>
                        {fmtT(pay.createdAt||pay.date)}
                      </p>
                    </td>
                    <td className={`${td} font-medium ${isDark?'text-white':'text-slate-800'}`}>
                      {pay.companyName}
                    </td>
                    <td className={`${td} text-red-400 font-medium`}>
                      {fmt(pay.balanceBefore)}
                    </td>
                    <td className={`${td} text-green-400 font-bold`}>
                      {fmt(pay.cashPaid)}
                    </td>
                    <td className={`${td} font-medium
                      ${pay.balanceAfter <= 0
                        ? 'text-green-400'
                        : isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      {fmt(pay.balanceAfter)}
                      {pay.balanceAfter <= 0 && (
                        <span className="ml-1 text-xs">✓</span>
                      )}
                    </td>
                    <td className={td}>
                      <span className={`px-2 py-0.5 rounded-full text-xs
                        ${isDark?'bg-[#334155] text-slate-300':'bg-slate-100 text-slate-600'}`}>
                        {pay.note || '—'}
                      </span>
                    </td>
                    <td className={td}>
                      <button onClick={() => handleDelete(pay._id)}
                        className="p-1 text-red-400 hover:bg-red-500/10 rounded">
                        <Trash2 size={12}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
