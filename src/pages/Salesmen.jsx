// src/pages/Salesmen.jsx
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, UserCheck, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const empty = { name:'', contact:'', area:'' };

export default function Salesmen() {
  const { isDark } = useTheme();
  const [salesmen, setSalesmen] = useState([]);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(empty);
  const [saving,   setSaving]   = useState(false);

  const load = async () => {
    try { const r = await api.get('/salesmen'); setSalesmen(r.data.data||[]); }
    catch { toast.error('Load fail'); }
  };
  useEffect(() => { load(); }, []);

  const openAdd  = ()  => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (s) => { setEditing(s._id); setForm({ name:s.name, contact:s.contact||'', area:s.area||'' }); setModal(true); };

  const handleSave = async () => {
    if (!form.name) return toast.error('Naam zaroori hai');
    setSaving(true);
    try {
      if (editing) {
        const r = await api.put(`/salesmen/${editing}`, form);
        setSalesmen(p => p.map(s => s._id===editing ? r.data.data : s));
        toast.success('Update ho gaya ✅');
      } else {
        const r = await api.post('/salesmen', form);
        setSalesmen(p => [r.data.data, ...p]);
        toast.success('Salesman add ho gaya ✅');
      }
      setModal(false);
    } catch (e) { toast.error(e.response?.data?.message||'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete karein?')) return;
    try { await api.delete(`/salesmen/${id}`); setSalesmen(p=>p.filter(s=>s._id!==id)); toast.success('Delete ho gaya'); }
    catch { toast.error('Delete fail'); }
  };

  const filtered = salesmen.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.area?.toLowerCase().includes(search.toLowerCase()) ||
    s.contact?.includes(search)
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
            <div className="w-10 h-10 rounded-lg bg-yellow-500/15 flex items-center justify-center">
              <UserCheck size={18} className="text-yellow-400"/>
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${isDark?'text-white':'text-slate-800'}`}>Salesmen</h3>
              <p className={`text-xs ${isDark?'text-slate-500':'text-slate-400'}`}>{filtered.length} records</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark?'text-slate-500':'text-slate-400'}`}/>
              <input className={`${inp} pl-8 w-44 py-1.5 text-xs`} placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold">
              <Plus size={13}/> Add Salesman
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.length===0 ? (
          <div className={`col-span-full text-center py-10 text-sm rounded-xl border ${isDark?'bg-[#1e293b] border-[#334155] text-slate-500':'bg-white border-slate-200 text-slate-400'}`}>
            Koi salesman nahi
          </div>
        ) : filtered.map((s,i) => (
          <div key={s._id} className={`rounded-xl border p-4 transition-all hover:scale-[1.01]
            ${isDark?'bg-[#1e293b] border-[#334155] hover:border-orange-500/30':'bg-white border-slate-200 shadow-sm hover:border-orange-300'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/15 flex items-center justify-center text-yellow-400 font-bold text-sm">
                {s.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex gap-1">
                <button onClick={()=>openEdit(s)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10"><Pencil size={12}/></button>
                <button onClick={()=>handleDelete(s._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"><Trash2 size={12}/></button>
              </div>
            </div>
            <p className={`text-sm font-semibold ${isDark?'text-white':'text-slate-800'}`}>{s.name}</p>
            <p className={`text-xs mt-1 ${isDark?'text-slate-400':'text-slate-500'}`}>📞 {s.contact||'—'}</p>
            <p className={`text-xs mt-0.5 ${isDark?'text-slate-400':'text-slate-500'}`}>📍 {s.area||'—'}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <div className={`relative w-full max-w-md rounded-xl z-10 border ${isDark?'bg-[#1e293b] border-[#334155]':'bg-white border-slate-200'}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark?'border-[#334155]':'border-slate-200'}`}>
              <h3 className={`text-sm font-semibold ${isDark?'text-white':'text-slate-800'}`}>{editing?'Salesman Edit karein':'Naya Salesman'}</h3>
              <button onClick={()=>setModal(false)} className="p-1 rounded text-slate-400 hover:text-white"><X size={15}/></button>
            </div>
            <div className="p-5 space-y-3">
              {[{key:'name',label:'Naam *',ph:'Salesman ka naam'},{key:'contact',label:'Contact',ph:'Phone number'},{key:'area',label:'Area',ph:'Kaam ka area'}].map(f=>(
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
