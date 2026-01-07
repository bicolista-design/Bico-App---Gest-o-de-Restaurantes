import React, { useState, useMemo } from 'react';
import { Product, Category, Table, OrderItem, CompanySettings } from '../types';

interface CustomerMenuProps {
  table: Table;
  products: Product[];
  categories: Category[];
  settings: CompanySettings;
  onOrder: (tableId: string, items: OrderItem[]) => void;
}

const CustomerMenu: React.FC<CustomerMenuProps> = ({ 
  table, 
  products, 
  categories, 
  settings, 
  onOrder 
}) => {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.name || 'TODOS');
  const [showCart, setShowCart] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  const addToCart = (product: Product) => {
    const existingIndex = cart.findIndex(item => item.productId === product.id);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      // Fix: Added missing estimatedPrepTime required by OrderItem type
      const newItem: OrderItem = {
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        quantity: 1,
        status: 'PENDING',
        timestamp: Date.now(),
        sendToKitchen: product.sendToKitchen,
        waiterName: 'Autoatendimento',
        estimatedPrepTime: product.estimatedPrepTime || 15
      };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (orderId: string) => {
    setCart(cart.filter(i => i.id !== orderId));
  };

  const updateQuantity = (orderId: string, delta: number) => {
    setCart(cart.map(i => i.id === orderId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const sendOrder = () => {
    if (cart.length === 0) return;
    onOrder(table.id, cart);
    setCart([]);
    setShowCart(false);
    setOrderConfirmed(true);
    setTimeout(() => setOrderConfirmed(false), 3000);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden animate-in fade-in duration-500">
      {/* HEADER CLIENTE */}
      <div className="bg-white px-6 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
         <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Mesa {table.number}</p>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{settings.name}</h1>
         </div>
         <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl">
           🍷
         </div>
      </div>

      {/* CATEGORIAS */}
      <div className="flex gap-2 p-4 overflow-x-auto bg-white border-b border-slate-50 shrink-0 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.name)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeCategory === cat.name ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* PRODUTOS */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col text-left active:scale-95 transition-all group"
            >
              <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                {product.imageUrl ? (
                  <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20">📸</div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-xl text-[10px] font-black text-slate-900 border border-slate-100">
                  R${product.price.toFixed(0)}
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-[11px] font-black text-slate-800 leading-tight uppercase line-clamp-2 h-8">{product.name}</h3>
                <p className="text-[8px] text-slate-400 mt-1 line-clamp-1">{product.description || 'Delicioso item do nosso menu'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* FEEDBACK DE PEDIDO CONFIRMADO */}
      {orderConfirmed && (
        <div className="fixed inset-0 bg-emerald-600/95 z-[300] flex flex-col items-center justify-center text-white animate-in zoom-in duration-300">
           <span className="text-6xl mb-4">✅</span>
           <h2 className="text-3xl font-black tracking-tighter">Pedido Enviado!</h2>
           <p className="text-emerald-100 uppercase text-[10px] font-black tracking-widest mt-2">Estamos preparando para você</p>
        </div>
      )}

      {/* BARRA DO CARRINHO */}
      {cartCount > 0 && !showCart && (
        <div className="fixed bottom-6 left-6 right-6 z-[200]">
          <button 
            onClick={() => setShowCart(true)}
            className="w-full bg-slate-900 text-white h-16 rounded-[2rem] shadow-2xl flex items-center justify-between px-8 active:scale-95 transition-all animate-in slide-in-from-bottom duration-300"
          >
            <div className="flex items-center gap-4">
               <span className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black">{cartCount}</span>
               <span className="text-[10px] font-black uppercase tracking-widest">Ver Pedido</span>
            </div>
            <span className="text-sm font-black tracking-tighter">R$ {cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* MODAL DO CARRINHO */}
      {showCart && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[250] flex items-end animate-in fade-in duration-300">
           <div className="w-full bg-white rounded-t-[3rem] p-8 animate-in slide-in-from-bottom duration-500 max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Seu Pedido</h2>
                <button onClick={() => setShowCart(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex-1">
                      <h4 className="text-[11px] font-black text-slate-900 uppercase">{item.name}</h4>
                      <p className="text-[10px] font-bold text-indigo-600">R$ {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black">-</button>
                      <span className="font-black text-slate-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black">+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total do Pedido</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={sendOrder}
                  className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all"
                >
                  Enviar para a Cozinha
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;