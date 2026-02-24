
import React from 'react';
import { Ticket } from '../types';

interface TicketItemProps {
  ticket: Ticket;
  onToggle: (number: number) => void;
}

const TicketItem: React.FC<TicketItemProps> = React.memo(({ ticket, onToggle }) => {
  return (
    <button
      onClick={() => onToggle(ticket.number)}
      className={`
        relative w-full aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 group
        ${ticket.isSold 
          ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]' 
          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-indigo-500 hover:bg-slate-800 hover:-translate-y-1 active:scale-90'
        }
      `}
    >
      <span className={`text-[8px] font-black uppercase tracking-widest mb-1 opacity-40`}>
        No.
      </span>
      <span className="text-lg font-black tracking-tighter">
        {ticket.number}
      </span>
      
      {ticket.isSold ? (
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-full h-full bg-indigo-500/10 rounded-2xl absolute inset-0"></div>
           <i className="fa-solid fa-check text-indigo-400 text-xl drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"></i>
        </div>
      ) : (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <i className="fa-solid fa-plus text-[8px] text-indigo-400"></i>
        </div>
      )}
    </button>
  );
});

export default TicketItem;
