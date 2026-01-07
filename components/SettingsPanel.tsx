
import React, { useState, useEffect } from 'react';
import { CompanySettings, Table } from '../types';

interface SettingsPanelProps {
  settings: CompanySettings;
  setSettings: (settings: CompanySettings) => void;
  tables: Table[];
  balcaoTables: Table[];
  onAddTable: () => void;
  onAddBalcao: () => void;
  onRemoveTable: () => void;
  onRemoveBalcao: () => void;
}

const BRAZIL_STATES = [
  { uf: 'AC', name: 'Acre' }, { uf: 'AL', name: 'Alagoas' }, { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' }, { uf: 'BA', name: 'Bahia' }, { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' }, { uf: 'ES', name: 'Espírito Santo' }, { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' }, { uf: 'MT', name: 'Mato Grosso' }, { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' }, { uf: 'PA', name: 'Pará' }, { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' }, { uf: 'PE', name: 'Pernambuco' }, { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' }, { uf: 'RN', name: 'Rio Grande do Norte' }, { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' }, { uf: 'RR', name: 'Roraima' }, { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' }, { uf: 'SE', name: 'Sergipe' }, { uf: 'TO', name: 'Tocantins' }
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  settings, 
  setSettings, 
  tables, 
  balcaoTables,
  onAddTable,
  onAddBalcao,
  onRemoveTable,
  onRemoveBalcao
}) => {
  const [localSettings, setLocalSettings] = useState<CompanySettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Efeito para busca automática de CEP
  useEffect(() => {
    const cepDigits = localSettings.cep.replace(/\D/g, '');
    if (cepDigits.length === 8) {
      const fetchAddress = async () => {
        setIsFetchingCep(true);
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
          const data = await response.json();
          if (!data.erro) {
            setLocalSettings(prev => ({
              ...prev,
              city: data.localidade,
              state: data.uf,
              address: data.logradouro || prev.address
            }));
          }
        } catch (error) {
          console.error("Erro ao buscar CEP:", error);
        } finally {
          setIsFetchingCep(false);
        }
      };
      fetchAddress();
    }
  }, [localSettings.cep]);

  const fonts = [
    { name: 'Inter', icon: 'I', family: 'Inter, sans-serif' },
    { name: 'Poppins', icon: 'P', family: 'Poppins, sans-serif' },
    { name: 'Montserrat', icon: 'M', family: 'Montserrat, sans-serif' },
    { name: 'Roboto', icon: 'R', family: 'Roboto, sans-serif' },
    { name: 'Open Sans', icon: 'O', family: 'Open Sans, sans-serif' },
  ];

  // Helper functions for masking
  const maskCPFCNPJ = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 14);
    if (raw.length <= 11) {
      return raw
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return raw
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const maskCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .slice(0, 8)
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const maskPhone = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 11);
    if (raw.length <= 10) {
      return raw
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return raw
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleLocalUpdate = (field: keyof CompanySettings, value: any) => {
    let formattedValue = value;
    
    if (field === 'cnpjCpf') formattedValue = maskCPFCNPJ(value);
    if (field === 'cep') formattedValue = maskCEP(value);
    if (field === 'phone' || field === 'whatsapp') formattedValue = maskPhone(value);

    setLocalSettings({ ...localSettings, [field]: formattedValue });
    setIsSaved(false);
  };

  const handleGlobalSave = () => {
    setSettings(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-50 pb-32">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Painel de Controle</h1>
        <p className="text-slate-500 font-medium text-xs">Gerencie a infraestrutura e identidade da sua unidade.</p>
      </div>

      <div className="space-y-8 max-w-5xl">
        
        {/* INFRAESTRUTURA */}
        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl">🪑</div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Infraestrutura do Salão</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Controle de capacidade de atendimento</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-[2.5rem] bg-indigo-50/50 border-2 border-indigo-100 flex flex-col items-center text-center group">
               <div className="mb-4">
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-1">Mesas Ativas</span>
                 <h4 className="text-4xl font-black text-indigo-600 tracking-tighter">+{tables.length} UNID.</h4>
               </div>
               <div className="flex gap-3 w-full max-w-[240px]">
                  <button onClick={onRemoveTable} className="flex-1 h-14 bg-white border-2 border-indigo-100 text-indigo-300 rounded-2xl font-black text-xl hover:bg-red-50 hover:text-red-500 transition-all">-</button>
                  <button onClick={onAddTable} className="flex-[2] h-14 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100">+ Adicionar</button>
               </div>
            </div>

            <div className="p-6 rounded-[2.5rem] bg-emerald-50/50 border-2 border-emerald-100 flex flex-col items-center text-center group">
               <div className="mb-4">
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] block mb-1">Slots Balcão</span>
                 <h4 className="text-4xl font-black text-emerald-600 tracking-tighter">+{balcaoTables.length} UNID.</h4>
               </div>
               <div className="flex gap-3 w-full max-w-[240px]">
                  <button onClick={onRemoveBalcao} className="flex-1 h-14 bg-white border-2 border-emerald-100 text-emerald-300 rounded-2xl font-black text-xl hover:bg-red-50 hover:text-red-500 transition-all">-</button>
                  <button onClick={onAddBalcao} className="flex-[2] h-14 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100">+ Adicionar</button>
               </div>
            </div>
          </div>
        </div>

        {/* NOTIFICAÇÕES SONORAS */}
        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl">🔔</div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Notificações Sonoras</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ajuste o volume dos alertas de pronto</p>
            </div>
          </div>

          <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Volume do Alerta (Pronto)</span>
              <span className="text-xl font-black text-indigo-600">{(localSettings.notificationVolume * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={localSettings.notificationVolume} 
              onChange={e => handleLocalUpdate('notificationVolume', parseFloat(e.target.value))}
              className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between mt-2">
              <span className="text-[8px] font-black text-slate-400 uppercase">Silencioso</span>
              <span className="text-[8px] font-black text-slate-400 uppercase">Máximo (Alto)</span>
            </div>
          </div>
          
          <div className="flex justify-end">
             <button onClick={handleGlobalSave} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Aplicar Volume</button>
          </div>
        </div>

        {/* DADOS DA EMPRESA */}
        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">🏢</div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Dados da Empresa</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informações fiscais e de contato</p>
              </div>
            </div>
            
            <button 
              onClick={handleGlobalSave}
              className={`px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl flex items-center gap-2 ${
                isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
              }`}
            >
              {isSaved ? '✅ Salvo com Sucesso' : '💾 Salvar Alterações'}
            </button>
          </div>

          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-5">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] pb-2 border-b-2 border-indigo-50">Identificação</h4>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome Fantasia</label>
                  <input value={localSettings.name} onChange={e => handleLocalUpdate('name', e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition font-bold text-slate-800" placeholder="Ex: Bico App Restô" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Razão Social</label>
                  <input value={localSettings.razaoSocial} onChange={e => handleLocalUpdate('razaoSocial', e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition font-bold text-slate-800" placeholder="Ex: Restaurante e Lanchonete LTDA" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">CNPJ / CPF</label>
                    <input value={localSettings.cnpjCpf} onChange={e => handleLocalUpdate('cnpjCpf', e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition font-bold text-slate-800" placeholder="000.000.000-00" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">I.E.</label>
                      <input value={localSettings.inscricaoEstadual} onChange={e => handleLocalUpdate('inscricaoEstadual', e.target.value)} className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition font-bold text-slate-800" placeholder="Isento" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">I.M.</label>
                      <input value={localSettings.inscricaoMunicipal} onChange={e => handleLocalUpdate('inscricaoMunicipal', e.target.value)} className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition font-bold text-slate-800" placeholder="000.000-0" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] pb-2 border-b-2 border-emerald-50">Contato Comercial</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Telefone Principal</label>
                    <input value={localSettings.phone} onChange={e => handleLocalUpdate('phone', e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition font-bold text-slate-800" placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">WhatsApp de Pedidos</label>
                    <input value={localSettings.whatsapp} onChange={e => handleLocalUpdate('whatsapp', e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition font-bold text-slate-800" placeholder="(00) 00000-0000" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5 pt-8 border-t border-slate-50">
               <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] pb-2 border-b-2 border-amber-50">Localização da Unidade</h4>
               <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">CEP {isFetchingCep && <span className="animate-pulse text-indigo-500">...</span>}</label>
                    <input value={localSettings.cep} onChange={e => handleLocalUpdate('cep', e.target.value)} className={`w-full px-5 py-3.5 rounded-2xl border-2 ${isFetchingCep ? 'border-indigo-300' : 'border-slate-100'} focus:border-indigo-500 outline-none transition font-bold text-slate-800`} placeholder="00000-000" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Rua / Logradouro</label>
                    <input value={localSettings.address} onChange={e => handleLocalUpdate('address', e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition font-bold text-slate-800" placeholder="Av. das Américas" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Número</label>
                    <input value={localSettings.numero} onChange={e => handleLocalUpdate('numero', e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition font-bold text-slate-800" placeholder="123" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Estado (UF)</label>
                    <select 
                      value={localSettings.state} 
                      onChange={e => handleLocalUpdate('state', e.target.value)} 
                      className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition font-bold text-slate-800 bg-white"
                    >
                      <option value="">Selecione</option>
                      {BRAZIL_STATES.map(s => (
                        <option key={s.uf} value={s.uf}>{s.uf} - {s.name}</option>
                      ))}
                    </select>
                  </div>
               </div>
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Cidade</label>
                  <input value={localSettings.city} onChange={e => handleLocalUpdate('city', e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition font-bold text-slate-800" placeholder="Sua Cidade" />
               </div>
            </div>
          </div>
        </div>

        {/* IDENTIDADE VISUAL */}
        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-2xl">🎨</div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Identidade Visual</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cores e Tipografia da Aplicação</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">Paleta de Cores</p>
               <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Principal</span>
                    <input type="color" value={localSettings.primaryColor} onChange={e => handleLocalUpdate('primaryColor', e.target.value)} className="w-10 h-10 rounded-full cursor-pointer border-none shadow-sm" />
                  </div>
                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Secundária</span>
                    <input type="color" value={localSettings.secondaryColor} onChange={e => handleLocalUpdate('secondaryColor', e.target.value)} className="w-10 h-10 rounded-full cursor-pointer border-none shadow-sm" />
                  </div>
                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Destaque</span>
                    <input type="color" value={localSettings.accentColor} onChange={e => handleLocalUpdate('accentColor', e.target.value)} className="w-10 h-10 rounded-full cursor-pointer border-none shadow-sm" />
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">Fonte do Sistema</p>
               <div className="grid grid-cols-1 gap-2">
                  {fonts.map(font => (
                    <button 
                      key={font.name} 
                      onClick={() => handleLocalUpdate('fontFamily', font.name as any)} 
                      className={`w-full py-4 px-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                        localSettings.fontFamily === font.name 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                         <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-sm group-hover:bg-white">{font.icon}</span>
                         <span className="text-xs font-black uppercase tracking-widest">{font.name}</span>
                      </div>
                      {localSettings.fontFamily === font.name && <span className="text-lg">✓</span>}
                    </button>
                  ))}
               </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-50 flex justify-end">
             <button 
                onClick={handleGlobalSave}
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 active:scale-95"
             >
                Aplicar Identidade Visual
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
