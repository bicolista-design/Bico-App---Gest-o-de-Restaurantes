
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  userRole: UserRole;
  onLogout: () => void;
  syncStatus?: 'synced' | 'syncing' | 'error';
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole, onLogout, syncStatus = 'synced' }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const requestFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handleTabChange = (tabId: string) => {
    requestFullscreen();
    setActiveTab(tabId);
  };

  const menuGroups = [
    {
      title: 'Atendimento',
      items: [
        { id: 'tables', label: 'Mesas', icon: '🪑', roles: [UserRole.ADMIN, UserRole.WAITER, UserRole.CASHIER] },
        { id: 'quick_order', label: 'Balcão', icon: '📝', roles: [UserRole.ADMIN, UserRole.WAITER, UserRole.CASHIER] },
      ]
    },
    {
      title: 'Produção',
      items: [
        { id: 'kitchen', label: 'Cozinha', icon: '🍳', roles: [UserRole.ADMIN, UserRole.WAITER, UserRole.CASHIER, UserRole.KITCHEN] },
      ]
    },
    {
      title: 'Gestão',
      items: [
        { id: 'dashboard', label: 'Financeiro', icon: '📊', roles: [UserRole.ADMIN, UserRole.CASHIER] },
        { id: 'menu', label: 'Cardápio', icon: '🍔', roles: [UserRole.ADMIN] },
        { id: 'categories', label: 'Categorias', icon: '📂', roles: [UserRole.ADMIN] },
        { id: 'admin', label: 'Equipe', icon: '👥', roles: [UserRole.ADMIN] },
      ]
    },
    {
      title: 'Sistema',
      items: [
        { id: 'qrcodes', label: 'QR Codes', icon: '🔗', roles: [UserRole.ADMIN] },
        { id: 'settings', label: 'Ajustes', icon: '⚙️', roles: [UserRole.ADMIN] },
      ]
    }
  ];

  return (
    <>
      <aside className={`hidden md:flex bg-slate-950 text-slate-100 flex-col h-full shadow-2xl z-50 shrink-0 transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-10 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center text-[10px] text-white shadow-lg z-[60] hover:scale-110 transition-transform">
          {isCollapsed ? '→' : '←'}
        </button>

        <div className={`p-6 mb-4 flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center text-xl shrink-0">🍷</div>
          {!isCollapsed && <h1 className="text-xl font-black tracking-tighter whitespace-nowrap">Bico App</h1>}
        </div>

        <nav className="flex-1 px-3 space-y-6 overflow-y-auto scrollbar-hide py-2">
          {menuGroups.map((group, gIdx) => {
            const allowedItems = group.items.filter(item => item.roles.includes(userRole));
            if (allowedItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                {!isCollapsed && (
                  <p className="px-4 text-[8px] font-black text-slate-600 uppercase tracking-[0.25em] mb-2">{group.title}</p>
                )}
                {allowedItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`group relative w-full flex items-center rounded-2xl transition-all duration-200 ${
                      activeTab === item.id 
                        ? 'bg-brand-primary shadow-lg font-bold' 
                        : 'hover:bg-slate-900 text-slate-500 font-semibold'
                    } ${isCollapsed ? 'justify-center py-4' : 'px-4 py-3 gap-4'}`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {!isCollapsed && <span className="text-[10px] uppercase tracking-widest font-black">{item.label}</span>}
                    
                    {isCollapsed && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl whitespace-nowrap z-[100] border border-slate-800">
                        {item.label}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto px-3 pb-6 space-y-4">
          {!isCollapsed && (
            <div className="px-4 py-4 bg-slate-900/40 rounded-3xl border border-slate-900/50">
               <div className="flex items-center justify-between mb-2">
                 <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Sincronização</p>
                 <div className="flex items-center gap-1">
                   <span className={`w-1.5 h-1.5 rounded-full ${
                     syncStatus === 'synced' ? 'bg-emerald-500' : 
                     syncStatus === 'syncing' ? 'bg-amber-500 animate-ping' : 'bg-red-500'
                   }`}></span>
                   <span className="text-[7px] font-black text-slate-300 uppercase">
                     {syncStatus === 'synced' ? 'Online' : syncStatus === 'syncing' ? 'Sinc...' : 'Erro'}
                   </span>
                 </div>
               </div>
               <p className="text-[10px] font-black text-slate-300 tracking-tight leading-none mb-0.5">Terminal Ativo</p>
               <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-900/50">
                 <span className="text-[8px] text-brand-primary font-black tracking-widest uppercase">v1.2.0</span>
               </div>
            </div>
          )}

          <button onClick={onLogout} className={`flex items-center rounded-2xl transition-all duration-200 hover:bg-red-500/10 text-slate-400 hover:text-red-400 ${isCollapsed ? 'justify-center w-12 h-12' : 'w-full px-5 py-4 gap-4'}`}>
            <span className="text-lg">🚪</span>
            {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-widest">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-safe">
        <div className="flex items-center h-20 px-2 overflow-x-auto scrollbar-hide">
          <div className="flex w-full items-center gap-1">
            {menuGroups.flatMap(g => g.items).filter(item => item.roles.includes(userRole)).map(item => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-col items-center justify-center min-w-[75px] h-16 rounded-2xl transition-all active:scale-95 ${
                  activeTab === item.id ? 'scale-105' : 'text-slate-300 opacity-60'
                }`}
              >
                <div 
                  className={`w-9 h-9 flex items-center justify-center rounded-xl mb-1 ${
                    activeTab === item.id ? 'bg-brand-primary shadow-lg' : 'bg-slate-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-tighter ${activeTab === item.id ? 'text-slate-900' : ''}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
