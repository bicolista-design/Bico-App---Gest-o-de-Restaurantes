
import React, { useState } from 'react';

interface SaaSPanelProps {
  settings: {
    resellerName: string;
    supportContact: string;
    licenseKey: string;
    planType: string;
    expirationDate: string;
  };
  setSettings: (s: any) => void;
}

const SaaSPanel: React.FC<SaaSPanelProps> = ({ settings, setSettings }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaved, setIsSaved] = useState(false);

  const clients = [
    { id: 'c1', name: 'Pizzaria do João', status: 'Ativo', plan: 'Premium', since: '12/10/2023', val: 'R$ 299,00/mês' },
    { id: 'c2', name: 'Burguer King Unid. Centro', status: 'Ativo', plan: 'Gold', since: '15/01/2024', val: 'R$ 499,00/mês' },
    { id: 'c3', name: 'Sushi Star', status: 'Pendente', plan: 'Basic', since: '22/03/2024', val: 'R$ 199,00/mês' },
  ];

  const handleSave = () => {
    setSettings(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-900 text-white pb-32">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Master Admin</span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">v1.2 Stable</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Painel de Revenda</h1>
            <p className="text-slate-400 font-medium text-sm mt-2">Gerencie licenças, marca branca e faturamento da sua rede.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-slate-800 p-4 rounded-3xl border border-slate-700 flex items-center gap-4">
               <div className="text-right">
                  <p className="text-[8px] font-black text-slate-500 uppercase">MRR Estimado</p>
                  <p className="text-xl font-black text-amber-500">R$ 14.890,00</p>
               </div>
               <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">📈</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* WHITE LABEL CONFIG */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800/50 p-8 rounded-[3rem] border border-slate-700 shadow-2xl">
               <h3 className="text-lg font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                 <span className="text-2xl">🏷️</span> White Label
               </h3>
               
               <div className="space-y-6">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Nome do Revendedor / Sua Empresa</label>
                    <input 
                      value={localSettings.resellerName} 
                      onChange={e => setLocalSettings({...localSettings, resellerName: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 px-5 py-4 rounded-2xl outline-none focus:border-amber-500 transition font-bold text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">E-mail de Suporte Técnico</label>
                    <input 
                      value={localSettings.supportContact} 
                      onChange={e => setLocalSettings({...localSettings, supportContact: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 px-5 py-4 rounded-2xl outline-none focus:border-amber-500 transition font-bold text-sm" 
                    />
                  </div>
                  
                  <button 
                    onClick={handleSave}
                    className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                      isSaved ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-900 hover:scale-105'
                    }`}
                  >
                    {isSaved ? 'Configurações Gravadas' : 'Gravar Marca Branca'}
                  </button>
               </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Licença desta Unidade</h4>
                 <p className="text-2xl font-black mb-6">{localSettings.licenseKey}</p>
                 <div className="flex justify-between items-center text-[10px] font-bold">
                    <span>PLANO: {localSettings.planType.toUpperCase()}</span>
                    <span>EXPIRA: {localSettings.expirationDate}</span>
                 </div>
               </div>
               <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">💎</div>
            </div>
          </div>

          {/* CLIENT MANAGEMENT */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-[3rem] border border-slate-700 overflow-hidden shadow-2xl">
               <div className="p-8 border-b border-slate-700 flex justify-between items-center bg-slate-800/20">
                  <h3 className="text-lg font-black uppercase tracking-tighter">Sua Base de Clientes (Instâncias)</h3>
                  <button className="bg-slate-700 px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-slate-600 transition">Novo Cliente</button>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-900 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                       <tr>
                          <th className="px-8 py-5">Estabelecimento</th>
                          <th className="px-8 py-5">Status</th>
                          <th className="px-8 py-5">Plano</th>
                          <th className="px-8 py-5">Faturamento</th>
                          <th className="px-8 py-5 text-right">Gestão</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                       {clients.map(client => (
                         <tr key={client.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-8 py-6">
                               <p className="font-black text-sm text-slate-200">{client.name}</p>
                               <p className="text-[10px] text-slate-500 font-bold uppercase">Desde {client.since}</p>
                            </td>
                            <td className="px-8 py-6">
                               <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                                 client.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                               }`}>
                                 {client.status}
                               </span>
                            </td>
                            <td className="px-8 py-6">
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{client.plan}</span>
                            </td>
                            <td className="px-8 py-6">
                               <span className="text-sm font-black text-amber-500">{client.val}</span>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase transition">Detalhes</button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
               
               <div className="p-10 text-center opacity-30">
                  <p className="text-xs font-bold uppercase tracking-[0.3em]">Fim da Lista de Clientes</p>
               </div>
            </div>
          </div>

        </div>

        {/* RESELLER TIPS */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { t: 'Expansão', d: 'Licenças Gold permitem até 50 mesas e suporte prioriotário via WhatsApp.', c: 'text-indigo-400' },
             { t: 'Faturamento', d: 'Lembre-se de cobrar a taxa de implantação para treinamento da equipe.', c: 'text-emerald-400' },
             { t: 'Segurança', d: 'Arquivos de backup são criptografados com a chave mestra do seu painel.', c: 'text-amber-400' },
           ].map(tip => (
             <div key={tip.t} className="bg-slate-800/30 p-6 rounded-[2rem] border border-slate-700">
                <h5 className={`text-[10px] font-black uppercase tracking-widest mb-2 ${tip.c}`}>{tip.t}</h5>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{tip.d}</p>
             </div>
           ))}
        </div>

      </div>
    </div>
  );
};

export default SaaSPanel;
