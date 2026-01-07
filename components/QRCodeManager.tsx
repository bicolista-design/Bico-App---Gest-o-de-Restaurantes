
import React from 'react';
import { Table, CompanySettings } from '../types';

interface QRCodeManagerProps {
  tables: Table[];
  settings: CompanySettings;
}

const QRCodeManager: React.FC<QRCodeManagerProps> = ({ tables, settings }) => {
  const baseUrl = window.location.origin + window.location.pathname;

  const printQRCodes = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const qrCardsHtml = tables.map(table => {
      const url = `${baseUrl}?tableId=${table.id}`;
      const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;
      
      return `
        <div style="width: 280px; border: 2px solid #f1f5f9; border-radius: 30px; padding: 40px; margin: 15px; text-align: center; display: inline-block; font-family: 'Inter', sans-serif; background: white; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
          <div style="background: ${settings.primaryColor}; color: white; display: inline-block; padding: 8px 20px; border-radius: 12px; font-weight: 900; font-size: 20px; margin-bottom: 20px;">MESA ${table.number}</div>
          <div style="margin-bottom: 20px;">
            <img src="${qrApi}" style="width: 200px; height: 200px; display: block; margin: 0 auto;" />
          </div>
          <p style="font-weight: 900; font-size: 16px; margin: 0; color: #1e293b;">${settings.name}</p>
          <p style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px;">Escaneie para ver o cardápio</p>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir QR Codes - ${settings.name}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;900&display=swap" rel="stylesheet">
          <style>body { background: #f8fafc; padding: 40px; text-align: center; }</style>
        </head>
        <body>
          <div style="display: flex; flex-wrap: wrap; justify-content: center;">
            ${qrCardsHtml}
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-50 pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">Cartões de Mesa</h1>
          <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest opacity-60">Autoatendimento via QR Code</p>
        </div>
        <button 
          onClick={printQRCodes}
          className="w-full md:w-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <span>🖨️</span> Imprimir Todos os Cartões
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map(table => {
          const url = `${baseUrl}?tableId=${table.id}`;
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
          
          return (
            <div key={table.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all">
              <div className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-xl text-[10px] font-black uppercase mb-6 tracking-widest">
                Mesa {table.number}
              </div>
              
              <div className="w-48 h-48 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 p-4 relative overflow-hidden">
                <img src={qrUrl} alt={`QR Mesa ${table.number}`} className="w-full h-full relative z-10" />
                <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{settings.name}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Acesso Digital Ativo</p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 w-full flex flex-col gap-2">
                 <button 
                  onClick={() => {
                    navigator.clipboard.writeText(url);
                    alert('Link copiado para a área de transferência!');
                  }}
                  className="text-[8px] font-black text-indigo-500 uppercase tracking-widest hover:underline"
                 >
                   Copiar Link
                 </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QRCodeManager;
