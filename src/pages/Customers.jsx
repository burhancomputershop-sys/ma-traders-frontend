// src/pages/Customers.jsx
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, Users, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const empty = { name:'', address:'', contact:'', region:'' };

export default function Customers() {
  const { isDark } = useTheme();
  const [customers, setCustomers] = useState([]);
  const [search,    setSearch]    = useState('');
  const [modal,     setModal]     = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(empty);
  const [saving,    setSaving]    = useState(false);

  const load = async () => {
    try { const r = await api.get('/customers'); setCustomers(r.data.data||[]); }
    catch { toast.error('Load fail'); }
  };
  useEffect(() => { load(); }, []);

  const openAdd  = ()  => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (c) => { setEditing(c._id); setForm({ name:c.name, address:c.address||'', contact:c.contact||'', region:c.region||'' }); setModal(true); };

  const handleSave = async () => {
    if (!form.name) return toast.error('Naam zaroori hai');
    setSaving(true);
    try {
      if (editing) {
        const r = await api.put(`/customers/${editing}`, form);
        setCustomers(p => p.map(c => c._id===editing ? r.data.data : c));
        toast.success('Update ho gaya ✅');
      } else {
        const r = await api.post('/customers', form);
        setCustomers(p => [r.data.data, ...p]);
        toast.success('Customer add ho gaya ✅');
      }
      setModal(false);
    } catch (e) { toast.error(e.response?.data?.message||'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete karein?')) return;
    try { await api.delete(`/customers/${id}`); setCustomers(p=>p.filter(c=>c._id!==id)); toast.success('Delete ho gaya'); }
    catch { toast.error('Delete fail'); }
  };

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.contact?.includes(search) || c.region?.toLowerCase().includes(search.toLowerCase())
  );

  const card = `rounded-xl border ${isDark?'bg-[#1e293b] border-[#334155]':'bg-white border-slate-200 shadow-sm'}`;
  const inp  = `w-full px-3 py-2 rounded-lg text-sm outline-none border transition-colors ${isDark?'bg-[#0f172a] border-[#334155] text-white placeholder-slate-500 focus:border-orange-500':'bg-white border-slate-300 text-slate-800 focus:border-orange-400'}`;
  const lbl  = `block text-xs font-medium mb-1 ${isDark?'text-slate-400':'text-slate-600'}`;
  const th   = `px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider border-b ${isDark?'text-slate-400 border-[#334155] bg-[#0f172a]':'text-slate-500 border-slate-200 bg-slate-50'}`;
  const td   = `px-4 py-3 text-sm ${isDark?'text-slate-300':'text-slate-600'}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${card} p-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <Users size={18} className="text-blue-400"/>
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${isDark?'text-white':'text-slate-800'}`}>Customers</h3>
              <p className={`text-xs ${isDark?'text-slate-500':'text-slate-400'}`}>{filtered.length} records</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark?'text-slate-500':'text-slate-400'}`}/>
              <input className={`${inp} pl-8 w-48 py-1.5 text-xs`} placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold">
              <Plus size={13}/> Add Customer
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={card}>
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <p className={`text-center py-10 text-sm ${isDark?'text-slate-500':'text-slate-400'}`}>Koi customer nahi</p>
          ) : (
            <table className="w-full">
              <thead><tr>{['#','Name','Contact','Address','Region','Balance','Actions'].map(h=><th key={h} className={th}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map((c,i) => (
                  <tr key={c._id} className={`border-b transition-colors ${isDark?`border-[#334155] ${i%2===0?'':'bg-[#1a2840]'} hover:bg-[#2d3f55]`:`border-slate-100 ${i%2===0?'':'bg-slate-50/50'} hover:bg-orange-50/30`}`}>
                    <td className={`${td} text-xs ${isDark?'text-slate-500':'text-slate-400'}`}>{i+1}</td>
                    <td className={`${td} font-semibold ${isDark?'text-white':'text-slate-800'}`}>{c.name}</td>
                    <td className={td}>{c.contact||'—'}</td>
                    <td className={td}>{c.address||'—'}</td>
                    <td className={td}>{c.region||'—'}</td>
                    <td className={`${td} ${c.balance>0?'text-red-400 font-semibold':'text-green-400'}`}>
                      Rs. {Number(c.balance||0).toLocaleString()}
                    </td>
                    <td className={td}>
                      <div className="flex gap-1">
                        <button onClick={()=>openEdit(c)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10"><Pencil size={12}/></button>
                        <button onClick={()=>handleDelete(c._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"><Trash2 size={12}/></button>
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
          <div className={`relative w-full max-w-md rounded-xl z-10 border ${isDark?'bg-[#1e293b] border-[#334155]':'bg-white border-slate-200'}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark?'border-[#334155]':'border-slate-200'}`}>
              <h3 className={`text-sm font-semibold ${isDark?'text-white':'text-slate-800'}`}>{editing?'Customer Edit karein':'Naya Customer'}</h3>
              <button onClick={()=>setModal(false)} className="p-1 rounded text-slate-400 hover:text-white"><X size={15}/></button>
            </div>
            <div className="p-5 space-y-3">
              {[{key:'name',label:'Naam *',ph:'Customer ka naam'},{key:'address',label:'Address',ph:'Pata'},{key:'contact',label:'Contact',ph:'Phone'},{key:'region',label:'Region',ph:'Shehar/Ilaaqa'}].map(f=>(
                <div key={f.key}><label className={lbl}>{f.label}</label><input className={inp} placeholder={f.ph} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}/></div>
              ))}
              <div className="flex gap-2 pt-1">
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
