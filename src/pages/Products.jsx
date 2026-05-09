// src/pages/Products.jsx
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, Package, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const empty = { name:'', company:'', purchasePrice:'', salePrice:'', unitsPerBox:1, boxesPerCarton:1 };

export default function Products() {
  const { isDark } = useTheme();
  const [products,  setProducts]  = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search,    setSearch]    = useState('');
  const [filterCo,  setFilterCo]  = useState('');
  const [modal,     setModal]     = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(empty);
  const [saving,    setSaving]    = useState(false);

  const load = async () => {
    try {
      const [p,c] = await Promise.all([api.get('/products'), api.get('/companies')]);
      setProducts(p.data.data||[]);
      setCompanies(c.data.data||[]);
    } catch { toast.error('Load fail'); }
  };
  useEffect(() => { load(); }, []);

  const openAdd  = ()  => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (p) => {
    setEditing(p._id);
    setForm({
      name: p.name, company: p.company?._id||p.company||'',
      purchasePrice: p.purchasePrice||'', salePrice: p.salePrice||'',
      unitsPerBox: p.unitsPerBox||1, boxesPerCarton: p.boxesPerCarton||1,
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.company) return toast.error('Naam aur company zaroori hain');
    setSaving(true);
    try {
      if (editing) {
        const r = await api.put(`/products/${editing}`, form);
        setProducts(p => p.map(x => x._id===editing ? r.data.data : x));
        toast.success('Update ho gaya ✅');
      } else {
        const r = await api.post('/products', form);
        setProducts(p => [r.data.data, ...p]);
        toast.success('Product add ho gaya ✅');
      }
      setModal(false);
    } catch (e) { toast.error(e.response?.data?.message||'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete karein?')) return;
    try { await api.delete(`/products/${id}`); setProducts(p=>p.filter(x=>x._id!==id)); toast.success('Delete ho gaya'); }
    catch { toast.error('Delete fail'); }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCo     = !filterCo || String(p.company?._id||p.company) === filterCo;
    return matchSearch && matchCo;
  });

  const card = `rounded-xl border ${isDark?'bg-[#1e293b] border-[#334155]':'bg-white border-slate-200 shadow-sm'}`;
  const inp  = `w-full px-3 py-2 rounded-lg text-sm outline-none border transition-colors ${isDark?'bg-[#0f172a] border-[#334155] text-white placeholder-slate-500 focus:border-orange-500':'bg-white border-slate-300 text-slate-800 focus:border-orange-400'}`;
  const sel  = `w-full px-3 py-2 rounded-lg text-sm outline-none border appearance-none ${isDark?'bg-[#0f172a] border-[#334155] text-white focus:border-orange-500':'bg-white border-slate-300 text-slate-800 focus:border-orange-400'}`;
  const lbl  = `block text-xs font-medium mb-1 ${isDark?'text-slate-400':'text-slate-600'}`;
  const th   = `px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider border-b ${isDark?'text-slate-400 border-[#334155] bg-[#0f172a]':'text-slate-500 border-slate-200 bg-slate-50'}`;
  const td   = `px-4 py-3 text-sm ${isDark?'text-slate-300':'text-slate-600'}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${card} p-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center">
              <Package size={18} className="text-green-400"/>
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${isDark?'text-white':'text-slate-800'}`}>Products</h3>
              <p className={`text-xs ${isDark?'text-slate-500':'text-slate-400'}`}>{filtered.length} products</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select className={`${sel} w-36 py-1.5 text-xs`} value={filterCo} onChange={e=>setFilterCo(e.target.value)}>
              <option value="">All Companies</option>
              {companies.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <div className="relative">
              <Search size={13} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark?'text-slate-500':'text-slate-400'}`}/>
              <input className={`${inp} pl-8 w-40 py-1.5 text-xs`} placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold">
              <Plus size={13}/> Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={card}>
        <div className="overflow-x-auto">
          {filtered.length===0 ? (
            <p className={`text-center py-10 text-sm ${isDark?'text-slate-500':'text-slate-400'}`}>Koi product nahi</p>
          ) : (
            <table className="w-full">
              <thead><tr>{['#','Product','Company','Purchase Price','Sale Price','Units/Box','Box/Carton','Stock','Actions'].map(h=><th key={h} className={th}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map((p,i) => (
                  <tr key={p._id} className={`border-b transition-colors ${isDark?`border-[#334155] ${i%2===0?'':'bg-[#1a2840]'} hover:bg-[#2d3f55]`:`border-slate-100 ${i%2===0?'':'bg-slate-50/50'} hover:bg-orange-50/30`}`}>
                    <td className={`${td} text-xs ${isDark?'text-slate-500':'text-slate-400'}`}>{i+1}</td>
                    <td className={`${td} font-semibold ${isDark?'text-white':'text-slate-800'}`}>{p.name}</td>
                    <td className={td}>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${isDark?'bg-purple-500/15 text-purple-400':'bg-purple-100 text-purple-700'}`}>
                        {p.company?.name||'—'}
                      </span>
                    </td>
                    <td className={`${td} text-red-400 font-medium`}>Rs. {Number(p.purchasePrice||0).toLocaleString()}</td>
                    <td className={`${td} text-green-400 font-medium`}>Rs. {Number(p.salePrice||0).toLocaleString()}</td>
                    <td className={td}>{p.unitsPerBox||1}</td>
                    <td className={td}>{p.boxesPerCarton||1}</td>
                    <td className={td}>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                        ${p.stockUnits<=10
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-blue-500/15 text-blue-400'}`}>
                        {p.stockUnits||0} pcs
                      </span>
                    </td>
                    <td className={td}>
                      <div className="flex gap-1">
                        <button onClick={()=>openEdit(p)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10"><Pencil size={12}/></button>
                        <button onClick={()=>handleDelete(p._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"><Trash2 size={12}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <div className={`relative w-full max-w-lg rounded-xl z-10 border ${isDark?'bg-[#1e293b] border-[#334155]':'bg-white border-slate-200'}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark?'border-[#334155]':'border-slate-200'}`}>
              <h3 className={`text-sm font-semibold ${isDark?'text-white':'text-slate-800'}`}>{editing?'Product Edit karein':'Naya Product'}</h3>
              <button onClick={()=>setModal(false)} className="p-1 rounded text-slate-400 hover:text-white"><X size={15}/></button>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className={lbl}>Product Naam *</label><input className={inp} placeholder="Product ka naam" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
                <div className="col-span-2"><label className={lbl}>Company *</label>
                  <select className={sel} value={form.company} onChange={e=>setForm(p=>({...p,company:e.target.value}))}>
                    <option value="">-- Company --</option>
                    {companies.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>Purchase Price</label><input type="number" className={inp} placeholder="0" value={form.purchasePrice} onChange={e=>setForm(p=>({...p,purchasePrice:e.target.value}))}/></div>
                <div><label className={lbl}>Sale Price</label><input type="number" className={inp} placeholder="0" value={form.salePrice} onChange={e=>setForm(p=>({...p,salePrice:e.target.value}))}/></div>
                <div><label className={lbl}>Units per Box</label><input type="number" className={inp} min="1" value={form.unitsPerBox} onChange={e=>setForm(p=>({...p,unitsPerBox:e.target.value}))}/></div>
                <div><label className={lbl}>Boxes per Carton</label><input type="number" className={inp} min="1" value={form.boxesPerCarton} onChange={e=>setForm(p=>({...p,boxesPerCarton:e.target.value}))}/></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save size={13}/>{saving?'Saving...':editing?'Update':'Save'}
                </button>
                <button onClick={()=>setModal(false)} className={`px-4 py-2 rounded-lg text-sm border ${isDark?'border-[#334155] text-slate-400':'border-slate-300 text-slate-600'}`}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
