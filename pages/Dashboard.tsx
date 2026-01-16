import React from 'react';
import { UserRole } from '../types';
import { StatCard, TodoList } from '../components/DashboardWidgets';
import { Activity, ShieldCheck, Database, FileText, Server, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardProps {
  role: UserRole;
}

const data = [
  { name: '周一', access: 4000, audit: 2400 },
  { name: '周二', access: 3000, audit: 1398 },
  { name: '周三', access: 2000, audit: 9800 },
  { name: '周四', access: 2780, audit: 3908 },
  { name: '周五', access: 1890, audit: 4800 },
  { name: '周六', access: 2390, audit: 3800 },
  { name: '周日', access: 3490, audit: 4300 },
];

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  // Determine content based on role
  const getRoleSpecificContent = () => {
    switch (role) {
      case UserRole.CONNECTOR_ADMIN:
        return {
          stats: [
            { title: '系统健康度', value: '99.9%', trend: '0.1%', trendUp: true, icon: Activity, color: 'bg-green-100 text-green-600' },
            { title: '有效证书', value: '12', trend: '2 即将过期', trendUp: false, icon: ShieldCheck, color: 'bg-blue-100 text-blue-600' },
            { title: '硬件', value: '已绑定', icon: Server, color: 'bg-purple-100 text-purple-600' },
            { title: '警报', value: '3', trend: '1 高危', trendUp: false, icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
          ],
          todos: ['更新 TLS 证书', '审查访问日志', '固件升级'],
          chartTitle: '资源使用情况 (7天)'
        };
      case UserRole.DATA_CATALOGER:
        return {
          stats: [
            { title: '我的产品', value: '24', trend: '4 新增', trendUp: true, icon: Database, color: 'bg-brand-100 text-brand-600' },
            { title: '草稿', value: '5', icon: FileText, color: 'bg-amber-100 text-amber-600' },
            { title: '已发布', value: '18', icon: ShieldCheck, color: 'bg-green-100 text-green-600' },
            { title: '待审核', value: '1', icon: Activity, color: 'bg-blue-100 text-blue-600' },
          ],
          todos: ['完善数据集 A 元数据', '挂载新 SQL 资源', '修复 Schema 验证错误'],
          chartTitle: '编目活动'
        };
      default: // Generic view for other roles
        return {
          stats: [
            { title: '总数据流量', value: '4.2 TB', trend: '12%', trendUp: true, icon: Activity, color: 'bg-blue-100 text-blue-600' },
            { title: '活跃合约', value: '156', trend: '5%', trendUp: true, icon: FileText, color: 'bg-indigo-100 text-indigo-600' },
            { title: '策略检查', value: '1.2M', icon: ShieldCheck, color: 'bg-green-100 text-green-600' },
            { title: '违规', value: '0', icon: ShieldCheck, color: 'bg-green-100 text-green-600' },
          ],
          todos: ['审查每周审计报告', '检查系统通知'],
          chartTitle: '系统流量概览'
        };
    }
  };

  const content = getRoleSpecificContent();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">欢迎回来，{role}</h1>
        <p className="opacity-90">这是您在可信数据空间的每日概览。</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {content.stats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            trendUp={stat.trendUp}
            icon={stat.icon}
            colorClass={stat.color}
          />
        ))}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-800">{content.chartTitle}</h3>
            <select className="text-sm border-slate-200 rounded-md text-slate-500">
              <option>过去 7 天</option>
              <option>过去 30 天</option>
            </select>
          </div>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: '#f8fafc'}}
                  />
                  <Bar dataKey="access" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="audit" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Todo List */}
        <div>
          <TodoList items={content.todos} />
        </div>
      </div>

      {/* Recent Activity Timeline - Visual Mock */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4">近期活动</h3>
        <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
          {[1, 2, 3].map((i) => (
             <div key={i} className="ml-6 relative">
               <div className="absolute -left-[31px] top-0 bg-white border-2 border-brand-500 w-4 h-4 rounded-full"></div>
               <div className="flex flex-col">
                 <span className="text-xs text-slate-500 mb-1">今天, 10:2{i} AM</span>
                 <p className="text-sm font-medium text-slate-800">发起新数据合约</p>
                 <p className="text-sm text-slate-500">合约 #CNT-2025-00{i} 合作方 B</p>
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;