import React, { useState, useEffect } from 'react';
import { 
  Activity, Server, Cpu, Wifi, HardDrive, 
  RefreshCw, CheckCircle, AlertTriangle, ShieldAlert, 
  Zap, Database, Globe, Clock, UploadCloud, Signal
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts';

// --- Mock Data ---

const CONNECTOR_INFO = {
  id: 'did:conn:node_0086_bank01',
  ip: '10.25.102.14',
  certFingerprint: '7F:8A:2B... (SM2)',
  version: 'v2.1.0-secure',
  status: 'ONLINE', // ONLINE, BUSY, ERROR, MAINTAIN
  spConnection: 'Connected',
  lastHeartbeat: '2秒前',
  upTime: '14天 2小时 15分'
};

const REPORTING_CONFIG = [
  { type: '生存心跳 (Survival)', interval: '60s', status: 'Normal', lastSent: '14:30:00' },
  { type: '硬件指标 (Metrics)', interval: '5min', status: 'Normal', lastSent: '14:25:00' },
  { type: '能力上报 (Profile)', interval: 'Event/Manual', status: 'Idle', lastSent: '2025-05-01' },
];

const PERF_DATA = [
  { time: '14:00', cpu: 20, mem: 40, traffic: 120 },
  { time: '14:05', cpu: 25, mem: 42, traffic: 132 },
  { time: '14:10', cpu: 35, mem: 45, traffic: 450 },
  { time: '14:15', cpu: 30, mem: 43, traffic: 210 },
  { time: '14:20', cpu: 45, mem: 55, traffic: 890 },
  { time: '14:25', cpu: 80, mem: 60, traffic: 1024 }, // Spike
  { time: '14:30', cpu: 25, mem: 45, traffic: 340 },
];

const SECURITY_EVENTS = [
  { id: 1, time: '14:28:12', type: 'PEP_BLOCK', desc: '拦截非法访问请求 (ID不符)', level: 'Warning' },
  { id: 2, time: '14:15:33', type: 'SYS_WARN', desc: '存储空间使用率超过 80%', level: 'Warning' },
  { id: 3, time: '13:50:00', type: 'AUDIT_SYNC', desc: '审计指纹同步成功 (Batch #992)', level: 'Info' },
  { id: 4, time: '12:30:00', type: 'CONN_RESTORE', desc: 'SP 平台连接恢复，补传缓存日志 12 条', level: 'Info' },
];

const STORAGE_USAGE = { used: 820, total: 1024, unit: 'GB' }; // 80% usage

const SystemStatus: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success'>('idle');
  const [cacheCount, setCacheCount] = useState(0);

  const handleSyncCapabilities = () => {
    setSyncStatus('syncing');
    // Simulate async sync
    setTimeout(() => {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 1500);
  };

  // Simulate cache clearing simulation if there was a disconnection
  useEffect(() => {
    const timer = setInterval(() => {
      // Just a visual effect for the "Heartbeat" dot
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header: Identity & Survival Status */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="flex items-center gap-4">
              <div className="relative">
                 <div className={`w-14 h-14 rounded-full flex items-center justify-center ${CONNECTOR_INFO.status === 'ONLINE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <Activity size={32} className={CONNECTOR_INFO.status === 'ONLINE' ? 'animate-pulse' : ''}/>
                 </div>
                 <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${CONNECTOR_INFO.status === 'ONLINE' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-4 w-4 border-2 border-white ${CONNECTOR_INFO.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                 </span>
              </div>
              <div>
                 <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    {CONNECTOR_INFO.id}
                    <span className="text-xs px-2 py-0.5 rounded-full border border-green-200 bg-green-50 text-green-700 font-bold">{CONNECTOR_INFO.status}</span>
                 </h2>
                 <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500 mt-1 font-mono">
                    <span className="flex items-center gap-1"><Globe size={12}/> {CONNECTOR_INFO.ip}</span>
                    <span className="flex items-center gap-1"><ShieldAlert size={12}/> {CONNECTOR_INFO.certFingerprint}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> Uptime: {CONNECTOR_INFO.upTime}</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex flex-col items-end mr-4">
                 <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <span className={`w-2 h-2 rounded-full ${CONNECTOR_INFO.spConnection === 'Connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    SP 平台连接: {CONNECTOR_INFO.spConnection}
                 </div>
                 <span className="text-xs text-slate-400">上次心跳: {CONNECTOR_INFO.lastHeartbeat}</span>
              </div>
              <button 
                 onClick={handleSyncCapabilities}
                 disabled={syncStatus === 'syncing'}
                 className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-70 transition shadow-sm whitespace-nowrap"
              >
                 <RefreshCw size={18} className={syncStatus === 'syncing' ? 'animate-spin' : ''}/>
                 {syncStatus === 'syncing' ? '同步中...' : syncStatus === 'success' ? '同步成功' : '手动同步能力集'}
              </button>
           </div>
        </div>
      </div>

      {/* Reporting Tiers & Storage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Tiered Reporting Status */}
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
               <Signal size={18} className="text-brand-600"/> 分层上报状态
            </h3>
            <div className="space-y-4 flex-1">
               {REPORTING_CONFIG.map((config, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                     <div>
                        <div className="font-medium text-slate-700 text-sm">{config.type}</div>
                        <div className="text-xs text-slate-400">周期: {config.interval}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-xs font-mono text-slate-500">{config.lastSent}</div>
                        <div className="text-xs text-green-600 flex items-center justify-end gap-1">
                           <CheckCircle size={10}/> 正常
                        </div>
                     </div>
                  </div>
               ))}
            </div>
            {/* Offline Cache Indicator */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
               <span className="text-sm text-slate-500">断网补传队列</span>
               <span className={`text-xs font-bold px-2 py-0.5 rounded ${cacheCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                  {cacheCount > 0 ? `${cacheCount} 条待传` : '队列空闲'}
               </span>
            </div>
         </div>

         {/* Storage Monitoring */}
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
               <HardDrive size={18} className="text-purple-600"/> 存储资源监测
            </h3>
            <div className="flex-1 flex flex-col justify-center">
               <div className="flex justify-between items-end mb-2">
                  <span className="text-3xl font-bold text-slate-800">{STORAGE_USAGE.used} <span className="text-sm font-normal text-slate-500">{STORAGE_USAGE.unit}</span></span>
                  <span className="text-sm text-slate-500">/ {STORAGE_USAGE.total} {STORAGE_USAGE.unit}</span>
               </div>
               
               {/* Progress Bar */}
               <div className="w-full bg-slate-100 rounded-full h-4 mb-2 overflow-hidden">
                  <div 
                     className={`h-full rounded-full transition-all duration-1000 ${
                        (STORAGE_USAGE.used / STORAGE_USAGE.total) > 0.9 ? 'bg-red-500' : 
                        (STORAGE_USAGE.used / STORAGE_USAGE.total) > 0.75 ? 'bg-amber-500' : 'bg-purple-500'
                     }`}
                     style={{ width: `${(STORAGE_USAGE.used / STORAGE_USAGE.total) * 100}%` }}
                  ></div>
               </div>
               
               <p className="text-xs text-slate-400 mb-6">
                  待交付数据缓存区占用率。
                  {(STORAGE_USAGE.used / STORAGE_USAGE.total) > 0.75 && (
                     <span className="text-amber-600 font-bold ml-1">注意：空间不足预警</span>
                  )}
               </p>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                     <span className="block text-xs text-slate-400">本地原始资源</span>
                     <span className="font-bold text-slate-700 flex items-center justify-center gap-1">
                        <CheckCircle size={12} className="text-green-500"/> 3 在线
                     </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                     <span className="block text-xs text-slate-400">已上架产品</span>
                     <span className="font-bold text-slate-700 flex items-center justify-center gap-1">
                        <CheckCircle size={12} className="text-green-500"/> 24 活跃
                     </span>
                  </div>
               </div>
            </div>
         </div>

         {/* Security Events */}
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
               <ShieldAlert size={18} className="text-red-600"/> 安全与审计事件
            </h3>
            <div className="flex-1 overflow-y-auto max-h-[220px] custom-scrollbar space-y-3 pr-1">
               {SECURITY_EVENTS.map(event => (
                  <div key={event.id} className="flex gap-3 items-start p-2 hover:bg-slate-50 rounded transition">
                     <div className={`mt-0.5 min-w-[6px] h-[6px] rounded-full ${event.level === 'Warning' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                     <div>
                        <div className="text-xs font-mono text-slate-400 mb-0.5">{event.time} • {event.type}</div>
                        <div className="text-sm text-slate-700 leading-snug">{event.desc}</div>
                     </div>
                  </div>
               ))}
            </div>
            <button className="mt-4 text-xs text-center text-brand-600 hover:underline w-full">查看完整审计日志</button>
         </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                   <Cpu size={18} className="text-slate-500" /> 计算资源负载 (CPU/Mem)
                </h3>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">实时 (5min)</span>
             </div>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PERF_DATA}>
                        <defs>
                            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                               <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                               <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}/>
                        <Area type="monotone" dataKey="cpu" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" name="CPU %"/>
                        <Area type="monotone" dataKey="mem" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" name="Memory %"/>
                    </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                   <UploadCloud size={18} className="text-slate-500" /> 业务吞吐量 (MB/s)
                </h3>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">实时</span>
             </div>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PERF_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}/>
                        <Bar dataKey="traffic" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Throughput" />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
      </div>
    </div>
  );
};

export default SystemStatus;