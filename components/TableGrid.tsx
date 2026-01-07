
import React from 'react';
import { Table, TableStatus } from '../types';

interface TableGridProps {
  tables: Table[];
  onSelectTable: (table: Table) => void;
}

const TableCard: React.FC<{ table: Table, onClick: () => void }> = ({ table, onClick }) => {
  const isOccupied = table.status !== TableStatus.FREE;
  const subtotal = table.currentOrders.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  
  // Verifica se há qualquer item pronto que ainda não foi reconhecido/entregue pelo garçom
  const readyItemsCount = table.currentOrders.filter(o => o.status === 'DONE' && o.waiterAcknowledged === false).length;
  const hasReadyItems = readyItemsCount > 0;

  return (
    <button
      onClick={onClick}
      className={`relative aspect-square p-3 rounded-[2.5rem] border-4 flex flex-col items-center justify-between transition-all active:scale-95 shadow-lg overflow-visible ${
        hasReadyItems 
          ? 'bg-emerald-500 border-emerald-300 text-white animate-[pulse_1.5s_infinite]'
          : isOccupied 
            ? 'bg-indigo-600 border-indigo-500 text-white' 
            : 'bg-white border-slate-100 text-slate-200'
      }`}
    >
      {/* Badge de Notificação Flutuante */}
      {hasReadyItems && (
        <div className="absolute -top-3 -right-3 w-10 h-10 bg-red-600 text-white rounded-full border-4 border-white flex items-center justify-center shadow-xl animate-bounce z-50">
          <span className="text-[14px] font-black">{readyItemsCount}</span>
        </div>
      )}

      <div className="w-full flex justify-between items-start">
        <div className="text-left leading-none">
          <span className={`text-[7px] font-black uppercase tracking-widest ${hasReadyItems ? 'text-white/80' : 'opacity-60'}`}>
            {table.id.startsWith('balcao') ? 'Balcão' : 'Mesa'}
          </span>
          {isOccupied && table.lastUpdatedBy && (
            <p className="text-[6px] font-black uppercase truncate max-w-[50px] mt-0.5 text-white/70">
              {table.lastUpdatedBy.split(' ')[0]}
            </p>
          )}
        </div>
        {hasReadyItems && <span className="text-xs">🔔</span>}
      </div>

      <span className="text-4xl font-black tracking-tighter">{table.number}</span>

      <div className="w-full pt-2 border-t border-white/10 text-center">
        <span className="text-[9px] font-black uppercase tracking-widest">
          {hasReadyItems ? 'ENTREGAR AGORA' : isOccupied ? `R$ ${subtotal.toFixed(0)}` : 'Livre'}
        </span>
      </div>
    </button>
  );
};

const TableGrid: React.FC<TableGridProps> = ({ tables, onSelectTable }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 pb-24 md:pb-8 p-2">
      {tables.map(table => (
        <TableCard key={table.id} table={table} onClick={() => onSelectTable(table)} />
      ))}
    </div>
  );
};

export default TableGrid;
