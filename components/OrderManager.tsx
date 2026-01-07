
import React, { useState, useMemo } from 'react';
import { Table, TableStatus, Product, OrderItem, Category, User, UserRole } from '../types';

interface OrderManagerProps {
  table: Table;
  products: Product[];
  categories: Category[];
  onUpdateTable: (table: Table) => void;
  onCloseRequest: (table: Table) => void;
  onCancel: () => void;
  canClose: boolean;
  currentUser: User;
  allTables: Table[];
  isCashOpen: boolean;
}

const OrderManager: React.FC<OrderManagerProps> = ({ 
  table, products, categories, onUpdateTable, onCloseRequest, onCancel, canClose, currentUser, allTables, isCashOpen
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.name || 'TODOS');
  const [mobileView, setMobileView] = useState<'menu' | 'bill'>('menu');

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  const updateTableData = (orders: OrderItem[]) => {
    onUpdateTable({
      ...table,
      currentOrders: orders,
      status: orders.length > 0 ? TableStatus.OCCUPIED : TableStatus.FREE,
      openedAt: table.openedAt || Date.now(),
      lastUpdatedBy: currentUser.name
    });
  };

  const addItem = (product: Product) => {
    if (!isCashOpen) {
      alert("⚠️ CAIXA FECHADO! Não é possível realizar vendas no momento. Solicite a abertura do caixa.");
      return;
    }

    const existingIndex = table.currentOrders.findIndex(item => 
      item.productId === product.id && item.status === 'PENDING'
    );
    
    let updated: OrderItem[];
    if (existingIndex > -1) {
      updated = table.currentOrders.map((item, i) => 
        i === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updated = [...table.currentOrders, {
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id, 
        name: product.name, 
        price: product.price, 
        category: product.category,
        quantity: 1, 
        status: 'PENDING', 
        timestamp: Date.now(), 
        sendToKitchen: product.sendToKitchen,
        waiterName: currentUser.name, 
        estimatedPrepTime: product.estimatedPrepTime || 15,
        waiterAcknowledged: false
      }];
    }
    updateTableData(updated);
  };

  const acknowledgeDelivery = (orderId: string) => {
    const updated = table.currentOrders.map(o => 
      o.id === orderId ? { ...o, waiterAcknowledged: true } : o
    );
    updateTableData(updated);
  };

  const removeItem = (id: string) => {
    if (confirm("Remover este item?")) {
      updateTableData(table.currentOrders.filter(o => o.id !== id));
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    const updated = table.currentOrders.map(o => {
      if (o.id === id) {
        return { ...o, quantity: Math.max(1, o.quantity + delta) };
      }
      return o;
    });
    updateTableData(updated);
  };

  const total = table.currentOrders.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden pb-safe">
      <div className="px-4 py-4 border-b flex items-center justify-between shrink-0 bg-white shadow-sm z-30">
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="w-10 h-10 bg-slate-50 rounded-xl text-slate-400 flex items-center justify-center">←</button>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-widest">{table.id.startsWith('balcao') ? `Balcão #${table.number}` : `Mesa ${table.number}`}</h2>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Garçom: {currentUser.name}</p>
          </div>
        </div>
        {!isCashOpen && (
          <div className="bg-red-50 px-4 py-1.5 rounded-full border border-red-100 animate-pulse">
            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">⚠️ Caixa Fechado</span>
          </div>
        )}
        <div className="text-right">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Subtotal</p>
          <p className="text-xl font-black text-indigo-600 tracking-tighter">R$ {total.toFixed(2)}</p>
        </div>
      </div>

      <div className="md:hidden flex bg-slate-50 border-b border-slate-100 p-1.5 gap-1.5 shrink-0">
        <button onClick={() => setMobileView('menu')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mobileView === 'menu' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Cardápio</button>
        <button onClick={() => setMobileView('bill')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all relative ${mobileView === 'bill' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>
          Comanda ({table.currentOrders.length})
          {table.currentOrders.some(o => o.status === 'DONE' && !o.waiterAcknowledged) && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={`${mobileView === 'menu' ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden bg-slate-50/30 relative`}>
          
          {!isCashOpen && (
            <div className="absolute inset-0 z-50 bg-slate-50/80 backdrop-blur-[2px] flex items-center justify-center p-8 text-center">
              <div className="max-w-xs bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 border-red-50">
                <div className="w-16 h-16 bg-red-50 rounded-3xl mx-auto flex items-center justify-center text-3xl mb-4">🔒</div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Vendas Bloqueadas</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">
                  O caixa está encerrado. Solicite a abertura do turno para lançar pedidos.
                </p>
                <button onClick={onCancel} className="mt-6 w-full py-3 bg-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-500">Voltar</button>
              </div>
            </div>
          )}

          <div className="flex gap-2 p-3 overflow-x-auto bg-white border-b border-slate-100 shrink-0 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.name)} className={`whitespace-nowrap px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${activeCategory === cat.name ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>{cat.name}</button>
            ))}
          </div>
          <div className="flex-1 p-3 overflow-y-auto grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map(product => (
              <button key={product.id} onClick={() => addItem(product)} className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm flex flex-col active:scale-95 transition-all">
                <div className="aspect-video rounded-2xl overflow-hidden mb-2 bg-slate-100">
                  {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-20">🍽️</div>}
                </div>
                <div className="px-1 text-left">
                  <h3 className="text-[10px] font-black text-slate-800 uppercase truncate mb-0.5">{product.name}</h3>
                  <span className="text-[10px] font-black text-emerald-600">R$ {product.price.toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`${mobileView === 'bill' ? 'flex' : 'hidden md:flex'} w-full md:w-[360px] border-l border-slate-100 flex-col bg-white shrink-0 shadow-2xl relative z-20`}>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 scrollbar-hide">
            {table.currentOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 p-8 text-center">
                 <span className="text-5xl mb-4">🛒</span>
                 <p className="text-[10px] font-black uppercase tracking-widest">Nenhum item lançado</p>
              </div>
            ) : (
              table.currentOrders.map(item => (
                <div key={item.id} className={`p-4 flex flex-col gap-3 transition-colors ${item.status === 'DONE' && !item.waiterAcknowledged ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'hover:bg-slate-50'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <p className="text-xs font-black text-slate-900 uppercase leading-tight"><span className="text-indigo-600 mr-1">{item.quantity}x</span> {item.name}</p>
                      <div className="flex gap-2 items-center mt-1">
                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded border ${item.status === 'DONE' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-50 text-slate-400'}`}>{item.status}</span>
                        {item.status === 'DONE' && !item.waiterAcknowledged && (
                          <span className="text-[8px] font-black text-emerald-600 uppercase animate-pulse">PRONTO PARA ENTREGA!</span>
                        )}
                      </div>
                    </div>
                    {item.status !== 'DONE' && (
                      <button onClick={() => removeItem(item.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">✕</button>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    {item.status === 'DONE' && !item.waiterAcknowledged ? (
                      <button 
                        onClick={() => acknowledgeDelivery(item.id)}
                        className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-100"
                      >
                        Confirmar Entrega
                      </button>
                    ) : (
                      <>
                        <div className="flex items-center bg-white rounded-xl border border-slate-200 shadow-sm">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 font-black">-</button>
                          <span className="w-8 text-center text-[10px] font-black">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 font-black">+</button>
                        </div>
                        <span className="text-xs font-black text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 shrink-0">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={onCancel} className="h-14 bg-white border border-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 active:scale-95 transition-all">Sair</button>
              <button onClick={() => window.print()} className="h-14 bg-white border border-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest text-emerald-600 active:scale-95 transition-all">Imprimir</button>
            </div>
            {currentUser.role !== UserRole.WAITER && table.currentOrders.length > 0 && (
              <button 
                onClick={() => onCloseRequest(table)}
                disabled={!isCashOpen}
                className={`w-full h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl active:scale-95 transition-all ${isCashOpen ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-white cursor-not-allowed'}`}
              >
                {isCashOpen ? 'Fechar Conta' : 'Caixa Fechado'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManager;
