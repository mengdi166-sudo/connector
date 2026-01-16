import React from 'react';
import { Truck, CheckCircle, Clock, AlertTriangle, ArrowRight, Download, Upload } from 'lucide-react';

const DeliveryManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">传输交付管理</h2>

      {/* Active Transfers */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Truck size={18} className="text-brand-600" /> 进行中的传输
          </h3>
          <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full text-xs font-bold">2 活跃</span>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="p-6">
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-medium text-slate-800">任务 #TRX-9982: 气象数据批次 (九月)</span>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded flex items-center gap-1">
                  <Upload size={10} /> 发送中
                </span>
              </div>
              <span className="text-sm font-mono text-slate-500">450 MB / 1.2 GB</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1">
              <div className="bg-brand-500 h-2.5 rounded-full" style={{ width: '37%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>发往: 合作伙伴连接器 B</span>
              <span>速度: 12 MB/s • 预计剩余: 1分 15秒</span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-medium text-slate-800">任务 #TRX-9983: 模型权重更新</span>
                <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded flex items-center gap-1">
                  <Download size={10} /> 接收中
                </span>
              </div>
              <span className="text-sm font-mono text-slate-500">2.1 GB / 2.1 GB</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '99%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>来自: 总部连接器</span>
              <span>正在完成完整性校验...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">传输历史</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">任务 ID</th>
              <th className="px-6 py-3">数据产品</th>
              <th className="px-6 py-3">合约</th>
              <th className="px-6 py-3">方向</th>
              <th className="px-6 py-3">交易对手</th>
              <th className="px-6 py-3">完成时间</th>
              <th className="px-6 py-3">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-4 font-mono text-slate-500">TRX-9980</td>
              <td className="px-6 py-4 font-medium text-slate-800">
                <button className="text-brand-600 hover:underline text-left">区域气象历史</button>
              </td>
              <td className="px-6 py-4 text-slate-600">
                <button className="text-brand-600 hover:underline text-left font-medium block">区域气象数据-科研所申请</button>
                <span className="text-xs text-slate-400 font-mono">CNT-2025-001</span>
              </td>
              <td className="px-6 py-4"><span className="flex items-center gap-1 text-slate-500"><Upload size={14} /> 出</span></td>
              <td className="px-6 py-4 text-slate-600">智慧城市节点 4</td>
              <td className="px-6 py-4 text-slate-500">今天, 10:45 AM</td>
              <td className="px-6 py-4"><span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs"><CheckCircle size={12} /> 成功</span></td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-4 font-mono text-slate-500">TRX-9975</td>
              <td className="px-6 py-4 font-medium text-slate-800">
                <button className="text-brand-600 hover:underline text-left">交通 API 流</button>
              </td>
              <td className="px-6 py-4 text-slate-600">
                <button className="text-brand-600 hover:underline text-left font-medium block">交通API-出行公司接入</button>
                <span className="text-xs text-slate-400 font-mono">CNT-2025-002</span>
              </td>
              <td className="px-6 py-4"><span className="flex items-center gap-1 text-slate-500"><Download size={14} /> 入</span></td>
              <td className="px-6 py-4 text-slate-600">交通局</td>
              <td className="px-6 py-4 text-slate-500">昨天, 14:20 PM</td>
              <td className="px-6 py-4"><span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs"><CheckCircle size={12} /> 成功</span></td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-4 font-mono text-slate-500">TRX-9972</td>
              <td className="px-6 py-4 font-medium text-slate-800">
                <button className="text-brand-600 hover:underline text-left">财务报告 Q1</button>
              </td>
              <td className="px-6 py-4 text-slate-600">
                <button className="text-brand-600 hover:underline text-left font-medium block">消费趋势报告许可</button>
                <span className="text-xs text-slate-400 font-mono">CNT-2025-003</span>
              </td>
              <td className="px-6 py-4"><span className="flex items-center gap-1 text-slate-500"><Upload size={14} /> 出</span></td>
              <td className="px-6 py-4 text-slate-600">银行连接器 A</td>
              <td className="px-6 py-4 text-slate-500">昨天, 09:15 AM</td>
              <td className="px-6 py-4"><span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs"><AlertTriangle size={12} /> 失败</span></td>
            </tr>
          </tbody>
        </table>
        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
                显示 1 至 3 条，共 24 条
            </div>
            <div className="flex items-center gap-1">
                <button className="px-2 py-1 border border-slate-200 bg-white rounded text-xs text-slate-500 disabled:opacity-50" disabled>上一页</button>
                <button className="px-2 py-1 border border-brand-500 bg-brand-50 rounded text-xs text-brand-600 font-medium">1</button>
                <button className="px-2 py-1 border border-slate-200 bg-white rounded text-xs text-slate-600 hover:bg-slate-50">2</button>
                <button className="px-2 py-1 border border-slate-200 bg-white rounded text-xs text-slate-600 hover:bg-slate-50">3</button>
                <span className="text-xs text-slate-400 px-1">...</span>
                <button className="px-2 py-1 border border-slate-200 bg-white rounded text-xs text-slate-600 hover:bg-slate-50">下一页</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryManager;