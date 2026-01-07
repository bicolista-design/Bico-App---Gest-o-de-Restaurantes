
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  activeTab: string;
  onBackToTables: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, activeTab, onBackToTables, onLogout }) => {
  const titles: Record<string, string> = {
    tables: 'Mesas',
    quick_order: 'Venda Rápida',
    menu: 'Cardápio',
    kitchen: 'Cozinha',
    dashboard: 'Caixa',
    admin: 'Equipe',
    categories: 'Categorias',
    settings: 'Ajustes'
  };

  const isNotOnTables = activeTab !== 'tables' && activeTab !== 'quick_order';

  return (
    <header className="h-12 md:h-14 bg-white border-b border-slate-200 flex items-center justify-between px-3 md:px-6 shrink-0 relative z-30 shadow-sm">
      <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
        {isNotOnTables && (
          <button 
            onClick={onBackToTables}
            className="flex items-center gap-1 bg-slate-100 hover:bg-indigo-600 text-slate-600 hover:text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg transition-all font-black text-[8px] md:text-[9px] uppercase tracking-widest border border-slate-200 shrink-0"
          >
            <span className="text-[10px]">←</span> 
            <span className="hidden xs:inline">Voltar</span>
          </button>
        )}
        <h2 className="text-[9px] md:text-xs font-black text-slate-900 uppercase tracking-[0.15em] truncate">
          {titles[activeTab]}
        </h2>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-[9px] font-black text-slate-900 leading-none">{user.name}</p>
          <p className="text-[7px] text-slate-400 font-bold uppercase mt-0.5">{user.role}</p>
        </div>
        
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
          <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-[9px] md:text-[10px] border-2 border-indigo-50 shadow-sm shrink-0">
            {user.name.charAt(0)}
          </div>
          
          <button 
            onClick={onLogout}
            title="Sair do sistema"
            className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-lg border transition-all active:scale-95 shadow-sm shrink-0 bg-white text-red-500 border-red-50 hover:bg-red-500 hover:text-white"
          >
            <span className="text-xs md:text-sm">🚪</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
