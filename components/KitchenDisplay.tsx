
import React from 'react';
import { Table, UserRole } from '../types';

interface KitchenDisplayProps {
  tables: Table[];
  onUpdateTable: (table: Table) => void;
  userRole: UserRole;
}

const KitchenDisplay: React.FC<KitchenDisplayProps> = ({ tables, onUpdateTable, userRole }) => {
  const isReadOnly = userRole === UserRole.WAITER;

  const playSound = () => {
    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const audioCtx = new AudioContextClass();
      
      // Beep duplo para maior atenção
      [0, 0.2].forEach(delay => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + delay); // Nota Lá (A5)
        gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + 0.2);
      });
    } catch (e) { console.warn("Erro ao tocar som:", e); }
  };

  const setStatus = (tableId: string, orderId: string, next: 'PENDING' | 'PREPARING' | 'DONE') => {
    if (isReadOnly) return;
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    
    if (next === 'DONE') playSound();

    const updated = table.currentOrders.map(o => {
      if (o.id === orderId) {
        return { 
          ...o, 
          status: next, 
          waiterAcknowledged: next === 'DONE' ? false : o.waiterAcknowledged, 
          preparationStartedAt: next === 'PREPARING' ? Date.now() : o.preparationStartedAt 
        };
      }
      return o;
    });
    onUpdateTable({ ...table, currentOrders: updated });
  };

  // Garante que pegamos itens de todas as mesas e balcão que estão marcados para cozinha
  const items = tables.flatMap(t => 
    (t.currentOrders || [])
      .filter(o => o.sendToKitchen === true && o.status !== 'DONE')
      .map(o => ({ ...o, tId: t.id, tNum: t.number }))
  ).sort((a, b) => a.timestamp - b.timestamp); // Mais antigos primeiro

  return (
    <div className="p-4 md:p-8 h-full bg-slate-50 overflow-y-auto pb-32">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-900">Pedidos Cozinha</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Fila de Produção em tempo real</p>
        </div>
        <div className="bg-indigo-600 text-white px-5 py-2 rounded-2xl font-black text-xs shadow-lg">
          {items.length} PENDENTES
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-20">
          <span className="text-8xl mb-6">👨‍🍳</span>
          <p className="font-black uppercase text-2xl tracking-tighter">Tudo pronto!</p>
          <p className="text-xs font-bold mt-2 uppercase tracking-widest">Nenhum pedido na fila</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(item => (
            <div 
              key={item.id} 
              className={`p-6 rounded-[2.5rem] bg-white border-2 shadow-sm transition-all animate-in zoom-in duration-200 ${
                item.status === 'PREPARING' ? 'border-orange-500 ring-4 ring-orange-50' : 'border-slate-100'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                    {item.tId.startsWith('balcao') ? 'Balcão' : 'Mesa'} #{item.tNum}
                  </p>
                  <h3 className="text-xl font-black text-slate-800 leading-tight uppercase mt-1">
                    {item.quantity}x {item.name}
                  </h3>
                </div>
              </div>

              <div className="mb-6">
                 <div className="flex items-center gap-2 mb-1">
                   <div className={`w-2 h-2 rounded-full ${item.status === 'PENDING' ? 'bg-slate-300' : 'bg-orange-500 animate-pulse'}`}></div>
                   <p className="text-[10px] font-black text-slate-500 uppercase">
                     {item.status === 'PENDING' ? 'Aguardando' : 'No Fogo'}
                   </p>
                 </div>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Pedido há {Math.floor((Date.now() - item.timestamp) / 60000)} min</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  disabled={item.status === 'PREPARING' || isReadOnly} 
                  onClick={() => setStatus(item.tId, item.id, 'PREPARING')} 
                  className={`py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${
                    item.status === 'PREPARING' 
                    ? 'bg-orange-500 text-white shadow-lg' 
                    : 'bg-slate-900 text-white hover:bg-indigo-600 active:scale-95'
                  }`}
                >
                  Iniciar
                </button>
                
                <button 
                  disabled={isReadOnly} 
                  onClick={() => setStatus(item.tId, item.id, 'DONE')} 
                  className="py-4 bg-emerald-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl active:scale-95"
                >
                  Pronto
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;
