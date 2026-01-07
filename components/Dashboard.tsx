
import React, { useMemo, useState } from 'react';
import { SaleRecord, CashSession } from '../types';
import { analyzeDailyPerformance } from '../geminiService';

interface DashboardProps {
  sales: SaleRecord[];
  currentSession: CashSession | null;
  history: CashSession[];
  onOpenCash: (initial: number) => void;
  onCloseCash: () => void;
  isAdmin: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  sales = [], 
  currentSession, 
  history = [], 
  onOpenCash, 
  onCloseCash, 
  isAdmin
}) => {
  const [openingValue, setOpeningValue] = useState<string>('0.00');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const sessionSales = useMemo(() => {
    if (!currentSession) return [];
    return sales.filter(s => s && s.cashSessionId === currentSession.id);
  }, [sales, currentSession]);

  const stats = useMemo(() => {
    const totalSales = sessionSales.reduce((sum, s) => sum + (s?.total || 0), 0);
    const avgTicket = sessionSales.length > 0 ? totalSales / sessionSales.length : 0;
    return { totalSales, avgTicket };
  }, [sessionSales]);

  const salesByMethod = useMemo(() => {
    const methods: Record<string, number> = { 'Dinheiro': 0, 'Cartão': 0, 'Pix': 0 };
    sessionSales.forEach(s => {
      if (s?.payments && Array.isArray(s.payments)) {
        s.payments.forEach(p => {
          const m = p.method || 'Dinheiro';
          if (methods[m] !== undefined) methods[m] += p.amount;
          else methods['Dinheiro'] += p.amount;
        });
      }
    });
    return methods;
  }, [sessionSales]);

  const handleAIAnalysis = async () => {
    setLoadingAI(true);
    const insight = await analyzeDailyPerformance({
      total: stats.totalSales,
      avgTicket: stats.avgTicket,
      methods: salesByMethod,
      numOrders: sessionSales.length
    });
    setAiInsight(insight);
    setLoadingAI(false);
  };

  if (!currentSession) {
    return (
      <div className="p-4 md:p-8 h-full flex items-center justify-center bg-slate-50 pb-24">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-100">
           <div className="text-center mb-8">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-6">🔒</div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Caixa Fechado</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Inicie o turno para registrar vendas</p>
           </div>
           
           <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fundo de Caixa (Troco)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl">R$</span>
                  <input 
                    type="number"
                    value={openingValue}
                    onChange={(e) => setOpeningValue(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-3xl border-2 border-slate-100 focus:border-indigo-600 outline-none font-black text-2xl text-slate-800"
                  />
                </div>
              </div>

              <button 
                onClick={() => onOpenCash(parseFloat(openingValue) || 0)}
                className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95"
              >
                Abrir Caixa Turno
              </button>
           </div>
        </div>
      </div>
    );
  }

  // Cast Object.values to number[] to fix 'unknown' type error in Math.max spread
  const maxVal = Math.max(...(Object.values(salesByMethod) as number[]), 1);

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-50 pb-32 scrollbar-hide">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Financeiro Inteligente</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
            {currentSession.openedBy} • Início {new Date(currentSession.openedAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleAIAnalysis}
            disabled={loadingAI || sessionSales.length === 0}
            className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loadingAI ? 'Analisando...' : '✨ Análise BI'}
          </button>
          <button 
            onClick={() => confirm("Fechar o caixa agora?") && onCloseCash()}
            className="flex-1 md:flex-none bg-red-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95"
          >
            Fechar Turno
          </button>
        </div>
      </div>
      
      {aiInsight && (
        <div className="mb-8 p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden animate-in slide-in-from-top duration-500">
           <button onClick={() => setAiInsight(null)} className="absolute top-4 right-4 opacity-50 hover:opacity-100">✕</button>
           <h3 className="text-[10px] font-black uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
             <span className="text-lg">✨</span> Dicas do Consultor IA
           </h3>
           <div className="text-xs font-medium leading-relaxed whitespace-pre-wrap">
             {aiInsight}
           </div>
           <div className="absolute -bottom-6 -right-6 text-8xl opacity-10">🧠</div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10 text-white">
        <div className="bg-indigo-600 p-6 rounded-[2.5rem] shadow-lg relative overflow-hidden">
          <p className="opacity-70 font-black uppercase text-[8px] tracking-[0.2em] mb-1">Caixa Inicial</p>
          <p className="text-2xl font-black">R$ {currentSession.openingBalance.toFixed(2)}</p>
          <div className="absolute top-4 right-4 opacity-20 text-2xl">🏦</div>
        </div>
        <div className="bg-emerald-500 p-6 rounded-[2.5rem] shadow-lg relative overflow-hidden">
          <p className="opacity-70 font-black uppercase text-[8px] tracking-[0.2em] mb-1">Ticket Médio</p>
          <p className="text-2xl font-black">R$ {stats.avgTicket.toFixed(2)}</p>
          <div className="absolute top-4 right-4 opacity-20 text-2xl">📈</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-lg relative overflow-hidden">
          <p className="opacity-70 font-black uppercase text-[8px] tracking-[0.2em] mb-1">Vendas Totais</p>
          <p className="text-2xl font-black">R$ {stats.totalSales.toFixed(2)}</p>
          <div className="absolute top-4 right-4 opacity-20 text-2xl">💰</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
           <h3 className="text-sm font-black text-slate-800 mb-8 uppercase tracking-widest">Entradas por Método</h3>
           <div className="space-y-6">
              {/* Cast Object.entries to [string, number][] to fix 'unknown' type issues on value.toFixed and arithmetic operation */}
              {(Object.entries(salesByMethod) as [string, number][]).map(([method, value]) => (
                <div key={method} className="space-y-2">
                   <div className="flex justify-between items-end">
                      <span className="font-black text-slate-400 text-[10px] uppercase">{method}</span>
                      <span className="font-black text-slate-900 text-xs">R$ {value.toFixed(2)}</span>
                   </div>
                   <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                        style={{ width: `${(value / maxVal) * 100}%` }}
                      ></div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-widest">Últimos Lançamentos</h3>
          <div className="space-y-3">
             {sessionSales.slice(0, 5).map(sale => (
               <div key={sale.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-all cursor-pointer group">
                  <div>
                    <p className="text-[10px] font-black text-slate-800 uppercase group-hover:text-indigo-600">{sale.tableName}</p>
                    <p className="text-[8px] font-bold text-slate-400">{new Date(sale.closedAt).toLocaleTimeString()}</p>
                  </div>
                  <span className="text-xs font-black text-emerald-600">R$ {sale.total.toFixed(2)}</span>
               </div>
             ))}
             {sessionSales.length === 0 && (
               <p className="text-center py-10 text-slate-300 font-bold uppercase text-[10px]">Nenhuma venda registrada</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
