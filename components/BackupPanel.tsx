
import React, { useState } from 'react';

interface BackupPanelProps {
  data: any;
  onBackup: () => void;
  hasBackedUp: boolean;
}

const BackupPanel: React.FC<BackupPanelProps> = ({ data, onBackup, hasBackedUp }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRunBackup = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onBackup();
      setIsAnimating(false);
    }, 1500);
  };

  const dataStats = [
    { label: 'Mesas e Balcão', count: (data.tables?.length || 0) + (data.balcaoTables?.length || 0), icon: '🪑' },
    { label: 'Produtos Cadastrados', count: data.products?.length || 0, icon: '🍔' },
    { label: 'Vendas Realizadas', count: data.sales?.length || 0, icon: '💰' },
    { label: 'Usuários/Equipe', count: data.users?.length || 0, icon: '👥' },
    { label: 'Histórico de Caixa', count: data.cashHistory?.length || 0, icon: '📊' },
  ];

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-50 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">Central de Backup</h1>
          <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-2">Segurança de Dados e Exportação de Turno</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2 bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-6xl mb-8 shadow-inner transition-all duration-1000 ${
              hasBackedUp ? 'bg-emerald-50 text-emerald-500 rotate-0' : 'bg-slate-50 text-slate-300 -rotate-12'
            }`}>
              {hasBackedUp ? '🛡️' : '💾'}
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-4">
              {hasBackedUp ? 'Dados Protegidos!' : 'Backup Requerido'}
            </h2>
            
            <p className="text-slate-500 text-sm max-w-sm mb-10 leading-relaxed font-medium">
              {hasBackedUp 
                ? 'Seus dados foram exportados com sucesso nesta sessão. Você já pode encerrar o sistema com segurança.' 
                : 'Para garantir a integridade das suas vendas e configurações, é obrigatório gerar uma cópia de segurança antes de sair.'}
            </p>

            <button 
              onClick={handleRunBackup}
              disabled={isAnimating}
              className={`w-full max-w-sm py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${
                hasBackedUp 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'bg-slate-900 text-white hover:bg-indigo-600'
              }`}
            >
              {isAnimating ? (
                <>
                  <span className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processando...
                </>
              ) : (
                <>
                  {hasBackedUp ? '🔄 Refazer Backup' : '💾 Gerar Arquivo de Backup'}
                </>
              )}
            </button>
            
            {hasBackedUp && (
              <p className="mt-4 text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
                Último backup: Agora mesmo
              </p>
            )}
          </div>

          <div className="space-y-4">
             <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-full">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 pb-2 border-b border-slate-50">Resumo do Pacote</h3>
                <div className="space-y-6">
                   {dataStats.map(stat => (
                     <div key={stat.label} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <span className="text-xl group-hover:scale-120 transition-transform">{stat.icon}</span>
                           <span className="text-[9px] font-black text-slate-500 uppercase">{stat.label}</span>
                        </div>
                        <span className="text-xs font-black text-slate-900">{stat.count}</span>
                     </div>
                   ))}
                </div>
                
                <div className="mt-10 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                   <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-2">Dica de Segurança</p>
                   <p className="text-[9px] text-indigo-400 font-bold leading-relaxed">
                     Guarde o arquivo .json em um pendrive ou na nuvem após o download.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupPanel;
