import React, { useState, useRef } from 'react';
import { 
  Shield, Server, Activity, 
  FileText, Building2, User, 
  CreditCard, Fingerprint, Clock, BadgeCheck, 
  Lock, Globe, Cpu, Network, FileKey,
  Download, Upload, CheckCircle, ArrowRight, 
  RefreshCw, Key, AlertTriangle, FileJson, Link as LinkIcon,
  Copy
} from 'lucide-react';

// --- Types ---

enum DevicePhase {
  INIT = 0,
  ASSOCIATION = 1,
  CSR = 2,
  IMPORT = 3,
  ACTIVE = 4
}

// --- Mock Data ---

const SUBJECT_INFO = {
  name: '北极星数据科技有限公司',
  did: 'did:conn:group:881203',
  uscc: '91110108MA00000000',
  type: '企业法人',
  authStatus: '已认证',
  authMethod: '对公打款认证',
  securityLevel: 2,
  region: 'CN-BJ (中国-北京)',
  registrationTime: '2024-01-15 09:30:00'
};

const DEVICE_HARDWARE = {
  ipList: ['192.168.10.55', '172.16.0.4'],
  domainList: ['connector.node.local'],
  sn: 'CN-HW-2025-99812',
  version: 'v2.1.0-secure',
  mac: '00:1B:44:11:3A:B7'
};

const IdentityManager: React.FC = () => {
  const [devicePhase, setDevicePhase] = useState<DevicePhase>(DevicePhase.INIT);
  const [loading, setLoading] = useState(false);
  
  // Device Wizard State
  const [inputDid, setInputDid] = useState('');
  // Removed csrConfig as it is no longer needed
  const [generatedCsr, setGeneratedCsr] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);

  // --- Actions ---

  const handleCopyInfo = () => {
    const info = `
设备序列号 (SN): ${DEVICE_HARDWARE.sn}
产品版本号: ${DEVICE_HARDWARE.version}
设备MAC地址: ${DEVICE_HARDWARE.mac}
IP 地址列表: ${DEVICE_HARDWARE.ipList.join(', ')}
域名列表: ${DEVICE_HARDWARE.domainList.join(', ')}
    `.trim();
    // In a real app, use navigator.clipboard.writeText(info)
    // For demo/mock environment, we alert
    alert("设备信息已复制到剪贴板！\n\n" + info);
  };

  const handleBindDid = () => {
    if (!inputDid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDevicePhase(DevicePhase.CSR);
    }, 1500); // Simulate Key Generation delay
  };

  const handleGenerateCsr = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGeneratedCsr(`-----BEGIN CERTIFICATE REQUEST-----
MIICzjCCAbYCAQAwgYgxCzAJBgNVBAYTAkNOMRAwDgYDVQQIEwdCZWlqaW5nMRAw
DgYDVQQHEwdCZWlqaW5nMRswGQYDVQQKExJQb2xhcmlzIERhdGEgVGVjaDEOMAwG
... (Simulated CSR Content) ...
L3 (生物特征识别)
-----END CERTIFICATE REQUEST-----`);
    }, 1000);
  };

  const handleImportCert = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDevicePhase(DevicePhase.ACTIVE);
    }, 1500);
  };

  // --- Renderers ---

  const renderDeviceFlow = () => {
    // Phase 4: Active Dashboard
    if (devicePhase === DevicePhase.ACTIVE) {
      return (
        <div className="space-y-6 animate-fade-in">
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-green-50 rounded-lg text-green-600">
                    <CheckCircle size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-slate-800">设备身份已激活</h3>
                    <p className="text-sm text-slate-500">连接器已成功注册到区域可信数据空间</p>
                 </div>
                 <div className="ml-auto flex flex-col items-end">
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold mb-1">
                      <Activity size={14} /> 在线 (Online)
                    </div>
                    <span className="text-xs text-slate-400">上次心跳: 刚刚</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                 <div className="p-4 bg-slate-50 rounded border border-slate-100">
                    <span className="text-xs text-slate-400 block">设备序列号 (SN)</span>
                    <span className="font-mono text-slate-800 font-medium">{DEVICE_HARDWARE.sn}</span>
                 </div>
                 <div className="p-4 bg-slate-50 rounded border border-slate-100">
                    <span className="text-xs text-slate-400 block">物理地址 (MAC)</span>
                    <span className="font-mono text-slate-800 font-medium">{DEVICE_HARDWARE.mac}</span>
                 </div>
                 <div className="p-4 bg-slate-50 rounded border border-slate-100">
                    <span className="text-xs text-slate-400 block">TEE 状态</span>
                    <span className="text-slate-800 font-medium flex items-center gap-2">
                       <Shield size={14} className="text-brand-600"/> Enclave Active (SGX)
                    </span>
                 </div>
                 <div className="p-4 bg-slate-50 rounded border border-slate-100">
                    <span className="text-xs text-slate-400 block">平台 ID</span>
                    <span className="font-mono text-slate-800 font-medium break-all">{inputDid}</span>
                 </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                   onClick={() => setDevicePhase(DevicePhase.INIT)} 
                   className="text-sm text-slate-400 hover:text-red-500 flex items-center gap-1"
                >
                   <RefreshCw size={12}/> 重置设备身份 (演示用)
                </button>
              </div>
           </div>
        </div>
      );
    }

    // Phases 0-3: Onboarding Wizard
    const steps = [
      { title: '设备初始化', icon: Cpu },
      { title: '身份关联', icon: LinkIcon },
      { title: 'CSR 申请', icon: FileKey },
      { title: '凭证激活', icon: BadgeCheck }
    ];

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
        {/* Stepper Header */}
        <div className="bg-slate-50 p-6 border-b border-slate-100">
           <div className="flex items-center justify-between max-w-3xl mx-auto">
              {steps.map((step, idx) => (
                 <div key={idx} className={`flex flex-col items-center relative z-10 ${devicePhase >= idx ? 'text-brand-600' : 'text-slate-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                       devicePhase === idx ? 'bg-brand-600 text-white shadow-lg ring-4 ring-brand-100' : 
                       devicePhase > idx ? 'bg-brand-100 text-brand-600' : 'bg-slate-200 text-slate-500'
                    }`}>
                       <step.icon size={18} />
                    </div>
                    <span className="text-xs font-medium">{step.title}</span>
                 </div>
              ))}
              {/* Progress Bar Background (Simplified) */}
              <div className="absolute top-[4.5rem] left-0 w-full h-0.5 bg-slate-200 -z-0 hidden md:block"></div> 
           </div>
        </div>

        {/* Step Content */}
        <div className="p-8 max-w-3xl mx-auto min-h-[400px]">
           {/* Phase 0: Init */}
           {devicePhase === DevicePhase.INIT && (
              <div className="space-y-6">
                 <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-slate-800">阶段一：设备环境自检与初始化</h3>
                    <p className="text-slate-500 text-sm mt-2">系统自动采集以下环境信息，请复制信息并在服务平台进行注册。</p>
                 </div>
                 
                 <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden relative group">
                    <button 
                        onClick={handleCopyInfo}
                        className="absolute top-2 right-2 p-2 bg-white border border-slate-200 rounded text-slate-500 hover:text-brand-600 hover:border-brand-300 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        title="复制全部信息"
                    >
                        <Copy size={16}/>
                    </button>
                    <table className="w-full text-sm text-left">
                       <tbody className="divide-y divide-slate-200">
                          <tr><td className="p-3 text-slate-500 bg-slate-100 w-1/3">IP 地址列表</td><td className="p-3 font-mono break-all">{DEVICE_HARDWARE.ipList.join(', ')}</td></tr>
                          <tr><td className="p-3 text-slate-500 bg-slate-100">域名列表</td><td className="p-3 font-mono break-all">{DEVICE_HARDWARE.domainList.join(', ') || '-'}</td></tr>
                          <tr><td className="p-3 text-slate-500 bg-slate-100">产品SN号</td><td className="p-3 font-mono">{DEVICE_HARDWARE.sn}</td></tr>
                          <tr><td className="p-3 text-slate-500 bg-slate-100">产品版本号</td><td className="p-3 font-mono">{DEVICE_HARDWARE.version}</td></tr>
                          <tr><td className="p-3 text-slate-500 bg-slate-100">设备MAC地址</td><td className="p-3 font-mono">{DEVICE_HARDWARE.mac}</td></tr>
                       </tbody>
                    </table>
                 </div>

                 <div className="flex justify-center pt-4">
                    <button 
                       onClick={handleCopyInfo}
                       className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition shadow-sm"
                    >
                       <Copy size={20}/>
                       <span>复制设备信息</span>
                    </button>
                 </div>
                 <div className="text-center">
                    <button onClick={() => setDevicePhase(DevicePhase.ASSOCIATION)} className="text-sm text-brand-600 hover:underline">
                       我已完成外部注册，下一步
                    </button>
                 </div>
              </div>
           )}

           {/* Phase 1: Association */}
           {devicePhase === DevicePhase.ASSOCIATION && (
              <div className="space-y-6 max-w-lg mx-auto">
                 <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">阶段二：身份标识关联</h3>
                    <p className="text-slate-500 text-sm mt-2">请输入从可信数据空间服务平台获取的平台 ID，系统将通过 HSM 初始化密钥。</p>
                 </div>

                 <div className="space-y-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">所属机构 (自动关联)</label>
                       <input type="text" disabled value={SUBJECT_INFO.uscc} className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-slate-500" />
                    </div>

                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">用户 DID (自动生成)</label>
                       <input type="text" disabled value="did:conn:device:99812" className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-slate-500" />
                    </div>

                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">平台 ID (必填)</label>
                       <input 
                          type="text" 
                          value={inputDid}
                          onChange={(e) => setInputDid(e.target.value)}
                          placeholder="请输入平台 ID"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition" 
                        />
                       <p className="text-xs text-slate-400 mt-1">请务必与可信数据空间服务平台审批通过的 ID 保持一致。</p>
                    </div>
                 </div>

                 <div className="pt-4">
                    <button 
                       onClick={handleBindDid}
                       disabled={!inputDid || loading}
                       className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition shadow-lg disabled:opacity-50 disabled:shadow-none"
                    >
                       {loading ? <RefreshCw className="animate-spin" size={20}/> : <Key size={20}/>}
                       <span>确认关联并初始化密钥</span>
                    </button>
                 </div>
              </div>
           )}

           {/* Phase 2: CSR */}
           {devicePhase === DevicePhase.CSR && (
              <div className="space-y-6">
                 <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">阶段三：凭证申请请求 (CSR)</h3>
                    <p className="text-slate-500 text-sm mt-2">基于本地硬件私钥生成请求文件，用于向 CA 机构申请证书。</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LEFT COLUMN: Generate Action */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 flex flex-col justify-center items-center text-center space-y-6">
                       <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-brand-600 border border-slate-100">
                          <FileKey size={32}/>
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-800 text-lg mb-2">1. 生成请求</h4>
                          <p className="text-sm text-slate-500 px-4">
                             无需配置参数。系统将自动根据设备身份信息生成标准 CSR 文件。
                          </p>
                       </div>
                       <button 
                          onClick={handleGenerateCsr}
                          disabled={loading}
                          className="w-full max-w-xs py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-medium shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                       >
                          {loading ? <RefreshCw className="animate-spin" size={18}/> : <CheckCircle size={18}/>}
                          生成 CSR 文件
                       </button>
                    </div>

                    {/* RIGHT COLUMN: Preview */}
                    <div className="space-y-2">
                       <h4 className="font-semibold text-slate-700 flex justify-between items-center">
                          <span>2. 请求内容预览</span>
                          {generatedCsr ? (
                             <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle size={12}/> 已生成
                             </span>
                          ) : (
                             <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">等待生成</span>
                          )}
                       </h4>
                       <div className="relative">
                          <textarea 
                             readOnly 
                             value={generatedCsr || "等待生成..."}
                             className="w-full h-64 bg-slate-900 text-green-400 font-mono text-xs p-4 rounded-lg resize-none shadow-inner focus:outline-none border border-slate-800"
                          ></textarea>
                          {generatedCsr && (
                              <button 
                                 className="absolute top-2 right-2 p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-700 hover:border-slate-500 transition"
                                 title="复制"
                              >
                                 <Copy size={14}/>
                              </button>
                          )}
                       </div>
                       <button 
                          disabled={!generatedCsr}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition text-sm font-medium shadow-sm"
                       >
                          <Download size={16}/> 下载 .csr 文件
                       </button>
                    </div>
                 </div>

                 <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                    <button 
                       onClick={() => setDevicePhase(DevicePhase.IMPORT)} 
                       disabled={!generatedCsr}
                       className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition shadow-sm"
                    >
                       下一步 <ArrowRight size={18}/>
                    </button>
                 </div>
              </div>
           )}

           {/* Phase 3: Import */}
           {devicePhase === DevicePhase.IMPORT && (
              <div className="space-y-6 max-w-lg mx-auto">
                 <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">阶段四：凭证导入与激活</h3>
                    <p className="text-slate-500 text-sm mt-2">上传区域节点签发的正式凭证 (.crt/.cer) 以完成激活。</p>
                 </div>

                 <div 
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${importFile ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'}`}
                 >
                    {!importFile ? (
                       <label className="cursor-pointer block">
                          <Upload className="mx-auto text-slate-400 mb-3" size={32} />
                          <span className="text-slate-600 font-medium block">点击上传或拖拽文件</span>
                          <span className="text-slate-400 text-xs mt-1 block">支持 .crt, .cer, .pem, .json-ld</span>
                          <input type="file" className="hidden" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
                       </label>
                    ) : (
                       <div>
                          <FileJson className="mx-auto text-green-600 mb-3" size={32} />
                          <span className="text-slate-800 font-medium block">{importFile.name}</span>
                          <span className="text-slate-500 text-xs mt-1 block">{(importFile.size / 1024).toFixed(1)} KB</span>
                          <button onClick={() => setImportFile(null)} className="text-red-500 text-xs mt-3 hover:underline">移除</button>
                       </div>
                    )}
                 </div>

                 {importFile && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm space-y-2">
                       <div className="flex justify-between">
                          <span className="text-slate-500">签发机构 (Issuer)</span>
                          <span className="font-medium">CN-Area-Node-BJ-CA</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-slate-500">有效期</span>
                          <span className="font-medium text-green-600">2025-05-10 至 2026-05-10</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-slate-500">本地私钥匹配</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle size={10}/> 匹配成功</span>
                       </div>
                    </div>
                 )}

                 <div className="pt-4">
                    <button 
                       onClick={handleImportCert}
                       disabled={!importFile || loading}
                       className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition shadow-lg disabled:opacity-50 disabled:shadow-none"
                    >
                       {loading ? <RefreshCw className="animate-spin" size={20}/> : <Shield size={20}/>}
                       <span>验证凭证并启用服务</span>
                    </button>
                 </div>
              </div>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">身份与安全中心</h2>
      </div>

      {/* Main Content */}
      <div className="min-h-[500px]">
         {renderDeviceFlow()}
      </div>
    </div>
  );
};

export default IdentityManager;