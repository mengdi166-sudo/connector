import React from 'react';
import { LucideIcon } from 'lucide-react';
import { StatCardProps } from '../types';

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {trend && (
        <p className={`text-xs font-medium mt-2 flex items-center ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
          {trendUp ? '▲' : '▼'} {trend} 环比上月
        </p>
      )}
    </div>
    <div className={`p-3 rounded-lg ${colorClass}`}>
      <Icon size={24} className="opacity-90" />
    </div>
  </div>
);

export const TodoList: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-full">
    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
      <h3 className="font-semibold text-slate-800">我的待办事项</h3>
      <span className="text-xs font-medium bg-brand-100 text-brand-700 px-2 py-1 rounded-full">{items.length} 待处理</span>
    </div>
    <ul className="divide-y divide-slate-50">
      {items.map((item, idx) => (
        <li key={idx} className="px-6 py-4 flex items-center gap-3 hover:bg-slate-50 cursor-pointer group">
          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);