// src/pages/Invoice.jsx — Full Invoice System
import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  Plus, Trash2, Printer, Save, CheckCircle,
  RefreshCw, UserPlus, ChevronDown
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

// ── Helpers ──────────────────────────────────────────
const fmt  = (n) => `Rs. ${Number(n||0).toLocaleString('en-PK')}`;
const fmtD = (d) => new Date(d).toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'});

// ── Empty item template ───────────────────────────────
const emptyItem = () => ({
  _tempId:     Date.now(),
  company:     '', companyName: '',
  product:     '', productName: '',
  perUnit:     '', discount:    '',
  price:       '', quantity:    1,
  total:       0,
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRINT TEMPLATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PrintInvoice = ({ data, ref: r }) => (
  <div ref={r} style={{ padding:'30px', fontFamily:'Arial', fontSize:'12px', color:'#000' }}>
    <div style={{ textAlign:'center', marginBottom:'16px' }}>
      <h2 style={{ fontSize:'20px', fontWeight:'bold', margin:0 }}>MA TRADERS</h2>
      <p style={{ margin:'4px 0', fontSize:'11px' }}>Invoice Receipt</p>
      <hr style={{ margin:'8px 0' }} />
    </div>
    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
      <div>
        <p><b>Customer:</b> {data.customerName}</p>
        <p><b>Address:</b>  {data.address}</p>
        <p><b>Contact:</b>  {data.contact}</p>
        <p><b>Region:</b>   {data.region}</p>
        <p><b>Salesman:</b> {data.salesmanName}</p>
      </div>
      <div style={{ textAlign:'right' }}>
        <p><b>Invoice #:</b> {data.invoiceNo || 'AUTO'}</p>
        <p><b>Date:</b> {fmtD(data.date||Date.now())}</p>
      </div>
    </div>
    <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:'12px' }}>
      <thead>
        <tr style={{ background:'#f1f5f9' }}>
          {['#','Product','Company','Per Unit','Disc','Price','Qty','Total'].map(h => (
            <th key={h} style={{ border:'1px solid #ddd', padding:'6px 8px', textAlign:'left', fontSize:'11px' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(data.items||[]).map((item,i) => (
          <tr key={i}>
            <td style={{ border:'1px solid #ddd', padding:'5px 8px' }}>{i+1}</td>
            <td style={{ border:'1px solid #ddd', padding:'5px 8px' }}>{item.productName}</td>
            <td style={{ border:'1px solid #ddd', padding:'5px 8px' }}>{item.companyName}</td>
            <td style={{ border:'1px solid #ddd', padding:'5px 8px' }}>{item.perUnit}</td>
            <td style={{ border:'1px solid #ddd', padding:'5px 8px' }}>{item.discount||0}</td>
            <td style={{ border:'1px solid #ddd', padding:'5px 8px' }}>{item.price}</td>
            <td style={{ border:'1px solid #ddd', padding:'5px 8px' }}>{item.quantity}</td>
            <td style={{ border:'1px solid #ddd', padding:'5px 8px' }}><b>{fmt(item.total)}</b></td>
          </tr>
        ))}
      </tbody>
    </table>
    <div style={{ textAlign:'right', marginBottom:'12px' }}>
      <p>Subtotal:       <b>{fmt(data.subtotal)}</b></p>
      <p>Discount:       <b style={{ color:'red' }}>- {fmt(data.totalDiscount)}</b></p>
      <p style={{ fontSize:'15px' }}>Grand Total: <b>{fmt(data.grandTotal)}</b></p>
      <p>Cash Received:  <b style={{ color:'green' }}>{fmt(data.cashReceived)}</b></p>
      <p>Outstanding:    <b style={{ color:'red' }}>{fmt(data.outstanding)}</b></p>
    </div>
    <hr />
    <p style={{ textAlign:'center', fontSize:'10px', marginTop:'8px' }}>
      Shukriya! — MA Traders
    </p>
  </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN INVOICE PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Invoice() {
  const { isDark } = useTheme();
  const printRef   = useRef();

  // ── Dropdown data ──
  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [products,  setProducts]  = useState([]);
  const [salesmen,  setSalesmen]  = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);

  // ── Form state ──
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    customer:'', customerName:'', address:'', contact:'', region:'',
    salesman:'', salesmanName:'',
  });
  const [items,        setItems]       = useState([emptyItem()]);
  const [cashReceived, setCashReceived]= useState('');
  const [saving,       setSaving]      = useState(false);

  // ── Add Customer Modal ──
  const [showAddCust, setShowAddCust] = useState(false);
  const [newCust,     setNewCust]     = useState({ name:'', address:'', contact:'', region:'' });

  // ── Load master data ──
  const loadMaster = async () => {
    try {
      const [c,co,p,s,inv] = await Promise.all([
        api.get('/customers'), api.get('/companies'),
        api.get('/products'),  api.get('/salesmen'),
        api.get('/invoices?limit=50'),
      ]);
      setCustomers(c.data.data   || []);
      setCompanies(co.data.data  || []);
      setProducts( p.data.data   || []);
      setSalesmen( s.data.data   || []);
      setAllInvoices(inv.data.data || []);
    } catch { toast.error('Master data load fail'); }
  };

  useEffect(() => { loadMaster(); }, []);

  // ── Customer select ──
  const handleCustomerChange = (id) => {
    const c = customers.find(x => x._id === id);
    setForm(f => ({
      ...f,
      customer:     id,
      customerName: c?.name    || '',
      address:      c?.address || '',
      contact:      c?.contact || '',
      region:       c?.region  || '',
    }));
  };

  // ── Salesman select ──
  const handleSalesmanChange = (id) => {
    const s = salesmen.find(x => x._id === id);
    setForm(f => ({ ...f, salesman: id, salesmanName: s?.name || '' }));
  };

  // ── Item field change ──
  const handleItemChange = (idx, field, val) => {
    setItems(prev => {
      const updated = [...prev];
      const item    = { ...updated[idx], [field]: val };

      // Company change → reset product
      if (field === 'company') {
        const co = companies.find(c => c._id === val);
        item.companyName = co?.name || '';
        item.product     = '';
        item.productName = '';
        item.perUnit     = '';
        item.price       = '';
        item.total       = 0;
      }

      // Product change → fill prices
      if (field === 'product') {
        const prod = products.find(p => p._id === val);
        if (prod) {
          item.productName = prod.name;
          item.perUnit     = prod.salePrice;
          item.discount    = 0;
          item.price       = prod.salePrice;
        }
      }

      // Recalculate price & total
      const perUnit  = parseFloat(item.perUnit)  || 0;
      const discount = parseFloat(item.discount) || 0;
      const qty      = parseFloat(item.quantity) || 1;

      if (field === 'perUnit' || field === 'discount') {
        item.price = Math.max(0, perUnit - discount);
      }
      item.total = (parseFloat(item.price)||0) * qty;

      updated[idx] = item;
      return updated;
    });
  };

  // ── Add / Remove items ──
  const addItem    = ()    => setItems(p => [...p, emptyItem()]);
  const removeItem = (idx) => setItems(p => p.filter((_,i) => i !== idx));

  // ── Totals ──
  const subtotal      = items.reduce((s,i) => s + (parseFloat(i.perUnit)||0)*(parseFloat(i.quantity)||1), 0);
  const totalDiscount = items.reduce((s,i) => s + (parseFloat(i.discount)||0)*(parseFloat(i.quantity)||1), 0);
  const grandTotal    = items.reduce((s,i) => s + (i.total||0), 0);
  const cash          = parseFloat(cashReceived) || 0;
  const outstanding   = Math.max(0, grandTotal - cash);

  // ── Print ──
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  // ── Full Pay ──
  const handleFullPay = () => setCashReceived(String(grandTotal));

  // ── Save Invoice ──
  const handleSave = async () => {
    if (!form.customer)          return toast.error('Customer select karein');
    if (items.every(i => !i.product)) return toast.error('Kam az kam ek product add karein');

    setSaving(true);
    try {
      const validItems = items
        .filter(i => i.product && i.price > 0)
        .map(({ _tempId, ...rest }) => rest);

      const payload = {
        ...form,
        items: validItems,
        subtotal,
        totalDiscount,
        grandTotal,
        cashReceived: cash,
        outstanding,
      };

      await api.post('/invoices', payload);
      toast.success('Invoice save ho gayi! ✅');
      await loadMaster();

      // Reset form
      setForm({
        date: new Date().toISOString().split('T')[0],
        customer:'', customerName:'', address:'', contact:'',
        region:'', salesman:'', salesmanName:'',
      });
      setItems([emptyItem()]);
      setCashReceived('');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save fail ho gayi');
    } finally { setSaving(false); }
  };

  // ── Add Customer ──
  const handleAddCustomer = async () => {
    if (!newCust.name) return toast.error('Naam zaroori hai');
    try {
      const res = await api.post('/customers', newCust);
      setCustomers(p => [...p, res.data.data]);
      handleCustomerChange(res.data.data._id);
      setShowAddCust(false);
      setNewCust({ name:'', address:'', contact:'', region:'' });
      toast.success('Customer add ho gaya ✅');
    } catch { toast.error('Customer add fail'); }
  };

  // ── Delete Invoice ──
  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Invoice delete karein?')) return;
    try {
      await api.delete(`/invoices/${id}`);
      setAllInvoices(p => p.filter(i => i._id !== id));
      toast.success('Invoice delete ho gayi');
    } catch { toast.error('Delete fail'); }
  };

  // ── Products filtered by company ──
  const filteredProducts = (companyId) =>
    products.filter(p => !companyId || String(p.company?._id||p.company) === String(companyId));

  // ── Status Badge ──
  const StatusBadge = ({ s }) => {
    const m = { paid:'bg-green-500/15 text-green-400', partial:'bg-yellow-500/15 text-yellow-400', pending:'bg-red-500/15 text-red-400' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m[s]||m.pending}`}>{s}</span>;
  };

  // ── Common input class ──
  const inp = `w-full px-2.5 py-1.5 rounded-lg text-xs outline-none border transition-colors
    ${isDark
      ? 'bg-[#0f172a] border-[#334155] text-white placeholder-slate-500 focus:border-orange-500'
      : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-orange-400'}`;

  const sel = `w-full px-2.5 py-1.5 rounded-lg text-xs outline-none border appearance-none transition-colors
    ${isDark
      ? 'bg-[#0f172a] border-[#334155] text-white focus:border-orange-500'
      : 'bg-white border-slate-300 text-slate-800 focus:border-orange-400'}`;

  const label = `block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`;
  const card  = `rounded-xl border p-4 ${isDark ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-200 shadow-sm'}`;
  const th    = `px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider border-b
    ${isDark ? 'text-slate-400 border-[#334155] bg-[#0f172a]' : 'text-slate-500 border-slate-200 bg-slate-50'}`;

  const printData = {
    ...form, items, subtotal, totalDiscount,
    grandTotal, cashReceived: cash, outstanding,
  };

  return (
    <div className="space-y-4">
      {/* Hidden Print Template */}
      <div style={{ display:'none' }}>
        <PrintInvoice data={printData} ref={printRef} />
      </div>

      {/* ── TOP: Invoice Form + Right Panel ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* ── LEFT: Invoice Form (2 cols) ── */}
        <div className="xl:col-span-2 space-y-4">

          {/* Header Fields */}
          <div className={card}>
            <h3 className={`text-sm font-semibold mb-3 ${isDark?'text-white':'text-slate-800'}`}>
              Invoice Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Date */}
              <div>
                <label className={label}>Date *</label>
                <input type="date" className={inp} value={form.date}
                  onChange={e => setForm(f=>({...f,date:e.target.value}))} />
              </div>

              {/* Customer */}
              <div className="sm:col-span-2">
                <label className={label}>Customer *</label>
                <div className="flex gap-1.5">
                  <select className={sel} value={form.customer}
                    onChange={e => handleCustomerChange(e.target.value)}>
                    <option value="">-- Select --</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  <button onClick={() => setShowAddCust(true)}
                    className="px-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white flex-shrink-0"
                    title="Add Customer">
                    <UserPlus size={13}/>
                  </button>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className={label}>Address</label>
                <input className={inp} value={form.address}
                  onChange={e => setForm(f=>({...f,address:e.target.value}))} placeholder="Address" />
              </div>

              {/* Contact */}
              <div>
                <label className={label}>Contact</label>
                <input className={inp} value={form.contact}
                  onChange={e => setForm(f=>({...f,contact:e.target.value}))} placeholder="Phone" />
              </div>

              {/* Region */}
              <div>
                <label className={label}>Region</label>
                <input className={inp} value={form.region}
                  onChange={e => setForm(f=>({...f,region:e.target.value}))} placeholder="Region" />
              </div>

              {/* Salesman */}
              <div>
                <label className={label}>Salesman</label>
                <select className={sel} value={form.salesman}
                  onChange={e => handleSalesmanChange(e.target.value)}>
                  <option value="">-- Select --</option>
                  {salesmen.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Items */}
          <div className={card}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-semibold ${isDark?'text-white':'text-slate-800'}`}>
                Products
              </h3>
              <button onClick={addItem}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500
                  hover:bg-orange-600 text-white text-xs font-medium">
                <Plus size={12}/> Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {['Company','Product','Per Unit','Discount','Price','Qty','Total',''].map(h => (
                      <th key={h} className={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item._tempId}
                      className={`border-b ${isDark?'border-[#334155]':'border-slate-100'}`}>
                      {/* Company */}
                      <td className="px-2 py-1.5 min-w-[120px]">
                        <select className={sel} value={item.company}
                          onChange={e => handleItemChange(idx,'company',e.target.value)}>
                          <option value="">Company</option>
                          {companies.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                      {/* Product */}
                      <td className="px-2 py-1.5 min-w-[130px]">
                        <select className={sel} value={item.product}
                          onChange={e => handleItemChange(idx,'product',e.target.value)}>
                          <option value="">Product</option>
                          {filteredProducts(item.company).map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      {/* Per Unit */}
                      <td className="px-2 py-1.5 min-w-[80px]">
                        <input type="number" className={inp} value={item.perUnit} placeholder="0"
                          onChange={e => handleItemChange(idx,'perUnit',e.target.value)}/>
                      </td>
                      {/* Discount */}
                      <td className="px-2 py-1.5 min-w-[80px]">
                        <input type="number" className={inp} value={item.discount} placeholder="0"
                          onChange={e => handleItemChange(idx,'discount',e.target.value)}/>
                      </td>
                      {/* Price (readonly) */}
                      <td className="px-2 py-1.5 min-w-[80px]">
                        <input type="number" className={`${inp} ${isDark?'bg-[#1e293b]':'bg-slate-50'}`}
                          value={item.price} readOnly/>
                      </td>
                      {/* Qty */}
                      <td className="px-2 py-1.5 min-w-[60px]">
                        <input type="number" className={inp} value={item.quantity} min="1"
                          onChange={e => handleItemChange(idx,'quantity',e.target.value)}/>
                      </td>
                      {/* Total */}
                      <td className={`px-2 py-1.5 text-xs font-semibold min-w-[90px]
                        ${isDark?'text-orange-400':'text-orange-600'}`}>
                        {fmt(item.total)}
                      </td>
                      {/* Delete */}
                      <td className="px-2 py-1.5">
                        <button onClick={() => removeItem(idx)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10">
                          <Trash2 size={13}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Row */}
            <div className={`mt-3 pt-3 border-t ${isDark?'border-[#334155]':'border-slate-200'}`}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                {/* Cash Received */}
                <div className="flex items-end gap-2">
                  <div>
                    <label className={label}>Cash Received</label>
                    <input type="number" className={`${inp} w-36`} value={cashReceived}
                      onChange={e => setCashReceived(e.target.value)} placeholder="0"/>
                  </div>
                  <button onClick={handleFullPay}
                    className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600
                      text-white text-xs font-medium flex items-center gap-1 mb-0.5">
                    <CheckCircle size={12}/> Full Pay
                  </button>
                </div>

                {/* Summary */}
                <div className={`text-right space-y-1 text-xs
                  ${isDark?'text-slate-300':'text-slate-600'}`}>
                  <p>Subtotal: <span className="font-semibold">{fmt(subtotal)}</span></p>
                  <p>Discount: <span className="text-red-400 font-semibold">- {fmt(totalDiscount)}</span></p>
                  <p className={`text-sm font-bold ${isDark?'text-white':'text-slate-900'}`}>
                    Grand Total: {fmt(grandTotal)}
                  </p>
                  <p className="text-green-400 font-semibold">Cash: {fmt(cash)}</p>
                  <p className="text-red-400 font-semibold">Outstanding: {fmt(outstanding)}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`mt-3 pt-3 border-t flex gap-2 ${isDark?'border-[#334155]':'border-slate-200'}`}>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500
                  hover:bg-orange-600 text-white text-xs font-semibold disabled:opacity-50">
                <Save size={13}/>{saving ? 'Saving...' : 'Save Invoice'}
              </button>
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500
                  hover:bg-blue-600 text-white text-xs font-semibold">
                <Printer size={13}/> Print
              </button>
              <button onClick={() => { setItems([emptyItem()]); setCashReceived(''); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                  border transition-colors
                  ${isDark
                    ? 'border-[#334155] text-slate-400 hover:bg-[#2d3f55]'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                <RefreshCw size={12}/> Reset
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Bills Summary ── */}
        <div className={`${card} flex flex-col`}>
          <h3 className={`text-sm font-semibold mb-3 ${isDark?'text-white':'text-slate-800'}`}>
            Total Bills Issued
          </h3>

          {/* Summary Numbers */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label:'Total Bills',   value: allInvoices.length,                              color:'text-orange-400' },
              { label:'Total Amount',  value: fmt(allInvoices.reduce((s,i)=>s+(i.grandTotal||0),0)), color:'text-green-400' },
              { label:'Outstanding',   value: fmt(allInvoices.reduce((s,i)=>s+(i.outstanding||0),0)), color:'text-red-400' },
              { label:'Paid',          value: allInvoices.filter(i=>i.status==='paid').length,  color:'text-blue-400' },
            ].map(s => (
              <div key={s.label}
                className={`rounded-lg p-3 ${isDark?'bg-[#0f172a]':'bg-slate-50'}`}>
                <p className={`text-xs ${isDark?'text-slate-500':'text-slate-400'}`}>{s.label}</p>
                <p className={`text-sm font-bold mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Bills List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 max-h-72">
            {allInvoices.length === 0 ? (
              <p className={`text-xs text-center py-6 ${isDark?'text-slate-500':'text-slate-400'}`}>
                Koi invoice nahi
              </p>
            ) : allInvoices.map(inv => (
              <div key={inv._id}
                className={`flex items-center justify-between p-2.5 rounded-lg border
                  ${isDark
                    ? 'bg-[#0f172a] border-[#334155] hover:border-orange-500/30'
                    : 'bg-slate-50 border-slate-200 hover:border-orange-300'}`}>
                <div>
                  <p className={`text-xs font-mono font-semibold ${isDark?'text-orange-400':'text-orange-600'}`}>
                    {inv.invoiceNo}
                  </p>
                  <p className={`text-xs ${isDark?'text-slate-400':'text-slate-500'}`}>
                    {inv.customerName}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-semibold ${isDark?'text-white':'text-slate-800'}`}>
                    {fmt(inv.grandTotal)}
                  </p>
                  <StatusBadge s={inv.status}/>
                </div>
                <button onClick={() => handleDeleteInvoice(inv._id)}
                  className="ml-2 p-1 text-red-400 hover:bg-red-500/10 rounded">
                  <Trash2 size={11}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Add Customer Modal ── */}
      {showAddCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={e => { if(e.target===e.currentTarget) setShowAddCust(false); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className={`relative w-full max-w-md rounded-xl z-10 border
            ${isDark?'bg-[#1e293b] border-[#334155]':'bg-white border-slate-200'}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b
              ${isDark?'border-[#334155]':'border-slate-200'}`}>
              <h3 className={`text-sm font-semibold ${isDark?'text-white':'text-slate-800'}`}>
                Naya Customer
              </h3>
              <button onClick={() => setShowAddCust(false)}
                className={`text-xs px-2 py-1 rounded ${isDark?'text-slate-400 hover:text-white':'text-slate-500'}`}>
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { key:'name',    label:'Naam *',   placeholder:'Customer ka naam' },
                { key:'address', label:'Address',  placeholder:'Pata' },
                { key:'contact', label:'Contact',  placeholder:'Phone number' },
                { key:'region',  label:'Region',   placeholder:'Shehar/ilaaqa' },
              ].map(f => (
                <div key={f.key}>
                  <label className={label}>{f.label}</label>
                  <input className={inp} placeholder={f.placeholder}
                    value={newCust[f.key]}
                    onChange={e => setNewCust(p=>({...p,[f.key]:e.target.value}))} />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button onClick={handleAddCustomer}
                  className="flex-1 py-2 rounded-lg bg-green-500 hover:bg-green-600
                    text-white text-xs font-semibold">
                  Save Customer
                </button>
                <button onClick={() => setShowAddCust(false)}
                  className={`px-4 py-2 rounded-lg text-xs border
                    ${isDark?'border-[#334155] text-slate-400':'border-slate-300 text-slate-600'}`}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
