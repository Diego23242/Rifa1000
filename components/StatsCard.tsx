
import React from 'react';

interface StatsCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color }) => {
  return (
    <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 flex items-center space-x-5 transition-all hover:border-slate-700">
      <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg`}>
        <i className={icon}></i>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
        <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
