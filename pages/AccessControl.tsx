import React, { useState } from 'react';
import { 
  Shield, PlayCircle, Plus, Edit, Trash2, History, CheckCircle, 
  Search, Filter, ArrowLeft, Save, Lock, Clock, Network, Cpu, 
  AlertCircle, Calendar, EyeOff, Eraser, Code, Handshake, Wand2,
  Info, Truck, Server, MapPin, User, FileBox, Wifi, HardDrive,
  ToggleLeft, ToggleRight, List, Globe, Database
} from 'lucide-react';
import { Policy, OdrlPermission, OdrlConstraint, OdrlDuty, ConstraintMode, OdrlOperator } from '../types';
import { MOCK_POLICIES } from '../constants';

// --- Configuration Types ---

type DimensionType = 'Time' | 'Location' | 'Subject' | 'Object' | 'Communication' | 'Storage';

type OperandConfig = {
  key: string;
  label: string;
  dimension: DimensionType;
  allowedModes: ConstraintMode[];
  defaultMode: ConstraintMode;
  description: string;
  inputType: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'multi-text';
  options?: string[]; // For select
  placeholder?: string;
};

// --- Strategy Definitions (Based on User Requirements) ---

const STRATEGY_DEFINITIONS: Record<string, OperandConfig> = {
  // 1. Time (时间)
  'count': {
    key: 'count', dimension: 'Time', label: '限定使用次数',
    allowedModes: ['Locked', 'Negotiable'], defaultMode: 'Negotiable',
    description: '数据产品在时间区间内最多可被使用的次数。',
    inputType: 'number', placeholder: 'e.g. 1000'
  },
  'dateTime': {
    key: 'dateTime', dimension: 'Time', label: '限定使用时间范围',
    allowedModes: ['Locked', 'Negotiable'], defaultMode: 'Locked',
    description: '仅允许在设定的起始和结束时间范围内使用。',
    inputType: 'date'
  },
  'timeInterval': {
    key: 'timeInterval', dimension: 'Time', label: '限定使用时间窗口及周期',
    allowedModes: ['Locked'], defaultMode: 'Locked',
    description: '规定每日可用的具体时间窗（如 09:00-18:00）及周期。',
    inputType: 'text', placeholder: 'e.g. 09:00-18:00; Weekly'
  },
  'frequency': {
    key: 'frequency', dimension: 'Time', label: '限定使用频率',
    allowedModes: ['Locked', 'Negotiable'], defaultMode: 'Locked',
    description: '限制单位时间内的调用频率（如每分钟/小时/天）。',
    inputType: 'text', placeholder: 'e.g. 100/min'
  },

  // 2. Location (地点)
  'virtualLocation': {
    key: 'virtualLocation', dimension: 'Location', label: '限定网络地址',
    allowedModes: ['Locked'], defaultMode: 'Locked',
    description: '仅可通过特定 IP 地址或网段使用。',
    inputType: 'text', placeholder: 'e.g. 192.168.1.0/24'
  },
  'executionEnvironment': {
    key: 'executionEnvironment', dimension: 'Location', label: '限定运行环境',
    allowedModes: ['Locked'], defaultMode: 'Locked',
    description: '必须满足的安全计算环境条件。',
    inputType: 'select', options: ['None', 'TEE (Trusted Execution Env)', 'Sandbox', 'PrivacyCompute (MPC/FL)']
  },

  // 3. Subject (主体)
  'usageConnector': {
    key: 'usageConnector', dimension: 'Subject', label: '限定使用连接器',
    allowedModes: ['Locked', 'Injected'], defaultMode: 'Injected',
    description: '指定仅可在特定连接器身份上使用数据。',
    inputType: 'text', placeholder: 'did:conn:...'
  },
  'role': {
    key: 'role', dimension: 'Subject', label: '限定角色',
    allowedModes: ['Locked'], defaultMode: 'Locked',
    description: '仅可由具备特定角色的用户或服务账号使用。',
    inputType: 'select', options: ['Any', 'DataScientist', 'Auditor', 'SystemAdmin', 'AppService']
  },

  // 4. Object (客体)
  'assetState': {
    key: 'assetState', dimension: 'Object', label: '限定状态',
    allowedModes: ['Locked'], defaultMode: 'Locked',
    description: '使用前数据需处于的状态（如已加密、已脱敏）。',
    inputType: 'select', options: ['Raw', 'Encrypted', 'Anonymized', 'Watermarked']
  },
  'usageVolume': {
    key: 'usageVolume', dimension: 'Object', label: '限定使用量',
    allowedModes: ['Negotiable', 'Locked'], defaultMode: 'Negotiable',
    description: '最大数据使用规模限制（如记录行数或字节大小）。',
    inputType: 'text', placeholder: 'e.g. 1GB, 1M rows'
  },
  'targetPart': {
    key: 'targetPart', dimension: 'Object', label: '限定字段',
    allowedModes: ['Locked', 'Negotiable'], defaultMode: 'Locked',
    description: '仅允许访问数据资源中的部分字段或列。',
    inputType: 'multi-text', placeholder: 'e.g. col_a, col_b'
  },

  // 5. Communication (通信)
  'networkConnection': {
    key: 'networkConnection', dimension: 'Communication', label: '限定网络要求',
    allowedModes: ['Locked'], defaultMode: 'Locked',
    description: '指定网络传输通道类型。',
    inputType: 'select', options: ['Public Internet', 'VPN', 'Private Line (APN)', 'Intranet']
  },
  'transportProtocol': {
    key: 'transportProtocol', dimension: 'Communication', label: '限定传输协议',
    allowedModes: ['Locked'], defaultMode: 'Locked',
    description: '指定传输层或应用层协议。',
    inputType: 'select', options: ['HTTPS', 'TLS', 'SFTP', 'gRPC', 'AMQP']
  },
  'communicationChannel': {
    key: 'communicationChannel', dimension: 'Communication', label: '限定通信信道',
    allowedModes: ['Locked'], defaultMode: 'Locked',
    description: '通信信道的加密安全等级要求。',
    inputType: 'select', options: ['TLS 1.2', 'TLS 1.3', 'IPSec', 'GmSSL (SM2/SM3/SM4)']
  },

  // 6. Storage (存储)
  'storageMethod': {
    key: 'storageMethod', dimension: 'Storage', label: '限定存储方式',
    allowedModes: ['Locked'], defaultMode: 'Locked',
    description: '是否允许持久化存储或仅内存处理。',
    inputType: 'select', options: ['Persistent', 'Volatile (Memory Only)', 'Cache Only']
  },
  'storageFormat': {
    key: 'storageFormat', dimension: 'Storage', label: '限定存储形式',
    allowedModes: ['Locked'], defaultMode: 'Locked',
    description: '落盘时的加密及算法要求。',
    inputType: 'select', options: ['Plaintext', 'Encrypted (AES-256)', 'Encrypted (SM4)', 'Encrypted (TDE)']
  },
  'storageLocation': {
    key: 'storageLocation', dimension: 'Storage', label: '限定存储位置',
    allowedModes: ['Locked'], defaultMode: 'Locked',
    description: '只能存储在指定的物理或逻辑位置。',
    inputType: 'text', placeholder: 'e.g. /secure/data, AWS-CN-North-1'
  },
  'storageDuration': {
    key: 'storageDuration', dimension: 'Storage', label: '限定存储时长',
    allowedModes: ['Locked', 'Negotiable'], defaultMode: 'Locked',
    description: '数据使用后的最长保留时间（TTL）。',
    inputType: 'text', placeholder: 'e.g. P7D (7 Days), 24h'
  }
};

const OPERATORS: { value: OdrlOperator; label: string }[] = [
  { value: 'eq', label: '等于 (eq)' },
  { value: 'gt', label: '大于 (gt)' },
  { value: 'gteq', label: '大于或等于 (gteq)' },
  { value: 'lt', label: '小于 (lt)' },
  { value: 'lteq', label: '小于或等于 (lteq)' },
  { value: 'neq', label: '不等于 (neq)' },
  { value: 'hasPart', label: '包含部分 (hasPart)' },
  { value: 'isPartOf', label: '属于部分 (isPartOf)' },
  { value: 'isA', label: '属于实例 (isA)' },
  { value: 'isAllOf', label: '全部属于 (isAllOf)' },
  { value: 'isAnyOf', label: '任意属于 (isAnyOf)' },
  { value: 'isNoneOf', label: '不属于 (isNoneOf)' },
];

const AccessControl: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [policies, setPolicies] = useState<Policy[]>(MOCK_POLICIES);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create/Edit Form State
  const initialFormState: Policy = {
    "@context": "http://www.w3.org/ns/odrl.jsonld",
    "@type": "Set",
    uid: '',
    humanName: '',
    description: '',
    status: 'Active',
    priority: 10,
    version: 'v1.0',
    createdAt: '',
    permission: [{
      action: 'use',
      constraint: [],
      duty: []
    }]
  };
  const [formData, setFormData] = useState<Policy>(initialFormState);
  const [activeDimension, setActiveDimension] = useState<DimensionType>('Time');

  // --- Helpers ---

  const getConstraint = (operand: string) => {
    return formData.permission[0].constraint?.find(c => c.leftOperand === operand);
  };

  const updateConstraint = (operand: string, updates: Partial<OdrlConstraint> | null) => {
    if (!formData.permission || formData.permission.length === 0) return;
    const currentConstraints = formData.permission[0].constraint || [];
    
    // If updates is null, remove the constraint
    if (updates === null) {
      const newConstraints = currentConstraints.filter(c => c.leftOperand !== operand);
      setFormData({ ...formData, permission: [{ ...formData.permission[0], constraint: newConstraints }] });
      return;
    }

    // Add or Update
    const exists = currentConstraints.find(c => c.leftOperand === operand);
    const config = STRATEGY_DEFINITIONS[operand];
    let newConstraints;
    
    if (exists) {
      newConstraints = currentConstraints.map(c => c.leftOperand === operand ? { ...c, ...updates } : c);
    } else {
      newConstraints = [...currentConstraints, { 
        leftOperand: operand, 
        operator: 'eq', 
        rightOperand: '', 
        mode: config.defaultMode, 
        ...updates 
      }];
    }
    setFormData({ ...formData, permission: [{ ...formData.permission[0], constraint: newConstraints }] });
  };

  // --- Handlers ---

  const handleCreate = () => {
    setFormData({
      ...initialFormState,
      uid: `POL-${(policies.length + 1).toString().padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0]
    });
    setViewMode('create');
  };

  const handleEdit = (policy: Policy) => {
    setFormData({ ...policy });
    setViewMode('edit');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (viewMode === 'create') {
      setPolicies([formData, ...policies]);
    } else {
      setPolicies(policies.map(p => p.uid === formData.uid ? formData : p));
    }
    setViewMode('list');
  };

  // --- Render Components ---

  const renderConstraintInput = (config: OperandConfig) => {
    const constraint = getConstraint(config.key);
    const isEnabled = !!constraint;
    
    // Determine if mode can be toggled
    const canToggleNegotiation = config.allowedModes.includes('Locked') && config.allowedModes.includes('Negotiable');

    return (
      <div key={config.key} className={`p-4 rounded-xl border transition-all ${isEnabled ? 'bg-white border-brand-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-80 hover:opacity-100'}`}>
        {/* Header with Toggle & Mode Config */}
        <div className="flex justify-between items-center mb-3">
           <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => updateConstraint(config.key, isEnabled ? null : { rightOperand: '' })}
                className={`transition-colors ${isEnabled ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                 {isEnabled ? <ToggleRight size={28}/> : <ToggleLeft size={28}/>}
              </button>
              <div>
                 <span className={`font-semibold text-sm block ${isEnabled ? 'text-slate-800' : 'text-slate-500'}`}>{config.label}</span>
                 <span className="text-[10px] text-slate-400 font-mono">{config.key}</span>
              </div>
           </div>
           
           {/* Negotiation Mode Switcher */}
           {isEnabled && (
              <div className="flex items-center gap-1">
                 {canToggleNegotiation ? (
                    <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                        <button
                            type="button"
                            onClick={() => updateConstraint(config.key, { mode: 'Locked' })}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition flex items-center gap-1 ${
                                constraint.mode === 'Locked' 
                                ? 'bg-white text-slate-800 shadow-sm text-brand-600' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <Lock size={10} /> 固定
                        </button>
                        <button
                            type="button"
                            onClick={() => updateConstraint(config.key, { mode: 'Negotiable' })}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition flex items-center gap-1 ${
                                constraint.mode === 'Negotiable' 
                                ? 'bg-brand-50 text-brand-700 shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <Handshake size={10} /> 协商
                        </button>
                    </div>
                 ) : (
                    <span className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${
                        constraint.mode === 'Injected' 
                        ? 'bg-purple-50 text-purple-700 border-purple-100' 
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                        {constraint.mode === 'Injected' ? <Wand2 size={10}/> : <Lock size={10}/>}
                        {constraint.mode === 'Injected' ? '系统注入' : '固定值'}
                    </span>
                 )}
              </div>
           )}
        </div>

        {/* Input Area (Only if Enabled) */}
        {isEnabled && (
           <div className="pl-9 space-y-3 animate-fade-in">
              <p className="text-xs text-slate-500">{config.description}</p>
              
              {constraint.mode === 'Injected' ? (
                 <div className="text-xs bg-purple-50 text-purple-700 p-2 rounded border border-purple-100 flex items-center gap-2">
                    <Wand2 size={12}/> 系统将在运行时自动注入此值。
                 </div>
              ) : (
                 <div className="flex gap-2">
                    {/* Operator Dropdown */}
                    <div className="w-1/3 min-w-[110px]">
                        <select 
                            value={constraint.operator}
                            onChange={(e) => updateConstraint(config.key, { operator: e.target.value as any })}
                            className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:border-brand-500 outline-none"
                            title="选择约束运算符"
                        >
                            {OPERATORS.map(op => (
                                <option key={op.value} value={op.value}>{op.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Value Input */}
                    <div className="flex-1">
                        {config.inputType === 'select' && (
                        <select 
                            value={constraint.rightOperand as string}
                            onChange={(e) => updateConstraint(config.key, { rightOperand: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:border-brand-500 outline-none"
                        >
                            <option value="">请选择...</option>
                            {config.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        )}
                        {(config.inputType === 'text' || config.inputType === 'number' || config.inputType === 'date') && (
                        <input 
                            type={config.inputType}
                            value={constraint.rightOperand as string}
                            onChange={(e) => updateConstraint(config.key, { rightOperand: config.inputType === 'number' ? parseFloat(e.target.value) : e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-brand-500 outline-none"
                            placeholder={config.placeholder}
                        />
                        )}
                        {config.inputType === 'multi-text' && (
                        <input 
                            type="text"
                            value={Array.isArray(constraint.rightOperand) ? constraint.rightOperand.join(', ') : constraint.rightOperand as string}
                            onChange={(e) => updateConstraint(config.key, { rightOperand: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-brand-500 outline-none"
                            placeholder={config.placeholder}
                        />
                        )}
                    </div>
                 </div>
              )}

                {/* Negotiation Config (If Negotiable) */}
                {constraint.mode === 'Negotiable' && (
                    <div className="bg-brand-50 p-2 rounded border border-brand-100 mt-2">
                        <label className="text-[10px] text-brand-600 font-bold mb-1 block">协商允许范围 (Range)</label>
                        <div className="flex gap-2">
                            <input placeholder="Min" className="w-1/2 text-xs px-2 py-1 rounded border border-brand-200 focus:border-brand-400 outline-none" 
                            onChange={(e) => updateConstraint(config.key, { negotiationOptions: { ...constraint.negotiationOptions, min: e.target.value } })}
                            />
                            <input placeholder="Max" className="w-1/2 text-xs px-2 py-1 rounded border border-brand-200 focus:border-brand-400 outline-none"
                            onChange={(e) => updateConstraint(config.key, { negotiationOptions: { ...constraint.negotiationOptions, max: e.target.value } })}
                            />
                        </div>
                    </div>
                )}
           </div>
        )}
      </div>
    );
  };

  const renderForm = () => (
    <div className="flex flex-col h-full animate-fade-in pb-10">
       {/* Header */}
       <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setViewMode('list')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{viewMode === 'create' ? '创建策略' : '编辑策略'}</h2>
          <p className="text-slate-500 text-sm">配置 6 大维度的 ODRL 访问控制约束。</p>
        </div>
        <div className="ml-auto flex gap-3">
           <button onClick={() => setViewMode('list')} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">取消</button>
           <button onClick={handleSave} className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-lg shadow-brand-200 flex items-center gap-2">
              <Save size={18}/> 保存策略
           </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
         {/* Left: Dimension Nav */}
         <div className="w-64 flex-shrink-0 space-y-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2">
               <div className="px-4 py-3 border-b border-slate-100 mb-2">
                  <h3 className="font-bold text-slate-800 text-sm">策略维度</h3>
               </div>
               {[
                  { id: 'Time', icon: Clock, label: '时间约束' },
                  { id: 'Location', icon: MapPin, label: '地点约束' },
                  { id: 'Subject', icon: User, label: '主体约束' },
                  { id: 'Object', icon: FileBox, label: '客体约束' },
                  { id: 'Communication', icon: Wifi, label: '通信约束' },
                  { id: 'Storage', icon: HardDrive, label: '存储约束' },
               ].map((item) => (
                  <button
                     key={item.id}
                     onClick={() => setActiveDimension(item.id as DimensionType)}
                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        activeDimension === item.id 
                           ? 'bg-brand-50 text-brand-700 shadow-sm' 
                           : 'text-slate-600 hover:bg-slate-50'
                     }`}
                  >
                     <item.icon size={18} className={activeDimension === item.id ? 'text-brand-600' : 'text-slate-400'}/>
                     {item.label}
                     {/* Counter Badge */}
                     {(() => {
                        const count = Object.values(STRATEGY_DEFINITIONS)
                           .filter(c => c.dimension === item.id)
                           .filter(c => getConstraint(c.key)).length;
                        return count > 0 ? (
                           <span className="ml-auto bg-brand-200 text-brand-800 text-[10px] px-1.5 rounded-full font-bold">{count}</span>
                        ) : null;
                     })()}
                  </button>
               ))}
            </div>

            {/* Basic Info Summary */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
               <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">策略名称</label>
                  <input 
                     value={formData.humanName}
                     onChange={e => setFormData({...formData, humanName: e.target.value})}
                     className="w-full text-sm border-b border-slate-200 focus:border-brand-500 outline-none py-1 bg-transparent"
                     placeholder="输入名称..."
                  />
               </div>
               <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">描述</label>
                  <textarea 
                     value={formData.description}
                     onChange={e => setFormData({...formData, description: e.target.value})}
                     rows={3}
                     className="w-full text-xs border border-slate-200 rounded p-2 focus:border-brand-500 outline-none resize-none"
                     placeholder="简述策略用途..."
                  />
               </div>
               <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">UID</label>
                  <div className="text-xs font-mono text-slate-400">{formData.uid || 'Auto-generated'}</div>
               </div>
            </div>
         </div>

         {/* Right: Constraints Grid */}
         <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-y-auto">
            <div className="mb-6 pb-4 border-b border-slate-100 flex justify-between items-end">
               <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     {activeDimension === 'Time' && <Clock size={24} className="text-blue-500"/>}
                     {activeDimension === 'Location' && <MapPin size={24} className="text-green-500"/>}
                     {activeDimension === 'Subject' && <User size={24} className="text-purple-500"/>}
                     {activeDimension === 'Object' && <FileBox size={24} className="text-amber-500"/>}
                     {activeDimension === 'Communication' && <Wifi size={24} className="text-cyan-500"/>}
                     {activeDimension === 'Storage' && <HardDrive size={24} className="text-red-500"/>}
                     {activeDimension} Constraints
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                     配置与{activeDimension === 'Time' ? '时间' : activeDimension === 'Location' ? '地点' : activeDimension === 'Subject' ? '主体' : activeDimension === 'Object' ? '客体状态' : activeDimension === 'Communication' ? '网络通信' : '存储'}相关的具体限制策略。
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
               {Object.values(STRATEGY_DEFINITIONS)
                  .filter(def => def.dimension === activeDimension)
                  .map(config => renderConstraintInput(config))
               }
            </div>
         </div>
      </div>
    </div>
  );

  const renderList = () => (
    <div className="space-y-6 animate-fade-in">
       {/* List View similar to previous implementation, simplified for brevity */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">策略管理</h2>
          <p className="text-sm text-slate-500">管理符合 ODRL 2.2 标准的数据访问与使用策略。</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition shadow-sm"
        >
          <Plus size={18} /> 创建策略
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
         {policies.map(policy => {
            const constraintCount = policy.permission[0].constraint?.length || 0;
            const dimensionsUsed = Array.from(new Set(
               policy.permission[0].constraint?.map(c => STRATEGY_DEFINITIONS[c.leftOperand]?.dimension).filter(Boolean)
            ));

            return (
               <div key={policy.uid} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                           <Shield size={24}/>
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-800">{policy.humanName}</h3>
                           <div className="text-xs text-slate-400 font-mono">{policy.uid}</div>
                        </div>
                     </div>
                     <span className={`px-2 py-0.5 rounded text-xs font-bold ${policy.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {policy.status}
                     </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-4 flex-1">{policy.description}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                     {dimensionsUsed.map(d => (
                        <span key={d} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-xs text-slate-500 flex items-center gap-1">
                           {d === 'Time' && <Clock size={10}/>}
                           {d === 'Location' && <MapPin size={10}/>}
                           {d === 'Subject' && <User size={10}/>}
                           {d === 'Object' && <FileBox size={10}/>}
                           {d === 'Communication' && <Wifi size={10}/>}
                           {d === 'Storage' && <HardDrive size={10}/>}
                           {d}
                        </span>
                     ))}
                     {dimensionsUsed.length === 0 && <span className="text-xs text-slate-400">无特定约束</span>}
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                     <span className="text-xs text-slate-500">包含 {constraintCount} 个约束项</span>
                     <div className="flex gap-2">
                        <button onClick={() => handleEdit(policy)} className="text-slate-400 hover:text-brand-600 p-1"><Edit size={16}/></button>
                        <button className="text-slate-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>
                     </div>
                  </div>
               </div>
            );
         })}
      </div>
    </div>
  );

  return (
    <div className="relative h-full">
      {viewMode === 'list' ? renderList() : renderForm()}
    </div>
  );
};

export default AccessControl;