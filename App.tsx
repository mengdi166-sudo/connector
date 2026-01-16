import React, { useState } from 'react';
import { 
  Users, 
  Database, 
  FileSignature, 
  ShieldAlert, 
  Truck, 
  ClipboardList, 
  Activity,
  Bell,
  Search,
  Settings,
  Menu,
  ChevronLeft,
  Server
} from 'lucide-react';
import { UserRole, Page, MenuItem } from './types';
import { ROLE_COLORS } from './constants';

// Pages
import IdentityManager from './pages/IdentityManager';
import DataManager from './pages/DataManager';
import AssetManager from './pages/AssetManager';
import ContractManager from './pages/ContractManager';
import SystemStatus from './pages/SystemStatus';
import AccessControl from './pages/AccessControl';
import DeliveryManager from './pages/DeliveryManager';
import AuditLogs from './pages/AuditLogs';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>(Page.IDENTITY);
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.SYSTEM_ADMIN);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems: MenuItem[] = [
    { id: Page.IDENTITY, label: '身份认证', icon: Users },
    { id: Page.ASSETS, label: '数据资源', icon: Server },
    { id: Page.DATA, label: '数据产品', icon: Database },
    { id: Page.CONTRACTS, label: '合约管理', icon: FileSignature },
    { id: Page.ACCESS, label: '策略管理', icon: ShieldAlert },
    { id: Page.DELIVERY, label: '传输交付', icon: Truck },
    { id: Page.LOGS, label: '审计日志', icon: ClipboardList },
    { id: Page.SYSTEM, label: '系统状态', icon: Activity },
  ];

  const renderContent = () => {
    switch (activePage) {
      case Page.IDENTITY: return <IdentityManager />;
      case Page.ASSETS: return <AssetManager />;
      case Page.DATA: return <DataManager />;
      case Page.CONTRACTS: return <ContractManager />;
      case Page.SYSTEM: return <SystemStatus />;
      case Page.ACCESS: return <AccessControl />;
      case Page.DELIVERY: return <DeliveryManager />;
      case Page.LOGS: return <AuditLogs />;
      default: return (
        <div className="flex flex-col items-center justify-center h-96 text-slate-400">
          <div className="bg-slate-100 p-6 rounded-full mb-4">
             <Settings size={48} className="animate-spin-slow" />
          </div>
          <h2 className="text-xl font-semibold text-slate-600">模块开发中</h2>
          <p>{activePage} 模块在规范中已定义，但在此演示中尚未完全实现。</p>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col shadow-xl z-20`}
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-800 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded bg-brand-500 flex-shrink-0 flex items-center justify-center font-bold text-white">TD</div>
            {sidebarOpen && <span className="font-bold text-lg whitespace-nowrap">Trusted Data</span>}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${
                activePage === item.id 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              <item.icon size={20} className={`flex-shrink-0 ${activePage === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button 
             onClick={() => setSidebarOpen(!sidebarOpen)}
             className="w-full flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition"
           >
              {sidebarOpen ? <ChevronLeft size={16} /> : <Menu size={16} />}
           </button>
           {sidebarOpen && <div className="mt-4 text-xs text-center text-slate-600">v1.0.0 • OpenSpec</div>}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 shadow-sm z-10">
           {/* Left: Breadcrumbs / Title */}
           <div className="flex items-center text-slate-500 text-sm">
              <span className="font-medium text-slate-800">{menuItems.find(i => i.id === activePage)?.label}</span>
           </div>

           {/* Right: Actions */}
           <div className="flex items-center gap-6">
              {/* Role Switcher (Demo Feature) */}
              <div className="hidden md:flex items-center gap-2">
                 <span className="text-xs text-slate-400">我的角色:</span>
                 <select 
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                    className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 hover:border-brand-300 focus:outline-none"
                 >
                    {Object.values(UserRole).map(role => (
                       <option key={role} value={role}>{role}</option>
                    ))}
                 </select>
              </div>

              {/* Search */}
              <button className="text-slate-400 hover:text-slate-600"><Search size={20} /></button>
              
              {/* Notifications */}
              <div className="relative">
                 <button className="text-slate-400 hover:text-slate-600"><Bell size={20} /></button>
                 <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                 <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-slate-800">管理员</p>
                    <p className="text-xs text-slate-500 truncate w-24 text-right">{currentRole}</p>
                 </div>
                 <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${ROLE_COLORS[currentRole]}`}>
                    AU
                 </div>
              </div>
           </div>
        </header>

        {/* Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
           <div className="max-w-7xl mx-auto">
              {renderContent()}
           </div>
        </main>
      </div>
    </div>
  );
};

export default App;