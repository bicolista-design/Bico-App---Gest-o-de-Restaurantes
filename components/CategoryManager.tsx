
import React, { useState } from 'react';
import { Category } from '../types';

interface CategoryManagerProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, setCategories }) => {
  const [editingCat, setEditingCat] = useState<Partial<Category> | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [newSub, setNewSub] = useState('');
  const [inlineSubInputs, setInlineSubInputs] = useState<{ [key: string]: string }>({});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat?.name) return;

    if (editingCat.id) {
      setCategories(prev => prev.map(c => c.id === editingCat.id ? (editingCat as Category) : c));
    } else {
      const newCat: Category = {
        id: Math.random().toString(36).substr(2, 9),
        name: editingCat.name,
        subcategories: editingCat.subcategories || [],
        defaultSendToKitchen: editingCat.defaultSendToKitchen || false
      };
      setCategories(prev => [...prev, newCat]);
    }
    setEditingCat(null);
  };

  const toggleDefaultKitchen = (catId: string) => {
    setCategories(prev => prev.map(c => 
      c.id === catId ? { ...c, defaultSendToKitchen: !c.defaultSendToKitchen } : c
    ));
  };

  const addSub = () => {
    if (!newSub.trim() || !editingCat) return;
    const currentSubs = editingCat.subcategories || [];
    if (currentSubs.includes(newSub.trim())) return;
    setEditingCat({ ...editingCat, subcategories: [...currentSubs, newSub.trim()] });
    setNewSub('');
  };

  const removeSub = (sub: string) => {
    if (!editingCat) return;
    setEditingCat({
      ...editingCat,
      subcategories: (editingCat.subcategories || []).filter(s => s !== sub)
    });
  };

  const quickAddSub = (catId: string) => {
    const val = inlineSubInputs[catId];
    if (!val || !val.trim()) return;

    setCategories(prev => prev.map(c => {
      if (c.id === catId) {
        if (c.subcategories.includes(val.trim())) return c;
        return { ...c, subcategories: [...c.subcategories, val.trim()] };
      }
      return c;
    }));

    setInlineSubInputs({ ...inlineSubInputs, [catId]: '' });
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete));
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Gestão de Grupos</h1>
          <p className="text-slate-500 font-medium">Configure automações por categoria de produto.</p>
        </div>
        <button 
          onClick={() => setEditingCat({ name: '', subcategories: [], defaultSendToKitchen: false })}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition"
        >
          + Novo Grupo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">{cat.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                   <button 
                    onClick={() => toggleDefaultKitchen(cat.id)}
                    className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border transition-all ${
                      cat.defaultSendToKitchen 
                      ? 'bg-orange-500 text-white border-orange-600' 
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                   >
                     {cat.defaultSendToKitchen ? '👨‍🍳 Envia Cozinha' : '📦 Pronta Entrega'}
                   </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingCat(cat)} 
                  className="w-9 h-9 flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition" 
                >
                  ✏️
                </button>
                <button 
                  onClick={() => setCategoryToDelete(cat.id)} 
                  className="w-9 h-9 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition" 
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
              {cat.subcategories.map(sub => (
                <span key={sub} className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase border border-slate-100">
                  {sub}
                </span>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-slate-50">
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Nova subcategoria..."
                  value={inlineSubInputs[cat.id] || ''}
                  onChange={(e) => setInlineSubInputs({ ...inlineSubInputs, [cat.id]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && quickAddSub(cat.id)}
                  className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button 
                  onClick={() => quickAddSub(cat.id)}
                  className="bg-slate-900 text-white hover:bg-indigo-600 px-4 py-2.5 rounded-xl text-sm font-bold transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categoryToDelete && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-2 tracking-tighter">Excluir Grupo?</h2>
            <div className="flex flex-col gap-3 mt-8">
              <button onClick={handleConfirmDelete} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Sim, Excluir</button>
              <button onClick={() => setCategoryToDelete(null)} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {editingCat && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tighter">Ficha do Grupo</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nome do Grupo</label>
                <input required value={editingCat.name} onChange={e => setEditingCat({...editingCat, name: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition font-bold" />
              </div>

              <div 
                onClick={() => setEditingCat({...editingCat, defaultSendToKitchen: !editingCat.defaultSendToKitchen})}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  editingCat.defaultSendToKitchen ? 'border-orange-500 bg-orange-50' : 'border-slate-100 bg-white'
                }`}
              >
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${editingCat.defaultSendToKitchen ? 'text-orange-600' : 'text-slate-400'}`}>Produção por Padrão</p>
                  <p className="text-[9px] text-slate-500">Itens novos deste grupo vão para a cozinha automaticamente</p>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${editingCat.defaultSendToKitchen ? 'bg-orange-500' : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${editingCat.defaultSendToKitchen ? 'left-7' : 'left-1'}`} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Subcategorias</label>
                <div className="flex gap-2 mb-4">
                  <input value={newSub} onChange={e => setNewSub(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSub())} className="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-100 outline-none" placeholder="Ex: Burguers, Saladas..." />
                  <button type="button" onClick={addSub} className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold">+</button>
                </div>
                <div className="flex flex-wrap gap-2 p-5 bg-slate-50 rounded-2xl min-h-[80px] border border-slate-100">
                  {(editingCat.subcategories || []).map(sub => (
                    <span key={sub} className="bg-white border px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase flex items-center gap-3">
                      {sub}
                      <button type="button" onClick={() => removeSub(sub)} className="text-red-400 hover:text-red-600">✕</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button type="button" onClick={() => setEditingCat(null)} className="flex-1 py-4 text-slate-400 font-bold">Cancelar</button>
              <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">Salvar Grupo</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
