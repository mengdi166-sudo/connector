import React, { useState } from 'react';
import { MOCK_LOGS } from '../constants';
import { Search, Filter, Download, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const AuditLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = MOCK_LOGS.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">审计日志</h2>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white rounded-lg text-slate-600 hover:bg-slate-50 transition">
          <Download size={18} /> 导出 CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="搜索日志（动作、用户或目标）..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
          <Filter size={18} /> 筛选
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">时间戳</th>
              <th className="px-6 py-3">用户 / 角色</th>
              <th className="px-6 py-3">动作</th>
              <th className="px-6 py-3">目标资源</th>
              <th className="px-6 py-3">状态</th>
              <th className="px-6 py-3">详情</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-slate-500 whitespace-nowrap">{log.time}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{log.user}</td>
                <td className="px-6 py-4 text-slate-700">{log.action}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{log.target}</td>
                <td className="px-6 py-4">
                  {log.status === 'Success' && <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs"><CheckCircle size={12} /> 成功</span>}
                  {log.status === 'Warning' && <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs"><AlertTriangle size={12} /> 警告</span>}
                  {log.status === 'Failure' && <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs"><AlertTriangle size={12} /> 失败</span>}
                </td>
                <td className="px-6 py-4 text-brand-600 hover:underline cursor-pointer">查看</td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  未找到匹配的日志。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;