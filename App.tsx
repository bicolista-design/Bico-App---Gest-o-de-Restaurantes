
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, UserRole, Product, Table, TableStatus, 
  Category, CompanySettings, CashSession, SaleRecord, Payment
} from './types';
import { INITIAL_PRODUCTS, INITIAL_USERS, INITIAL_TABLES } from './constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TableGrid from './components/TableGrid';
import MenuGrid from './components/MenuGrid';
import OrderManager from './components/OrderManager';
import AdminPanel from './components/AdminPanel';
import KitchenDisplay from './components/KitchenDisplay';
import CategoryManager from './components/CategoryManager';
import SettingsPanel from './components/SettingsPanel';
import Dashboard from './components/Dashboard';

// Canal de comunicação em tempo real entre abas
const syncChannel = new BroadcastChannel('bico_sync_channel');

const App: React.FC = () => {
  const load = (key: string, defaultValue: any) => {
    const saved = localStorage.getItem(key);
    try {
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error("Erro ao carregar dados do localStorage:", e);
      return defaultValue;
    }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  const [activeTab, setActiveTab] = useState<'tables' | 'quick_order' | 'menu' | 'admin' | 'kitchen' | 'categories' | 'settings' | 'dashboard'>('tables');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  
  const [tables, setTables] = useState<Table[]>(() => load('bico_tables', INITIAL_TABLES));
  const [balcaoTables, setBalcaoTables] = useState<Table[]>(() => load('bico_balcao', Array.from({ length: 8 }, (_, i) => ({
    id: `balcao-${ i + 1 }`,
    number: i + 1,
    status: TableStatus.FREE,
    currentOrders: []
  }))));
  const [products, setProducts] = useState<Product[]>(() => load('bico_products', INITIAL_PRODUCTS));
  const [users, setUsers] = useState<User[]>(() => load('bico_users', INITIAL_USERS));
  const [categories, setCategories] = useState<Category[]>(() => load('bico_categories', [
    { id: 'cat1', name: 'Comidas', subcategories: ['Burgers', 'Porções'], defaultSendToKitchen: true },
    { id: 'cat2', name: 'Bebidas', subcategories: ['Cervejas', 'Vinhos'], defaultSendToKitchen: false },
    { id: 'cat3', name: 'Sucos', subcategories: ['Naturais', 'Lata'], defaultSendToKitchen: true },
  ]));
  
  const [sales, setSales] = useState<SaleRecord[]>(() => load('bico_sales', []));
  const [currentCashSession, setCurrentCashSession] = useState<CashSession | null>(() => load('bico_cash_current', null));
  const [cashHistory, setCashHistory] = useState<CashSession[]>(() => load('bico_cash_history', []));

  const [settings, setSettings] = useState<CompanySettings>(() => load('bico_settings', {
    name: 'Bico Gestão Restô',
    razaoSocial: 'Bico App LTDA',
    cnpjCpf: '00.000.000/0001-00',
    address: 'Rua Principal, 100',
    phone: '(11) 99999-9999',
    notificationVolume: 0.8,
    cep: '00000-000',
    whatsapp: '(11) 99999-9999',
    inscricaoEstadual: 'Isento',
    inscricaoMunicipal: '000.000-0',
    numero: '100',
    state: 'SP',
    city: 'São Paulo',
    primaryColor: '#4f46e5',
    secondaryColor: '#10b981',
    accentColor: '#f59e0b',
    fontFamily: 'Inter'
  }));

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Efeito para escutar sincronização de outras abas
  useEffect(() => {
    const handleSync = (event: MessageEvent) => {
      const { type, payload } = event.data;
      setSyncStatus('syncing');
      
      switch (type) {
        case 'TABLES_UPDATE': setTables(payload); break;
        case 'BALCAO_UPDATE': setBalcaoTables(payload); break;
        case 'SALES_UPDATE': setSales(payload); break;
        case 'CASH_UPDATE': 
          setCurrentCashSession(payload.current);
          setCashHistory(payload.history);
          break;
        case 'PRODUCTS_UPDATE': setProducts(payload); break;
        case 'CATEGORIES_UPDATE': setCategories(payload); break;
      }
      
      setTimeout(() => setSyncStatus('synced'), 500);
    };

    syncChannel.addEventListener('message', handleSync);
    return () => syncChannel.removeEventListener('message', handleSync);
  }, []);

  const broadcast = (type: string, payload: any) => {
    syncChannel.postMessage({ type, payload });
  };

  useEffect(() => {
    localStorage.setItem('bico_tables', JSON.stringify(tables));
    localStorage.setItem('bico_balcao', JSON.stringify(balcaoTables));
    localStorage.setItem('bico_products', JSON.stringify(products));
    localStorage.setItem('bico_users', JSON.stringify(users));
    localStorage.setItem('bico_categories', JSON.stringify(categories));
    localStorage.setItem('bico_settings', JSON.stringify(settings));
    localStorage.setItem('bico_sales', JSON.stringify(sales));
    localStorage.setItem('bico_cash_current', JSON.stringify(currentCashSession));
    localStorage.setItem('bico_cash_history', JSON.stringify(cashHistory));
  }, [tables, balcaoTables, products, users, categories, settings, sales, currentCashSession, cashHistory]);

  const requestFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const updateTable = useCallback((updatedTable: Table) => {
    if (updatedTable.id.startsWith('balcao')) {
      const newBalcao = balcaoTables.map(t => t.id === updatedTable.id ? updatedTable : t);
      setBalcaoTables(newBalcao);
      broadcast('BALCAO_UPDATE', newBalcao);
    } else {
      const newTables = tables.map(t => t.id === updatedTable.id ? updatedTable : t);
      setTables(newTables);
      broadcast('TABLES_UPDATE', newTables);
    }
  }, [tables, balcaoTables]);

  const handleOpenCash = (initialBalance: number) => {
    const newSession: CashSession = {
      id: Math.random().toString(36).substr(2, 9),
      openedAt: Date.now(),
      openedBy: currentUser?.name || 'Sistema',
      openingBalance: initialBalance,
      status: 'OPEN'
    };
    setCurrentCashSession(newSession);
    broadcast('CASH_UPDATE', { current: newSession, history: cashHistory });
  };

  const handleCloseCash = () => {
    if (!currentCashSession) return;
    const sessionSales = sales.filter(s => s.cashSessionId === currentCashSession.id);
    const totalSales = sessionSales.reduce((sum, s) => sum + s.total, 0);
    
    const closedSession: CashSession = {
      ...currentCashSession,
      closedAt: Date.now(),
      closedBy: currentUser?.name || 'Sistema',
      closingBalance: currentCashSession.openingBalance + totalSales,
      status: 'CLOSED'
    };
    const newHistory = [closedSession, ...cashHistory];
    setCashHistory(newHistory);
    setCurrentCashSession(null);
    broadcast('CASH_UPDATE', { current: null, history: newHistory });
  };

  const handleCloseTable = (table: Table, payments: Payment[]) => {
    if (!currentCashSession) {
      alert("O caixa precisa estar aberto!");
      return;
    }

    const total = table.currentOrders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const sale: SaleRecord = {
      id: Math.random().toString(36).substr(2, 9),
      tableId: table.id,
      tableName: table.id.startsWith('balcao') ? `Balcão ${table.number}` : `Mesa ${table.number}`,
      total,
      payments,
      items: table.currentOrders,
      closedAt: Date.now(),
      closedBy: currentUser?.name || 'Garçom',
      cashSessionId: currentCashSession.id
    };

    const newSales = [sale, ...sales];
    setSales(newSales);
    broadcast('SALES_UPDATE', newSales);
    updateTable({ ...table, status: TableStatus.FREE, currentOrders: [], lastUpdatedBy: '' });
    setSelectedTableId(null);
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    requestFullscreen();
    const form = e.currentTarget;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      setActiveTab(user.role === UserRole.KITCHEN ? 'kitchen' : 'tables');
    } else {
      alert('Login inválido');
    }
  };

  const handleSelectTable = (table: Table) => {
    requestFullscreen();
    setSelectedTableId(table.id);
  };

  const activeTable = selectedTableId ? [...tables, ...balcaoTables].find(t => t.id === selectedTableId) : null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden flex-col md:flex-row pt-safe">
      {!currentUser ? (
        <div className="h-full w-full flex items-center justify-center bg-slate-900 p-6">
          <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md">
            <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-tighter">Bico App</h2>
            <div className="space-y-4">
              <input name="username" placeholder="Usuário" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 outline-none transition-all font-bold" />
              <input name="password" type="password" placeholder="Senha" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 outline-none transition-all font-bold" />
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95">Entrar</button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <Sidebar syncStatus={syncStatus} activeTab={activeTab} setActiveTab={(tab) => { requestFullscreen(); setActiveTab(tab); }} userRole={currentUser.role} onLogout={() => setCurrentUser(null)} />
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <Header user={currentUser} activeTab={activeTab} onBackToTables={() => setSelectedTableId(null)} onLogout={() => setCurrentUser(null)} />
            <main className="flex-1 overflow-hidden">
              {activeTable ? (
                <OrderManager 
                  table={activeTable} products={products} categories={categories} 
                  onUpdateTable={updateTable} onCancel={() => setSelectedTableId(null)} 
                  currentUser={currentUser} canClose={true} allTables={[...tables, ...balcaoTables]}
                  isCashOpen={!!currentCashSession}
                  onCloseRequest={() => {
                    const total = activeTable.currentOrders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    const method = prompt("Meio de Pagamento (Dinheiro, Cartão, Pix):", "Dinheiro") || "Dinheiro";
                    handleCloseTable(activeTable, [{ method, amount: total }]);
                  }}
                />
              ) : (
                <div className="h-full overflow-y-auto scrollbar-hide">
                  {activeTab === 'tables' && <div className="p-4"><TableGrid tables={tables} onSelectTable={handleSelectTable} /></div>}
                  {activeTab === 'quick_order' && <div className="p-4"><TableGrid tables={balcaoTables} onSelectTable={handleSelectTable} /></div>}
                  {activeTab === 'kitchen' && <KitchenDisplay tables={[...tables, ...balcaoTables]} onUpdateTable={updateTable} userRole={currentUser.role} />}
                  {activeTab === 'menu' && <MenuGrid products={products} setProducts={(p) => { 
                    const newProducts = typeof p === 'function' ? p(products) : p;
                    setProducts(newProducts); 
                    broadcast('PRODUCTS_UPDATE', newProducts); 
                  }} categories={categories} />}
                  {activeTab === 'admin' && <AdminPanel users={users} setUsers={setUsers} />}
                  {activeTab === 'categories' && <CategoryManager categories={categories} setCategories={(c) => {
                    const newCats = typeof c === 'function' ? c(categories) : c;
                    setCategories(newCats);
                    broadcast('CATEGORIES_UPDATE', newCats);
                  }} />}
                  {activeTab === 'dashboard' && <Dashboard sales={sales} currentSession={currentCashSession} history={cashHistory} onOpenCash={handleOpenCash} onCloseCash={handleCloseCash} isAdmin={currentUser.role === UserRole.ADMIN} />}
                  {activeTab === 'settings' && <SettingsPanel settings={settings} setSettings={setSettings} tables={tables} balcaoTables={balcaoTables} onAddTable={() => updateTable({id:`t${tables.length+1}`, number:tables.length+1, status:TableStatus.FREE, currentOrders:[]})} onRemoveTable={() => setTables(tables.slice(0,-1))} onAddBalcao={() => updateTable({id:`balcao-${balcaoTables.length+1}`, number:balcaoTables.length+1, status:TableStatus.FREE, currentOrders:[]})} onRemoveBalcao={() => setBalcaoTables(balcaoTables.slice(0,-1))} />}
                </div>
              )}
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
