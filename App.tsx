
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Ticket, FilterType } from './types';
import { raffleService } from './services/raffleService';
import StatsCard from './components/StatsCard';
import TicketItem from './components/TicketItem';

const App: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  const ticketsRef = useRef<Ticket[]>([]);

  // Inicialización: Cargar de la Nube + Conectar Realtime
  useEffect(() => {
    const init = async () => {
      // 1. Crear base
      const base = raffleService.createBase();
      
      // 2. Cargar de la base de datos persistente
      const soldNumbers = await raffleService.loadPersistedData();
      const soldSet = new Set(soldNumbers);
      
      const initialized = base.map(t => ({
        ...t,
        isSold: soldSet.has(t.number)
      }));
      
      setTickets(initialized);
      ticketsRef.current = initialized;
      setIsLoading(false);

      // 3. Conectar tiempo real para cambios futuros
      raffleService.connectRealtime((num, isSold) => {
        setTickets(prev => {
          const next = prev.map(t => t.number === num ? { ...t, isSold } : t);
          ticketsRef.current = next;
          return next;
        });
      });
    };

    init();
  }, []);

  const handleToggle = useCallback(async (num: number) => {
    const currentTickets = ticketsRef.current;
    const ticket = currentTickets.find(t => t.number === num);
    if (!ticket) return;

    const nextSold = !ticket.isSold;
    setSyncing(true);

    // 1. Actualizar UI inmediatamente
    setTickets(prev => {
      const next = prev.map(t => t.number === num ? { ...t, isSold: nextSold } : t);
      ticketsRef.current = next;
      return next;
    });

    // 2. Avisar a otros dispositivos (Realtime)
    raffleService.broadcastChange(num, nextSold);

    // 3. Guardar en Base de Datos (Persistencia)
    const allSold = ticketsRef.current.filter(t => t.isSold).map(t => t.number);
    await raffleService.savePersistedData(allSold);
    
    setSyncing(false);
  }, []);

  const stats = useMemo(() => {
    const sold = tickets.filter(t => t.isSold).length;
    return {
      sold,
      available: 1000 - sold,
      perc: ((sold / 1000) * 100).toFixed(1)
    };
  }, [tickets]);

  const filtered = useMemo(() => {
    return tickets.filter(t => {
      const mFilter = filter === 'all' || (filter === 'available' ? !t.isSold : t.isSold);
      const mSearch = searchTerm === '' || t.number.toString().includes(searchTerm);
      return mFilter && mSearch;
    });
  }, [tickets, filter, searchTerm]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="loader"></div>
        <p className="text-indigo-400 font-black tracking-widest text-xs uppercase animate-pulse">Sincronizando con el servidor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navbar Premium */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fa-solid fa-crown text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">
                Rifa <span className="text-indigo-500">1000</span>
              </h1>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">En línea y Protegido</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"></i>
              <input 
                type="number"
                placeholder="Buscar número..."
                className="pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-sm text-white focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-4 sm:p-8 flex-1 space-y-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-xl">
              <i className="fa-solid fa-ticket"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Disponibles</p>
              <p className="text-2xl font-black text-white">{stats.available}</p>
            </div>
          </div>
          <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 flex items-center space-x-4">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center text-xl">
              <i className="fa-solid fa-user-check"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vendidos</p>
              <p className="text-2xl font-black text-white">{stats.sold}</p>
            </div>
          </div>
          <div className="col-span-2 bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 flex flex-col justify-center">
             <div className="flex justify-between items-center mb-3">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta de Venta</span>
               <span className="text-sm font-black text-indigo-400">{stats.perc}%</span>
             </div>
             <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
               <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000" style={{ width: `${stats.perc}%` }}></div>
             </div>
          </div>
        </div>

        {/* Tablero */}
        <div className="bg-slate-900/50 rounded-[3rem] border border-slate-800 p-4 sm:p-10 shadow-2xl relative">
          <div className="flex items-center justify-between mb-10 px-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
              <h2 className="text-lg font-black text-white uppercase tracking-tighter italic">Control de Tablero</h2>
            </div>
            <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
              {(['all', 'available', 'sold'] as FilterType[]).map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {f === 'all' ? 'Ver Todos' : f === 'available' ? 'Libres' : 'Vendidos'}
                </button>
              ))}
            </div>
          </div>

          <div className="ticket-grid">
            {filtered.map(t => (
              <TicketItem 
                key={t.number} 
                ticket={t} 
                onToggle={handleToggle} 
              />
            ))}
          </div>

          {syncing && (
             <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3 animate-bounce z-50">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="text-xs font-black uppercase tracking-widest">Guardando cambios...</span>
             </div>
          )}
        </div>
      </main>

      <footer className="py-12 text-center">
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">
          Base de Datos Persistente Activa &bull; Sincronización Global
        </p>
      </footer>
    </div>
  );
};

export default App;
