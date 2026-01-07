
import React, { useState, useMemo, useRef } from 'react';
import { Product, Category } from '../types';
import { generateProductDescription } from '../geminiService';

interface MenuGridProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
}

const MenuGrid: React.FC<MenuGridProps> = ({ products, setProducts, categories }) => {
  const [isEditing, setIsEditing] = useState<Partial<Product> | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'ALL') return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing?.name || isEditing.price === undefined) return;

    const data = isEditing as Product;
    if (data.id && products.find(p => p.id === data.id)) {
      setProducts(prev => prev.map(p => p.id === data.id ? data : p));
    } else {
      setProducts(prev => [...prev, { 
        ...data, 
        id: Math.random().toString(36).substr(2, 9)
      }]);
    }
    setIsEditing(null);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      setProducts(prev => prev.filter(p => p.id !== productToDelete));
      setProductToDelete(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setIsEditing(prev => prev ? { ...prev, imageUrl: compressedDataUrl } : null);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const onCategoryChange = (catName: string) => {
    const selectedCat = categories.find(c => c.name === catName);
    const newKitchenFlag = selectedCat ? selectedCat.defaultSendToKitchen : true;

    setIsEditing(prev => {
      if (!prev) return null;
      return {
        ...prev,
        category: catName,
        subcategory: '',
        sendToKitchen: newKitchenFlag
      };
    });
  };

  const handleGenerateAI = async () => {
    if (!isEditing?.name) return;
    setLoadingAI(true);
    const desc = await generateProductDescription(isEditing.name);
    setIsEditing(prev => prev ? { ...prev, description: desc } : null);
    setLoadingAI(false);
  };

  const activeCategoryObject = categories.find(c => c.name === isEditing?.category);

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Catálogo de Produtos</h1>
          <p className="text-slate-500 font-medium text-[10px] md:text-sm">Gerencie seu cardápio e anexe fotos dos pratos.</p>
        </div>
        <button 
          onClick={() => {
            const firstCat = categories[0];
            setIsEditing({ 
              name: '', 
              price: 0, 
              category: firstCat?.name || '', 
              subcategory: '', 
              imageUrl: '',
              description: '',
              sendToKitchen: firstCat ? firstCat.defaultSendToKitchen : true,
              estimatedPrepTime: 15
            });
          }}
          className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition uppercase text-xs tracking-widest"
        >
          + Adicionar Item
        </button>
      </div>

      <div className="flex gap-2 mb-6 md:mb-10 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => setActiveCategory('ALL')} className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeCategory === 'ALL' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}>Todos</button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.name)} className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeCategory === cat.name ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}>{cat.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-[1.8rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group translate-y-0 hover:translate-y-[-4px]">
            <div className="relative h-28 sm:h-32 md:h-40 overflow-hidden bg-slate-100 flex items-center justify-center">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <span className="text-2xl md:text-4xl opacity-20">📸</span>
              )}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <span className="bg-white/95 backdrop-blur px-2 py-0.5 rounded-lg text-[7px] font-black text-slate-900 uppercase shadow-sm border border-slate-100 w-fit">
                  {product.subcategory || product.category}
                </span>
              </div>
              {product.sendToKitchen && (
                <div className="absolute bottom-2 right-2 bg-orange-500 text-white p-1 rounded-lg shadow-lg">
                  <span className="text-[7px] font-black uppercase">Cozinha</span>
                </div>
              )}
            </div>
            
            <div className="p-2 md:p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-indigo-400 truncate max-w-[60%]">{product.category}</span>
                <span className="font-black text-emerald-600 text-xs md:text-sm tracking-tighter">R$ {product.price.toFixed(2)}</span>
              </div>
              <h3 className="text-[10px] md:text-sm font-bold text-slate-800 mb-1 leading-tight line-clamp-2 h-7 md:h-10">{product.name}</h3>
              
              <div className="flex gap-1 mt-auto pt-2">
                <button onClick={() => setIsEditing(product)} className="flex-1 py-1.5 md:py-2 bg-slate-50 text-slate-600 rounded-xl font-black text-[7px] md:text-[8px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border border-slate-100">Editar</button>
                <button onClick={() => setProductToDelete(product.id)} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100 text-xs">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <form onSubmit={saveProduct} className="bg-white rounded-[3rem] p-6 md:p-10 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">Ficha do Produto</h2>
              <button type="button" onClick={() => setIsEditing(null)} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">✕</button>
            </div>

            <div className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-4">
                   <div className="relative group aspect-square rounded-[2rem] overflow-hidden border-4 border-slate-100 bg-slate-50 flex items-center justify-center shadow-inner">
                      {isEditing.imageUrl ? (
                        <img src={isEditing.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <div className="text-center">
                           <span className="text-5xl block mb-2 opacity-30">📸</span>
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sem Foto</span>
                        </div>
                      )}
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black uppercase text-[10px] flex-col gap-2"
                      >
                        <span className="text-2xl">📷</span>
                        Alterar Foto / Tirar Foto
                      </button>
                   </div>
                   <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                   />
                   
                   <div 
                    onClick={() => setIsEditing(prev => prev ? { ...prev, sendToKitchen: !prev.sendToKitchen } : null)}
                    className={`p-4 md:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ring-offset-2 ${
                      isEditing.sendToKitchen ? 'border-orange-500 bg-orange-50 ring-orange-100' : 'border-slate-100 bg-white'
                    }`}
                   >
                     <div className="flex-1">
                       <p className={`text-[10px] font-black uppercase tracking-widest ${isEditing.sendToKitchen ? 'text-orange-600' : 'text-slate-400'}`}>Cozinha/Produção</p>
                       <p className="text-[9px] text-slate-500">Enviar para tela KDS</p>
                     </div>
                     <div className={`w-10 h-5 rounded-full relative transition-colors ${isEditing.sendToKitchen ? 'bg-orange-500' : 'bg-slate-200'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isEditing.sendToKitchen ? 'left-5.5' : 'left-0.5'}`} />
                     </div>
                   </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome do Produto</label>
                    <input required placeholder="Ex: X-Salada Especial" value={isEditing.name} onChange={e => setIsEditing(prev => prev ? {...prev, name: e.target.value} : null)} className="w-full px-5 py-3 md:py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Preço (R$)</label>
                      <input type="number" step="0.01" required value={isEditing.price} onChange={e => setIsEditing(prev => prev ? {...prev, price: parseFloat(e.target.value)} : null)} className="w-full px-5 py-3 md:py-4 rounded-2xl border-2 border-slate-100 outline-none font-black text-emerald-600" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tempo Est. Preparo (min)</label>
                      <input type="number" required value={isEditing.estimatedPrepTime} onChange={e => setIsEditing(prev => prev ? {...prev, estimatedPrepTime: parseInt(e.target.value)} : null)} className="w-full px-5 py-3 md:py-4 rounded-2xl border-2 border-slate-100 outline-none font-black text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Grupo</label>
                    <select 
                      value={isEditing.category} 
                      onChange={e => onCategoryChange(e.target.value)} 
                      className="w-full px-5 py-3 md:py-4 rounded-2xl border-2 border-slate-100 outline-none bg-white font-bold cursor-pointer"
                    >
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Subcategoria</label>
                    <select value={isEditing.subcategory} onChange={e => setIsEditing(prev => prev ? {...prev, subcategory: e.target.value} : null)} className="w-full px-5 py-3 md:py-4 rounded-2xl border-2 border-slate-100 outline-none bg-white font-bold cursor-pointer">
                      <option value="">Nenhuma</option>
                      {activeCategoryObject?.subcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                  <button type="button" onClick={handleGenerateAI} disabled={loadingAI || !isEditing.name} className="text-[10px] font-black text-white bg-indigo-600 px-4 py-1.5 rounded-full disabled:opacity-50 shadow-lg">
                    {loadingAI ? 'IA...' : '✨ Gerar com IA'}
                  </button>
                </div>
                <textarea placeholder="Fale um pouco sobre este prato..." rows={3} value={isEditing.description} onChange={e => setIsEditing(prev => prev ? {...prev, description: e.target.value} : null)} className="w-full px-5 py-3 md:py-4 rounded-3xl border-2 border-slate-100 focus:border-indigo-500 outline-none resize-none font-medium text-sm" />
              </div>
            </div>

            <div className="flex gap-4 mt-8 md:mt-12">
              <button type="button" onClick={() => setIsEditing(null)} className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-xs">Descartar</button>
              <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl">Gravar Produto</button>
            </div>
          </form>
        </div>
      )}

      {productToDelete && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-2 tracking-tighter">Excluir Produto?</h2>
            <div className="flex flex-col gap-3 mt-8">
              <button onClick={confirmDelete} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Sim, Excluir</button>
              <button onClick={() => setProductToDelete(null)} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuGrid;
