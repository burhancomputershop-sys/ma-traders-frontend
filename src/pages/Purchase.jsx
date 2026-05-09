// src/pages/Purchase.jsx — Full Purchase Entry Module
import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, RefreshCw, Package, TrendingDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const fmt  = (n) => `Rs. ${Number(n||0).toLocaleString('en-PK')}`;
const fmtD = (d) => new Date(d).toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'});

const emptyItem = () => ({
  _tempId:        Date.now() + Math.random(),
  product:        '',
  itemName:       '',
  company:        '',
  companyName:    '',
  unitsPerBox:    1,
  looseQty:       0,
  boxesPerCarton: 1,
  numberOfCartons:0,
  purchasePrice:  '',
  salePrice:      '',
  totalUnits:     0,
  totalAmount:    0,
});

// Auto-calculate total units
const calcUnits = (item) => {
  const cartons     = parseFloat(item.numberOfCartons) || 0;
  const bpc         = parseFloat(item.boxesPerCarton)  || 1;
  const upb         = parseFloat(item.unitsPerBox)     || 1;
  const loose       = parseFloat(item.looseQty)        || 0;
  return (cartons * bpc * upb) + loose;
};

export default function Purchase() {
  const { isDark } = useTheme();

  const [companies,  setCompanies]  = useState([]);
  const [products,   setProducts]   = useState([]);
  const [purchases,  setPurchases]  = useState([]);

  const [date,    setDate]    = useState(new Date().toISOString().split('T')[0]);
  const [company, setCompany] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [notes,   setNotes]   = useState('');
  const [items,   setItems]   = useState([emptyItem()]);
  const [saving,  setSaving]  = useState(false);

  // ── Load master data ──
  const loadData = async () => {
    try {
      const [co, pr, pu] = await Promise.all([
        api.get('/companies'),
        api.get('/products'),
        api.get('/purchases?limit=50'),
      ]);
      setCompanies(co.data.data || []);
      setProducts( pr.data.data || []);
      setPurchases(pu.data.data || []);
    } catch { toast.error('Data load fail'); }
  };

  useEffect(() => { loadData(); }, []);

  // ── Company select ──
  const handleCompanyChange = (id) => {
    const c = companies.find(x => x._id === id);
    setCompany(id);
    setCompanyName(c?.name || '');
    // Reset all items' company
    setItems(prev => prev.map(i => ({
      ...i,
      company: id, companyName: c?.name||'',
      product:'', itemName:'',
      purchasePrice:'', salePrice:'',
      totalUnits:0, totalAmount:0,
    })));
  };

  // ── Item field change ──
  const handleItemChange = (idx, field, val) => {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[idx], [field]: val };

      // Product select → fill prices
      if (field === 'product') {
        const prod = products.find(p => p._id === val);
        if (prod) {
          item.itemName      = prod.name;
          item.purchasePrice = prod.purchasePrice;
          item.salePrice     = prod.salePrice;
          item.unitsPerBox   = prod.unitsPerBox   || 1;
          item.boxesPerCarton= prod.boxesPerCarton || 1;
        }
      }

      // Recalculate totals
      const totalUnits  = calcUnits(item);
      const totalAmount = totalUnits * (parseFloat(item.purchasePrice) || 0);
      item.totalUnits   = totalUnits;
      item.totalAmount  = totalAmount;

      updated[idx] = item;
      return updated;
    });
  };

  const addItem    = ()    => setItems(p => [...p, emptyItem()]);
  const removeItem = (idx) => { if (items.length > 1) setItems(p => p.filter((_,i)=>i!==idx)); };

  // ── Grand Total ──
  const grandTotal = items.reduce((s,i) => s + (i.totalAmount||0), 0);

  // ── Save Purchase ──
  const handleSave = async () => {
    if (!company) return toast.error('Company select karein');
    const validItems = items.filter(i => i.product && i.purchasePrice > 0);
    if (validItems.length === 0) return toast.error('Kam az kam ek item add karein');

    setSaving(true);
    try {
      const payload = {
        date, company, companyName,
        items: validItems.map(({ _tempId, ...rest }) => rest),
        grandTotal, notes,
      };
      const res = await api.post('/purchases', payload);
      toast.success('Purchase save ho gayi! ✅');
      setPurchases(p => [res.data.data, ...p]);
      // Reset
      setDate(new Date().toISOString().split('T')[0]);
      setCompany(''); setCompanyName(''); setNotes('');
      setItems([emptyItem()]);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save fail');
    } finally { setSaving(false); }
  };

  // ── Delete Purchase ──
  const handleDelete = async (id) => {
    if (!window.confirm('Purchase delete karein?')) return;
    try {
      await api.delete(`/purchases/${id}`);
      setPurchases(p => p.filter(x => x._id !== id));
      toast.success('Delete ho gayi');
    } catch { toast.error('Delete fail'); }
  };

  // ── Filtered products by company ──
  const filteredProds = products.filter(p =>
    !company || String(p.company?._id||p.company) === String(company)
  );

  // ── Styles ──
  const card  = `rounded-xl border p-4 ${isDark?'bg-[#1e293b] border-[#334155]':'bg-white border-slate-200 shadow-sm'}`;
  const inp   = `w-full px-2.5 py-1.5 rounded-lg text-xs outline-none border transition-colors
    ${isDark
      ? 'bg-[#0f172a] border-[#334155] text-white placeholder-slate-500 focus:border-orange-500'
      : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-orange-400'}`;
  const sel   = `w-full px-2.5 py-1.5 rounded-lg text-xs outline-none border appearance-none
    ${isDark
      ? 'bg-[#0f172a] border-[#334155] text-white focus:border-orange-500'
      : 'bg-white border-slate-300 text-slate-800 focus:border-orange-400'}`;
  const lbl   = `block text-xs font-medium mb-1 ${isDark?'text-slate-400':'text-slate-600'}`;
  const th    = `px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider border-b whitespace-nowrap
    ${isDark?'text-slate-400 border-[#334155] bg-[#0f172a]':'text-slate-500 border-slate-200 bg-slate-50'}`;
  const td    = `px-2 py-2 text-xs ${isDark?'text-slate-300':'text-slate-600'}`;

  return (
    <div className="space-y-4">

      {/* ── Entry Form ── */}
      <div className={card}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-semibold ${isDark?'text-white':'text-slate-800'}`}>
            Purchase Entry
          </h3>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500
                hover:bg-orange-600 text-white text-xs font-semibold disabled:opacity-50">
              <Save size={13}/> {saving?'Saving...':'Save Purchase'}
            </button>
            <button onClick={() => { setItems([emptyItem()]); setCompany(''); setNotes(''); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border
                ${isDark
                  ? 'border-[#334155] text-slate-400 hover:bg-[#2d3f55]'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
              <RefreshCw size={12}/> Reset
            </button>
          </div>
        </div>

        {/* Header Fields */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div>
            <label className={lbl}>Date *</label>
            <input type="date" className={inp} value={date}
              onChange={e => setDate(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Company *</label>
            <select className={sel} value={company}
              onChange={e => handleCompanyChange(e.target.value)}>
              <option value="">-- Select Company --</option>
              {companies.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl}>Notes</label>
            <input className={inp} value={notes}
              onChange={e => setNotes(e.target.value)} placeholder="Optional note" />
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {[
                  'Product','Units/Box','Loose Qty','Box/Carton',
                  'Cartons','Purchase Price','Sale Price',
                  'Total Units','Total Amount',''
                ].map(h => <th key={h} className={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item._tempId}
                  className={`border-b ${isDark?'border-[#334155]':'border-slate-100'}`}>

                  {/* Product */}
                  <td className="px-2 py-1.5 min-w-[150px]">
                    <select className={sel} value={item.product}
                      onChange={e => handleItemChange(idx,'product',e.target.value)}>
                      <option value="">-- Product --</option>
                      {filteredProds.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                    {!company && (
                      <p className="text-xs text-yellow-500 mt-0.5">Pehle company select karein</p>
                    )}
                  </td>

                  {/* Units Per Box */}
                  <td className="px-2 py-1.5 min-w-[80px]">
                    <input type="number" className={inp} value={item.unitsPerBox} min="1"
                      onChange={e => handleItemChange(idx,'unitsPerBox',e.target.value)} />
                  </td>

                  {/* Loose Qty */}
                  <td className="px-2 py-1.5 min-w-[80px]">
                    <input type="number" className={inp} value={item.looseQty} min="0"
                      onChange={e => handleItemChange(idx,'looseQty',e.target.value)} />
                  </td>

                  {/* Boxes Per Carton */}
                  <td className="px-2 py-1.5 min-w-[80px]">
                    <input type="number" className={inp} value={item.boxesPerCarton} min="1"
                      onChange={e => handleItemChange(idx,'boxesPerCarton',e.target.value)} />
                  </td>

                  {/* Number of Cartons */}
                  <td className="px-2 py-1.5 min-w-[80px]">
                    <input type="number" className={inp} value={item.numberOfCartons} min="0"
                      onChange={e => handleItemChange(idx,'numberOfCartons',e.target.value)} />
                  </td>

                  {/* Purchase Price */}
                  <td className="px-2 py-1.5 min-w-[90px]">
                    <input type="number" className={inp} value={item.purchasePrice} placeholder="0"
                      onChange={e => handleItemChange(idx,'purchasePrice',e.target.value)} />
                  </td>

                  {/* Sale Price */}
                  <td className="px-2 py-1.5 min-w-[90px]">
                    <input type="number" className={inp} value={item.salePrice} placeholder="0"
                      onChange={e => handleItemChange(idx,'salePrice',e.target.value)} />
                  </td>

                  {/* Total Units (auto) */}
                  <td className={`px-2 py-1.5 min-w-[80px] text-xs font-semibold
                    ${isDark?'text-blue-400':'text-blue-600'}`}>
                    {item.totalUnits} pcs
                  </td>

                  {/* Total Amount (auto) */}
                  <td className={`px-2 py-1.5 min-w-[100px] text-xs font-semibold
                    ${isDark?'text-orange-400':'text-orange-600'}`}>
                    {fmt(item.totalAmount)}
                  </td>

                  {/* Delete */}
                  <td className="px-2 py-1.5">
                    <button onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 disabled:opacity-30">
                      <Trash2 size={13}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Item + Grand Total Row */}
        <div className={`mt-3 pt-3 border-t flex items-center justify-between
          ${isDark?'border-[#334155]':'border-slate-200'}`}>
          <button onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500
              hover:bg-green-600 text-white text-xs font-medium">
            <Plus size={12}/> Add Item
          </button>
          <div className={`text-right text-xs ${isDark?'text-slate-300':'text-slate-600'}`}>
            <span className="mr-4">
              Total Items: <span className={`font-bold ${isDark?'text-blue-400':'text-blue-600'}`}>
                {items.reduce((s,i)=>s+(i.totalUnits||0),0)} pcs
              </span>
            </span>
            <span className="text-sm font-bold">
              Grand Total: <span className={isDark?'text-orange-400':'text-orange-600'}>
                {fmt(grandTotal)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Purchase History Table ── */}
      <div className={card}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-semibold ${isDark?'text-white':'text-slate-800'}`}>
            Purchase History
          </h3>
          <button onClick={loadData}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border
              ${isDark?'border-[#334155] text-slate-400 hover:bg-[#2d3f55]':'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <RefreshCw size={11}/> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          {purchases.length === 0 ? (
            <p className={`text-center py-8 text-sm ${isDark?'text-slate-500':'text-slate-400'}`}>
              Koi purchase record nahi
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  {['Date','Company','Items','Total Units','Grand Total',''].map(h => (
                    <th key={h} className={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {purchases.map((pu, i) => (
                  <tr key={pu._id}
                    className={`border-b transition-colors
                      ${isDark
                        ? `border-[#334155] ${i%2===0?'':'bg-[#1a2840]'} hover:bg-[#2d3f55]`
                        : `border-slate-100 ${i%2===0?'':'bg-slate-50/50'} hover:bg-orange-50/30`}`}>
                    <td className={td}>{fmtD(pu.date||pu.createdAt)}</td>
                    <td className={`${td} font-medium ${isDark?'text-white':'text-slate-800'}`}>
                      {pu.companyName||'—'}
                    </td>
                    <td className={td}>
                      <div className="flex flex-wrap gap-1">
                        {(pu.items||[]).slice(0,3).map((it,j) => (
                          <span key={j}
                            className={`px-1.5 py-0.5 rounded text-xs
                              ${isDark?'bg-[#334155] text-slate-300':'bg-slate-100 text-slate-600'}`}>
                            {it.itemName}
                          </span>
                        ))}
                        {(pu.items||[]).length > 3 && (
                          <span className={`px-1.5 py-0.5 rounded text-xs ${isDark?'text-slate-500':'text-slate-400'}`}>
                            +{pu.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`${td} ${isDark?'text-blue-400':'text-blue-600'} font-medium`}>
                      {(pu.items||[]).reduce((s,it)=>s+(it.totalUnits||0),0)} pcs
                    </td>
                    <td className={`${td} ${isDark?'text-orange-400':'text-orange-600'} font-semibold`}>
                      {fmt(pu.grandTotal)}
                    </td>
                    <td className={td}>
                      <button onClick={() => handleDelete(pu._id)}
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

        {/* Stock Summary Footer */}
        {purchases.length > 0 && (
          <div className={`mt-3 pt-3 border-t grid grid-cols-2 sm:grid-cols-4 gap-3
            ${isDark?'border-[#334155]':'border-slate-200'}`}>
            {[
              {
                label: 'Total Purchases',
                value: purchases.length,
                color: 'text-orange-400',
                icon: Package,
              },
              {
                label: 'Total Spent',
                value: fmt(purchases.reduce((s,p)=>s+(p.grandTotal||0),0)),
                color: 'text-red-400',
                icon: TrendingDown,
              },
              {
                label: 'Total Units In',
                value: purchases.reduce((s,p)=>
                  s+(p.items||[]).reduce((ss,i)=>ss+(i.totalUnits||0),0),0)+' pcs',
                color: 'text-blue-400',
                icon: Package,
              },
              {
                label: 'Companies',
                value: [...new Set(purchases.map(p=>p.companyName))].length,
                color: 'text-green-400',
                icon: Package,
              },
            ].map(s => (
              <div key={s.label}
                className={`flex items-center gap-3 p-3 rounded-lg
                  ${isDark?'bg-[#0f172a]':'bg-slate-50'}`}>
                <s.icon size={16} className={s.color} />
                <div>
                  <p className={`text-xs ${isDark?'text-slate-500':'text-slate-400'}`}>{s.label}</p>
                  <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
