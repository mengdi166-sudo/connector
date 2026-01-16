import React, { useState, useEffect } from 'react';
import { 
  FileSignature, Clock, CheckCircle, AlertTriangle, 
  Search, Filter, ChevronRight, PenTool, Hash, ShieldCheck, 
  Activity, XCircle, FileText, Zap, ArrowRight, ArrowLeftRight,
  Database, Server, Calendar, Hash as HashIcon, Lock, Key, Copy, Edit3,
  History, MessageCircle, GitCommit, GitPullRequest, GitMerge, User, Users,
  Wand2, Handshake, Ban, Cpu, Globe, Check, AlertCircle, RefreshCw, Plus,
  Terminal, Code, LayoutList, Share2, BookOpen, Info, Briefcase, Tag
} from 'lucide-react';
import { MOCK_CONTRACTS, MOCK_PRODUCTS } from '../constants';
import { Contract, ContractStatus, ContractPolicy, SignMode, ProductStatus, DataProduct, ContractHistoryItem, ConstraintMode } from '../types';

// --- Business Rules & Mock Environment Data ---

const MOCK_ENV = {
  did: 'did:conn:node_0086_bank01',
  ip: '10.25.102.14',
  certFingerprint: '7F:8A:2B... (SM2)',
  securityLevel: 'L3'
};

// Metadata defining how each field behaves in the UI
const CONSTRAINT_META: Record<string, { 
  mode: ConstraintMode; 
  label: string; 
  type: 'text' | 'number' | 'select' | 'date'; 
  options?: string[];
  unit?: string;
  description?: string;
  validation?: { min?: number; max?: number; msg?: string };
}> = {
  // Negotiable Fields
  usageCount: { 
    mode: 'Negotiable', 
    label: '使用次数上限 (Max Count)', 
    type: 'number', 
    unit: '次',
    description: '允许范围：1 - 5000 次',
    validation: { min: 1, max: 5000, msg: '超出提供方设定的最大阈值 (5000)' }
  },
  validUntil: { 
    mode: 'Negotiable', 
    label: '授权有效期 (Expiry)', 
    type: 'date',
    description: '最长有效期至：2026-12-31'
  },
  validFrom: {
    mode: 'Negotiable', 
    label: '授权生效时间 (Effective)', 
    type: 'date',
    description: '合约开始生效的日期'
  },
  
  // Locked Fields
  environment: { 
    mode: 'Locked', 
    label: '执行环境要求 (Environment)', 
    type: 'select', 
    options: ['None', 'TEE', 'Sandbox', 'PrivacyCompute'],
    description: '必须满足的安全计算环境类型。'
  },
  ipWhitelist: { 
    mode: 'Locked', 
    label: 'IP 白名单 (Whitelist)', 
    type: 'text',
    description: '仅允许特定网段访问。'
  },
  securityLevel: { 
    mode: 'Locked', 
    label: '最低安全等级 (Security Level)', 
    type: 'text', 
    description: '必须通过等保三级测评。'
  },

  // Formerly Injected Fields (Now just standard Locked fields if used)
  consumerConnectorId: { 
    mode: 'Locked', 
    label: '需求方连接器 ID (Consumer DID)', 
    type: 'text',
    description: '自动绑定当前连接器身份。'
  },
  sourceIp: {
    mode: 'Locked', 
    label: '访问来源 IP', 
    type: 'text', 
    description: '实时检测的物理 IP。'
  },
  certFingerprint: {
    mode: 'Locked', 
    label: '当前证书指纹', 
    type: 'text', 
    description: 'U-Key/软证书摘要。'
  }
};

// Helper Renderers (Moved outside to be reusable)
const renderCopyable = (label: string, value: string) => (
  <div className="group">
    <div className="text-xs text-slate-400 mb-1">{label}</div>
    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200 hover:border-brand-300 transition-colors">
      <code className="text-xs font-mono text-slate-700 flex-1 truncate" title={value}>{value}</code>
      <button className="text-slate-400 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
        <Copy size={12}/>
      </button>
    </div>
  </div>
);

// --- Interface Doc Data Structures ---

interface DocRow {
  name: string;
  field: string;
  type: string;
  len?: string;
  required: boolean;
  desc?: string;
}

const DATA_B1: DocRow[] = [
  { name: '请求唯一标识', field: 'sequenceNum', type: 'String', len: '32', required: true, desc: '用于标识一次报文请求，由请求方生成' },
  { name: '数据产品唯一标识', field: 'productId', type: 'String', len: '65', required: true, desc: '' },
  { name: '控制指令编号', field: 'ctrlInstructionId', type: 'String', len: '32', required: true, desc: '' },
  { name: '目标接入连接器', field: 'targetConnectorId', type: 'String', len: '32', required: true, desc: '请求对应的目标接入连接器 ID' },
  { name: '发起接入连接器', field: 'issuerConnectorId', type: 'String', len: '32', required: true, desc: '发起请求的接入连接器 ID' },
  { name: '鉴权信息', field: 'connectorProof', type: 'String', len: '128', required: false, desc: '数据使用方与数据提供方协商的鉴权信息' },
  { name: '请求内容摘要', field: 'bodyHash', type: 'String', len: '64', required: false, desc: 'body 请求内容的哈希值摘要，由请求方生成' },
];

const DATA_B2: DocRow[] = [
  { name: '状态码', field: 'code', type: 'String', len: '5', required: true, desc: '返回消息的状态码' },
  { name: '消息描述', field: 'message', type: 'String', len: '128', required: true, desc: '对状态码的详细描述' },
  { name: '消息体', field: 'data', type: 'Json 对象', len: '', required: true, desc: '' },
  { name: '原始 API 响应头', field: 'header', type: '—', len: '—', required: true, desc: '原始 API 接口返回的 HTTP header' },
  { name: '原始 API 接口响应报文', field: 'body', type: '—', len: '—', required: true, desc: '原始 API 接口返回的应答报文' },
];

const DATA_B3: DocRow[] = [
  { name: '请求唯一标识', field: 'sequenceNum', type: 'String', len: '32', required: true, desc: '用于标识一次报文请求，由请求方生成' },
  { name: '数据产品唯一标识', field: 'productId', type: 'String', len: '65', required: true, desc: '' },
  { name: '控制指令编号', field: 'ctrlInstructionId', type: 'String', len: '32', required: true, desc: '' },
  { name: '发送端接入连接器唯一标识', field: 'sourceConnectorId', type: 'String', len: '32', required: true, desc: '' },
  { name: '接收端接入连接器唯一标识', field: 'targetConnectorId', type: 'String', len: '32', required: true, desc: '接收端接入连接器唯一标识符' },
  { name: '鉴权信息', field: 'connectorProof', type: 'String', len: '128', required: false, desc: '数据使用方与数据提供方协商的鉴权信息' },
  { name: '请求内容摘要', field: 'bodyHash', type: 'String', len: '64', required: false, desc: 'body 请求内容的哈希值摘要' },
  { name: '调用链追踪 ID', field: 'traceId', type: 'String', len: '64', required: false, desc: '跨域调用链路的上下文关联字段' },
  { name: '流 ID', field: 'streamId', type: 'String', len: '64', required: false, desc: '可用于多路传输，并行传输流式数据' },
];

const DATA_B4: DocRow[] = [
  { name: '状态码', field: 'code', type: 'String', len: '5', required: true, desc: '返回消息的状态码' },
  { name: '消息描述', field: 'message', type: 'String', len: '128', required: true, desc: '对状态码的详细描述' },
];

const DATA_B5: DocRow[] = [
  { name: '请求唯一标识', field: 'sequenceNum', type: 'String', len: '32', required: true, desc: '用于标识一次报文请求，由请求方生成' },
  { name: '数据产品唯一标识', field: 'productId', type: 'String', len: '65', required: true, desc: '' },
  { name: '控制指令编号', field: 'ctrlInstructionId', type: 'String', len: '32', required: true, desc: '' },
  { name: '发送端接入连接器唯一标识', field: 'sourceConnectorId', type: 'String', len: '32', required: true, desc: '' },
  { name: '接收端接入连接器唯一标识', field: 'targetConnectorId', type: 'String', len: '32', required: true, desc: '' },
  { name: '鉴权信息', field: 'connectorProof', type: 'String', len: '128', required: false, desc: '数据使用方与数据提供方协商的鉴权信息' },
  { name: '请求内容摘要', field: 'bodyHash', type: 'String', len: '64', required: false, desc: 'body 请求内容的哈希值摘要' },
  { name: '接入连接器技术提供商编码', field: 'techProviderCode', type: 'String', len: '64', required: false, desc: '接入连接器请求侧厂商编码' },
  { name: '调用链追踪 ID', field: 'traceId', type: 'String', len: '64', required: false, desc: '跨域调用链路的上下文关联字段' },
  { name: '分片信息', field: 'shardingInfo', type: 'String', len: '128', required: false, desc: '用于数据分片的信息' },
];

const DocTable = ({ data, title }: { data: DocRow[]; title: string }) => (
  <div className="mb-8">
    <h4 className="text-sm font-bold text-slate-800 mb-3 pl-3 border-l-4 border-brand-500">{title}</h4>
    <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm">
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
          <tr>
            <th className="px-4 py-2 w-1/4">参数名称</th>
            <th className="px-4 py-2 w-1/4">字段名称</th>
            <th className="px-4 py-2 w-20">数据类型</th>
            <th className="px-4 py-2 w-16">长度</th>
            <th className="px-4 py-2 w-16 text-center">必选</th>
            <th className="px-4 py-2">说明</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-slate-50/50">
              <td className="px-4 py-2 font-medium text-slate-700">{row.name}</td>
              <td className="px-4 py-2 font-mono text-brand-600">{row.field}</td>
              <td className="px-4 py-2 text-slate-600">{row.type}</td>
              <td className="px-4 py-2 text-slate-500">{row.len || '-'}</td>
              <td className="px-4 py-2 text-center">
                {row.required ? (
                  <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded text-[10px]">必选</span>
                ) : (
                  <span className="text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">可选</span>
                )}
              </td>
              <td className="px-4 py-2 text-slate-500">{row.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- AccessGuide Component (Extracted & Updated) ---
const AccessGuide: React.FC<{
  contract: Contract;
  onBack: () => void;
}> = ({ contract, onBack }) => {
  const [transportMode, setTransportMode] = useState<'API' | 'Push' | 'Pull'>('API');

  // Initialize mode based on product name if possible, but allow switching
  useEffect(() => {
    if (contract.productName.includes("API")) {
      setTransportMode('API');
    } else {
      setTransportMode('Push'); // Default to Push for non-API
    }
  }, [contract.productName]);

  const renderBasicInfo = () => {
    let url = 'https://gateway.trusted-data.space/api/v1/execute';
    let method = 'POST';
    let contentType = 'application/json';

    if (transportMode === 'Push') {
        url = 'https://gateway.trusted-data.space/api/v1/stream/push';
        method = 'POST';
        contentType = 'application/octet-stream';
    } else if (transportMode === 'Pull') {
        url = `https://gateway.trusted-data.space/api/v1/stream/pull/${contract.productId}`;
        method = 'GET';
        contentType = '-';
    }

    return (
      <div className="mb-8 mt-6 animate-fade-in">
          <h4 className="text-sm font-bold text-slate-800 mb-3 pl-3 border-l-4 border-brand-500">接口基本信息</h4>
          <div className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
              <div className="col-span-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">接口地址 (Endpoint URL)</span>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 border border-slate-200 rounded-md font-mono text-sm text-slate-700 group relative">
                      <span className="truncate select-all">{url}</span>
                      <button className="ml-auto text-slate-400 hover:text-brand-600 transition-colors" title="复制">
                          <Copy size={14}/>
                      </button>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">请求方式 (Method)</span>
                      <div className="flex items-center h-[42px]">
                          <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md font-bold text-sm border ${
                              method === 'POST' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                              method === 'GET' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100'
                          }`}>
                              {method}
                          </span>
                      </div>
                  </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">内容类型 (Content-Type)</span>
                      <div className="flex items-center h-[42px] text-sm font-mono text-slate-600">
                          {contentType}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col animate-fade-in bg-white">
      {/* Header Summary */}
      <div className="bg-slate-900 text-white p-6 rounded-b-xl shadow-lg mb-6">
        <div className="flex justify-between items-start mb-6">
           <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                 <BookOpen size={24} className="text-brand-400"/> 接口文档
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                 标准化数据交互协议规范
              </p>
           </div>
           <div className="flex gap-2">
             <button onClick={onBack} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs border border-slate-700">
                返回合约详情
             </button>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {renderCopyable("控制指令编号 (CtrlInstructionID)", "CTRL-20250515-001")}
           {renderCopyable("产品标识 (ProductID)", contract.productId)}
           {renderCopyable("源连接器 (Issuer)", contract.counterpartyDid)}
           {renderCopyable("目标连接器 (Target)", MOCK_ENV.did)}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-10">
         <div className="max-w-6xl">
            
            {renderBasicInfo()}

            {transportMode === 'API' && (
               // API VIEW
               <div className="animate-fade-in space-y-8">
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800 flex items-start gap-2">
                     <Info size={16} className="mt-0.5 flex-shrink-0"/>
                     <div>
                        <p className="font-bold mb-1">API 接口说明</p>
                        <p>API 数据接口用于实时交互，支持 JSON 格式的请求与响应。所有请求头必须包含规定的标识符与鉴权信息。</p>
                     </div>
                  </div>
                  <DocTable title="表B.1 API数据接口请求参数" data={DATA_B1} />
                  <DocTable title="表B.2 API数据接口响应参数" data={DATA_B2} />
               </div>
            )}
            
            {transportMode === 'Push' && (
               // BATCH PUSH VIEW
               <div className="animate-fade-in space-y-8">
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg text-sm text-indigo-800 flex items-start gap-2">
                     <Info size={16} className="mt-0.5 flex-shrink-0"/>
                     <div>
                        <p className="font-bold mb-1">批量数据流传输（推）说明</p>
                        <p>适用于数据提供方主动向数据使用方推送数据的场景。请求参数应在 Header 中指定，请求 Body 为二进制数据流。</p>
                     </div>
                  </div>
                  <DocTable title="表B.3 批量数据流传输（推）请求头参数" data={DATA_B3} />
                  <DocTable title="表B.4 批量数据流传输（推）响应参数" data={DATA_B4} />
               </div>
            )}
            
            {transportMode === 'Pull' && (
               // BATCH PULL VIEW
               <div className="animate-fade-in space-y-8">
                  <div className="bg-teal-50 border border-teal-100 p-4 rounded-lg text-sm text-teal-800 flex items-start gap-2">
                     <Info size={16} className="mt-0.5 flex-shrink-0"/>
                     <div>
                        <p className="font-bold mb-1">批量数据流传输（拉）说明</p>
                        <p>适用于数据使用方主动向数据提供方拉取数据的场景。响应报文内容为二进制数据流，无额外响应参数（使用 HTTP 状态码判断）。</p>
                     </div>
                  </div>
                  <DocTable title="表B.5 批量数据流传输（拉）请求参数" data={DATA_B5} />
                  
                  <div className="mb-8">
                     <h4 className="text-sm font-bold text-slate-800 mb-3 pl-3 border-l-4 border-brand-500">B.6 批量数据流传输（拉）响应参数</h4>
                     <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-sm text-slate-600">
                        <div className="flex items-center gap-2 mb-2 font-medium text-slate-800">
                           <CheckCircle size={16} className="text-green-500"/> 响应机制
                        </div>
                        <p>批量数据流传输（拉）响应情况应使用 <span className="font-mono bg-white px-1 border rounded">HTTP Status Code</span> 进行响应判断。</p>
                        <p className="mt-2">无额外响应参数，报文内容为 <span className="font-bold">二进制数据流</span>。</p>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

// --- Main ContractManager Component ---
const ContractManager: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'detail' | 'guide'>('list');
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  
  // Create Wizard State
  const [createStep, setCreateStep] = useState(1);
  const [effectiveMode, setEffectiveMode] = useState<'immediate' | 'scheduled'>('immediate');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [newContractData, setNewContractData] = useState<Partial<Contract>>({
    myPolicy: { actions: [], constraints: {} },
    role: 'Consumer' // Default role for initiating application
  });

  // Negotiation State
  const [draftPolicy, setDraftPolicy] = useState<ContractPolicy | null>(null);
  const [revisionComment, setRevisionComment] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Signing State
  const [showSignModal, setShowSignModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [signingStatus, setSigningStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  // --- Handlers ---

  const handleCreateStart = () => {
    setNewContractData({
      id: `CNT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      status: ContractStatus.DRAFT,
      signMode: SignMode.BROKER,
      version: 1,
      signatorySpecifiedPointId: MOCK_ENV.did, // Default to self
      role: 'Consumer', // Default: I am applying for data
      myPolicy: { 
        actions: ['read'], 
        constraints: {
          usageCount: 1000,
          validUntil: '2025-12-31',
          environment: 'TEE',
          ipWhitelist: '10.20.1.5',
          securityLevel: 'L3'
        } 
      },
      history: []
    });
    setCreateStep(1);
    setViewMode('create');
    setEffectiveMode('immediate');
    setProductSearchTerm('');
  };

  const handleCreateSubmit = () => {
    const finalContract = {
      ...newContractData,
      lastUpdated: new Date().toISOString(),
      counterpartyName: '待平台分配', // Mock
      counterpartyDid: 'did:conn:pending',
      status: ContractStatus.NEGOTIATING,
      // Init counterparty policy as copy of mine for now
      counterpartyPolicy: JSON.parse(JSON.stringify(newContractData.myPolicy)),
      history: [
         {
            version: 1,
            proposer: 'Me',
            timestamp: new Date().toISOString(),
            comment: '初始合约草案发起',
            policySnapshot: newContractData.myPolicy!
         }
      ]
    } as Contract;

    setContracts([finalContract, ...contracts]);
    setViewMode('list');
  };

  const handleSelectContract = (contract: Contract) => {
    setSelectedContract(contract);
    setViewMode('detail');
    setDraftPolicy(JSON.parse(JSON.stringify(contract.myPolicy)));
    setRevisionComment('');
    setValidationErrors({});
  };

  const handleDraftChange = (field: string, value: any) => {
    if (!draftPolicy) return;
    
    // Update Value
    const newConstraints = { ...draftPolicy.constraints, [field]: value };
    setDraftPolicy({ ...draftPolicy, constraints: newConstraints });

    // Validate
    const meta = CONSTRAINT_META[field];
    if (meta && meta.validation) {
      if (meta.validation.max && value > meta.validation.max) {
        setValidationErrors(prev => ({ ...prev, [field]: meta.validation!.msg! }));
      } else if (meta.validation.min && value < meta.validation.min) {
         setValidationErrors(prev => ({ ...prev, [field]: `低于最小限制 (${meta.validation!.min})` }));
      } else {
        const newErrors = { ...validationErrors };
        delete newErrors[field];
        setValidationErrors(newErrors);
      }
    }
  };

  const handleProposeChange = () => {
    if (!selectedContract || !draftPolicy) return;
    if (Object.keys(validationErrors).length > 0) {
      alert("请修正红色告警项后再提交。");
      return;
    }

    const newVersion = selectedContract.version + 1;
    const updated: Contract = {
      ...selectedContract,
      myPolicy: draftPolicy,
      version: newVersion,
      lastUpdated: new Date().toISOString(),
      status: ContractStatus.NEGOTIATING,
      history: [
         {
            version: newVersion,
            proposer: 'Me',
            timestamp: new Date().toISOString(),
            comment: revisionComment || '更新可协商条款',
            policySnapshot: draftPolicy
         },
         ...selectedContract.history
      ]
    };
    // Update local state
    setContracts(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSelectedContract(updated);
    setRevisionComment('');
  };

  const handleSignContract = () => {
    setSigningStatus('processing');
    setTimeout(() => {
      setSigningStatus('success');
      setTimeout(() => {
        if (selectedContract) {
          const activeContract = {
            ...selectedContract,
            status: ContractStatus.ACTIVE,
            executionStats: { totalCalls: 0, remainingCalls: selectedContract.myPolicy.constraints.usageCount || 0, lastCallTime: '-' }
          };
          setContracts(prev => prev.map(c => c.id === activeContract.id ? activeContract : c));
          setSelectedContract(activeContract);
          // Don't close modal immediately, let user go to guide
          setPinCode('');
        }
      }, 1000);
    }, 1500);
  };

  const renderStatusBadge = (status: ContractStatus) => {
    const styles = {
      [ContractStatus.DRAFT]: 'bg-slate-100 text-slate-600',
      [ContractStatus.NEGOTIATING]: 'bg-amber-50 text-amber-700 border-amber-200',
      [ContractStatus.PENDING_SIGNATURE]: 'bg-blue-50 text-blue-700 border-blue-200',
      [ContractStatus.ACTIVE]: 'bg-green-50 text-green-700 border-green-200',
      [ContractStatus.TERMINATED]: 'bg-slate-100 text-slate-400',
      [ContractStatus.REVOKED]: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded text-xs font-bold border border-transparent ${styles[status]}`}>
        {status}
      </span>
    );
  };

  // --- Create Wizard View ---
  const renderCreateWizard = () => (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setViewMode('list')} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
           <ArrowRight size={20} className="rotate-180"/>
        </button>
        <div>
           <h2 className="text-2xl font-bold text-slate-800">发起数据申请</h2>
           <p className="text-slate-500 text-sm">创建并编排新的合约草案以发起协商。</p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-between mb-8 px-12">
         {[1, 2, 3].map(step => (
            <div key={step} className="flex flex-col items-center relative z-10">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${createStep >= step ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {step}
               </div>
               <span className="text-xs mt-2 text-slate-600">{step === 1 ? '选择标的' : step === 2 ? '策略编排' : '执行节点'}</span>
            </div>
         ))}
         <div className="absolute left-0 right-0 top-5 h-0.5 bg-slate-200 -z-0 mx-24"></div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 min-h-[400px]">
         {/* Step 1: Product Selection */}
         {createStep === 1 && (
            <div className="space-y-4">
               <h3 className="text-lg font-bold text-slate-800 mb-4">第一步：选择数据产品</h3>

               <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                     type="text" 
                     placeholder="搜索产品名称、ID 或 提供方..." 
                     value={productSearchTerm}
                     onChange={(e) => setProductSearchTerm(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
               </div>

               <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                  {MOCK_PRODUCTS
                    .filter(p => p.status === ProductStatus.PUBLISHED)
                    .filter(p => 
                      p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || 
                      p.id.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                      p.provider.toLowerCase().includes(productSearchTerm.toLowerCase())
                    )
                    .map(p => (
                     <label key={p.id} className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition ${newContractData.productId === p.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input 
                           type="radio" 
                           name="product" 
                           className="mt-1"
                           checked={newContractData.productId === p.id}
                           onChange={() => setNewContractData({...newContractData, productId: p.id, productName: p.name})}
                        />
                        <div>
                           <div className="font-bold text-slate-800">{p.name}</div>
                           <div className="text-sm text-slate-500">{p.description}</div>
                           <div className="mt-2 flex gap-2 text-xs">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{p.provider}</span>
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{p.themeCategory}</span>
                           </div>
                        </div>
                     </label>
                  ))}
                  {MOCK_PRODUCTS.filter(p => p.status === ProductStatus.PUBLISHED && (
                      p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || 
                      p.id.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                      p.provider.toLowerCase().includes(productSearchTerm.toLowerCase())
                   )).length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
                         未找到匹配的数据产品
                      </div>
                   )}
               </div>
            </div>
         )}

         {/* Step 2: Policy Orchestration */}
         {createStep === 2 && (
            <div className="space-y-8 animate-fade-in">
               <div className="flex items-center justify-between">
                   <h3 className="text-lg font-bold text-slate-800">第二步：策略编排</h3>
                   <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">基于产品默认模板</span>
               </div>
               
               {/* 1. Locked Rules */}
               <section>
                  <div className="flex items-center gap-2 mb-4">
                     <div className="p-1.5 bg-slate-100 rounded text-slate-500"><Lock size={18}/></div>
                     <h3 className="text-lg font-bold text-slate-800">1. 基础准入与禁止区 (Locked)</h3>
                     <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">底线条款 · 不可修改</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['environment', 'ipWhitelist', 'securityLevel'].map(key => (
                           <div key={key} className="bg-white border border-slate-200 rounded-lg p-3 relative opacity-80">
                               <span className="text-xs text-slate-400 block mb-1">{CONSTRAINT_META[key]?.label || key}</span>
                               <div className="font-mono text-slate-700 font-bold flex items-center gap-2">
                                  {newContractData.myPolicy?.constraints[key] || '-'}
                                  <Lock size={12} className="text-slate-300"/>
                               </div>
                               <div className="text-[10px] text-slate-400 mt-1">{CONSTRAINT_META[key]?.description}</div>
                           </div>
                        ))}
                  </div>
               </section>

               {/* 2. Negotiable */}
               <section>
                  <div className="flex items-center gap-2 mb-4">
                     <div className="p-1.5 bg-brand-100 rounded text-brand-600"><Edit3 size={18}/></div>
                     <h3 className="text-lg font-bold text-slate-800">2. 业务配额与条款区 (Negotiable)</h3>
                     <span className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">可协商 · 需提供方确认</span>
                  </div>

                  <div className="bg-white rounded-xl border border-brand-100 shadow-sm p-6 space-y-6 ring-1 ring-brand-50">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {['usageCount', 'validUntil'].map(key => {
                           const meta = CONSTRAINT_META[key];
                           const val = newContractData.myPolicy?.constraints[key];
                           return (
                              <div key={key} className="relative group">
                                 <label className="block text-sm font-medium text-slate-700 mb-2 flex justify-between">
                                    <span className="flex items-center gap-1">{meta.label} <Handshake size={12} className="text-brand-400"/></span>
                                    <span className="text-xs text-slate-400 font-normal">{meta.description}</span>
                                 </label>
                                 <div className="relative">
                                    <input 
                                       type={meta.type}
                                       value={val || ''}
                                       onChange={(e) => setNewContractData({
                                          ...newContractData, 
                                          myPolicy: {
                                             ...newContractData.myPolicy!, 
                                             constraints: {
                                                ...newContractData.myPolicy!.constraints, 
                                                [key]: meta.type === 'number' ? parseInt(e.target.value) : e.target.value
                                             }
                                          }
                                       })}
                                       className="w-full pl-4 pr-10 py-3 rounded-lg border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-slate-800 text-lg transition-all outline-none"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                       <Edit3 size={18} className="text-brand-300"/>
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </section>
            </div>
         )}

         {/* Step 3: Execution Node */}
         {createStep === 3 && (
            <div className="space-y-6">
               <h3 className="text-lg font-bold text-slate-800">第三步：指定执行节点与描述</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                     <label className="block text-sm font-medium text-slate-700 mb-1">合约名称 (自动生成建议)</label>
                     <input 
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                        placeholder="输入便于识别的合约名称"
                        value={newContractData.name || ''}
                        onChange={(e) => setNewContractData({...newContractData, name: e.target.value})}
                     />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                     <label className="block text-sm font-medium text-slate-700 mb-1">合约用途描述</label>
                     <textarea 
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg resize-none"
                        placeholder="简要描述本次数据申请的业务背景与用途..."
                        rows={3}
                        value={newContractData.description || ''}
                        onChange={(e) => setNewContractData({...newContractData, description: e.target.value})}
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-3">我的角色 (My Role)</label>
                     <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg flex-1 hover:bg-slate-50 transition">
                           <input 
                              type="radio" 
                              name="role"
                              checked={newContractData.role === 'Consumer'}
                              onChange={() => setNewContractData({...newContractData, role: 'Consumer'})}
                              className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                           />
                           <div>
                              <span className="block text-sm font-bold text-slate-700">我是需求方</span>
                              <span className="text-xs text-slate-500">申请获取数据</span>
                           </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg flex-1 hover:bg-slate-50 transition">
                           <input 
                              type="radio" 
                              name="role"
                              checked={newContractData.role === 'Provider'}
                              onChange={() => setNewContractData({...newContractData, role: 'Provider'})}
                              className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                           />
                           <div>
                              <span className="block text-sm font-bold text-slate-700">我是提供方</span>
                              <span className="text-xs text-slate-500">对外授权数据</span>
                           </div>
                        </label>
                     </div>
                  </div>
               </div>

               <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">生效时间设置</label>
                      <div className="flex gap-6 mb-4">
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                               type="radio" 
                               name="effectiveMode"
                               checked={effectiveMode === 'immediate'}
                               onChange={() => {
                                  setEffectiveMode('immediate');
                                  const constraints = { ...newContractData.myPolicy?.constraints };
                                  delete constraints.validFrom;
                                  setNewContractData({
                                     ...newContractData,
                                     myPolicy: { ...newContractData.myPolicy!, constraints }
                                  });
                               }}
                               className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                            />
                            <span className="text-sm text-slate-700">签署后立即生效</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                               type="radio" 
                               name="effectiveMode"
                               checked={effectiveMode === 'scheduled'}
                               onChange={() => setEffectiveMode('scheduled')}
                               className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                            />
                            <span className="text-sm text-slate-700">设定生效时间</span>
                         </label>
                      </div>
                      
                      {effectiveMode === 'scheduled' && (
                         <div className="animate-fade-in pl-1">
                            <input 
                               type="date"
                               className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white"
                               value={newContractData.myPolicy?.constraints?.validFrom || ''}
                               onChange={(e) => setNewContractData({
                                  ...newContractData, 
                                  myPolicy: {
                                     ...newContractData.myPolicy!, 
                                     constraints: {
                                        ...newContractData.myPolicy!.constraints, 
                                        validFrom: e.target.value
                                     }
                                  }
                               })}
                            />
                            <p className="text-xs text-slate-500 mt-2">合约将在双方签署且到达该日期后生效。</p>
                         </div>
                      )}
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">到期时间 (截止有效期)</label>
                      <input 
                         type="date"
                         className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white"
                         value={newContractData.myPolicy?.constraints?.validUntil || ''}
                         onChange={(e) => setNewContractData({
                            ...newContractData, 
                            myPolicy: {
                               ...newContractData.myPolicy!, 
                               constraints: {
                                  ...newContractData.myPolicy!.constraints, 
                                  validUntil: e.target.value
                               }
                            }
                         })}
                      />
                  </div>
               </div>
            </div>
         )}
      </div>

      <div className="flex justify-between">
         <button 
            disabled={createStep === 1}
            onClick={() => setCreateStep(createStep - 1)}
            className="px-6 py-2 border border-slate-300 bg-white rounded-lg text-slate-600 disabled:opacity-50"
         >
            上一步
         </button>
         <button 
            onClick={() => createStep < 3 ? setCreateStep(createStep + 1) : handleCreateSubmit()}
            className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-sm"
         >
            {createStep === 3 ? '提交至平台发起协商' : '下一步'}
         </button>
      </div>
    </div>
  );

  // --- 3.0 Contract Signing Form ---
  const renderSigningForm = () => {
    if (!selectedContract || !draftPolicy) return null;

    // Keys to show in Basic Info
    const basicInfoKeys = ['validFrom', 'validUntil'];

    // Separate Constraints by Category
    const lockedConstraints: string[] = [];
    const negotiableConstraints: string[] = [];

    // Grouping logic based on CONSTRAINT_META
    Object.keys(draftPolicy.constraints).forEach(key => {
       // Skip Basic Info Keys as they are shown in their own section
       if (basicInfoKeys.includes(key)) return;

       const meta = CONSTRAINT_META[key];
       if (!meta) return; 
       if (meta.mode === 'Locked') lockedConstraints.push(key);
       if (meta.mode === 'Negotiable') negotiableConstraints.push(key);
    });

    // Helper to render a constraint field (Locked or Negotiable)
    const renderConstraintWidget = (key: string) => {
        const meta = CONSTRAINT_META[key];
        if (!meta) return null;
        const val = draftPolicy.constraints[key];
        const error = validationErrors[key];
        const isLocked = meta.mode === 'Locked';

        // Special handling for null/undefined validFrom (Immediate)
        if (key === 'validFrom' && !val) {
             return (
                <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{meta.label}</label>
                    <div className="w-full pl-4 pr-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 flex items-center gap-2">
                        <Clock size={16}/> 签署后立即生效
                    </div>
                </div>
             );
        }

        if (isLocked) {
             return (
                <div key={key} className="bg-white border border-slate-200 rounded-lg p-3 relative opacity-80 hover:opacity-100 transition h-full">
                    <span className="text-xs text-slate-400 block mb-1">{meta.label}</span>
                    <div className="font-mono text-slate-700 font-bold flex items-center gap-2">
                    {val}
                    <Lock size={12} className="text-slate-300"/>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">{meta.description}</div>
                </div>
             );
        }

        return (
            <div key={key} className="relative group">
                <label className="block text-sm font-medium text-slate-700 mb-2 flex justify-between">
                <span className="flex items-center gap-1">{meta.label} <Handshake size={12} className="text-brand-400"/></span>
                <span className="text-xs text-slate-400 font-normal">{meta.description}</span>
                </label>
                <div className="relative">
                <input 
                    type={meta.type}
                    value={val || ''}
                    onChange={(e) => handleDraftChange(key, meta.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                    className={`w-full pl-4 pr-10 py-3 rounded-lg border text-lg transition-all outline-none ${
                        error 
                        ? 'border-red-300 bg-red-50 text-red-700 focus:ring-2 focus:ring-red-200' 
                        : 'border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-slate-800'
                    }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    {error ? <AlertCircle size={20} className="text-red-500"/> : <Edit3 size={18} className="text-brand-300"/>}
                </div>
                </div>
                {/* Validation Message */}
                {error && (
                <div className="text-xs text-red-600 mt-1 flex items-center gap-1 animate-fade-in">
                    <XCircle size={10}/> {error}
                </div>
                )}
            </div>
        );
    }

    // Check for changes to show summary
    const hasChanges = JSON.stringify(draftPolicy) !== JSON.stringify(selectedContract.counterpartyPolicy); 
    
    return (
      <div className="flex h-full animate-fade-in gap-6 pb-20"> {/* pb-20 for footer */}
        
        {/* LEFT: Contract Content */}
        <div className="flex-1 space-y-8">

           {/* 0. Basic Info Section */}
           <section>
              <div className="flex items-center gap-2 mb-4">
                 <div className="p-1.5 bg-blue-100 rounded text-blue-600"><FileSignature size={18}/></div>
                 <h3 className="text-lg font-bold text-slate-800">1. 合约基础信息 (Basic Info)</h3>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                 {/* Name & Product */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">合约名称</label>
                        <div className="font-bold text-slate-800 text-lg">{selectedContract.name}</div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">我的角色</label>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold ${selectedContract.role === 'Provider' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                           {selectedContract.role === 'Provider' ? <Briefcase size={12}/> : <User size={12}/>}
                           {selectedContract.role === 'Provider' ? '提供方 (Provider)' : '需求方 (Consumer)'}
                        </span>
                     </div>
                     <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-500 mb-1">关联数据产品</label>
                         <div className="flex items-center gap-2">
                             <Database size={16} className="text-brand-500"/>
                             <span className="font-bold text-slate-700">{selectedContract.productName}</span>
                         </div>
                     </div>
                     <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-500 mb-1">合约描述/背景</label>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                           {selectedContract.description || '暂无描述'}
                        </p>
                     </div>
                 </div>

                 {/* Dates (ValidFrom, ValidUntil) */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                    {renderConstraintWidget('validFrom')}
                    {renderConstraintWidget('validUntil')}
                 </div>
              </div>
           </section>
           
           {/* 1. Locked Rules Section */}
           {lockedConstraints.length > 0 && (
           <section>
              <div className="flex items-center gap-2 mb-4">
                 <div className="p-1.5 bg-slate-100 rounded text-slate-500"><Lock size={18}/></div>
                 <h3 className="text-lg font-bold text-slate-800">2. 基础准入与禁止区 (Locked)</h3>
                 <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">底线条款 · 不可修改</span>
              </div>
              
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lockedConstraints.map(key => renderConstraintWidget(key))}
                 </div>
              </div>
           </section>
           )}

           {/* 2. Negotiable Section */}
           {negotiableConstraints.length > 0 && (
           <section>
              <div className="flex items-center gap-2 mb-4">
                 <div className="p-1.5 bg-brand-100 rounded text-brand-600"><Edit3 size={18}/></div>
                 <h3 className="text-lg font-bold text-slate-800">3. 业务配额与条款区 (Negotiable)</h3>
                 <span className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">可协商 · 需提供方确认</span>
              </div>

              <div className="bg-white rounded-xl border border-brand-100 shadow-sm p-6 space-y-6 ring-1 ring-brand-50">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {negotiableConstraints.map(key => renderConstraintWidget(key))}
                 </div>
              </div>
           </section>
           )}

           {lockedConstraints.length === 0 && negotiableConstraints.length === 0 && (
               <div className="p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                   <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                       <CheckCircle size={24}/>
                   </div>
                   <h3 className="text-lg font-medium text-slate-700">无额外策略限制</h3>
                   <p className="text-slate-500">此合约除了基础信息外，没有其他准入或业务限制。</p>
               </div>
           )}

        </div>

        {/* RIGHT: Sidebar History */}
        <div className="w-80 flex-shrink-0 hidden xl:block">
           <div className="sticky top-6 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                 <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
                    <History size={16}/> 协商历程
                 </h4>
                 <div className="space-y-4 relative pl-3">
                    <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-slate-100 -z-0"></div>
                    {selectedContract.history.map((h, i) => (
                       <div key={i} className="flex gap-3 relative z-10">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${h.proposer === 'Me' ? 'bg-brand-50 border-brand-200 text-brand-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                             {h.proposer === 'Me' ? <User size={12}/> : <Users size={12}/>}
                          </div>
                          <div className="text-xs bg-slate-50 p-2 rounded border border-slate-100 w-full">
                             <div className="flex justify-between text-slate-400 mb-1">
                                <span>{h.proposer === 'Me' ? '我方' : '提供方'}</span>
                                <span>V{h.version}</span>
                             </div>
                             <p className="text-slate-700">{h.comment}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* BOTTOM: Fixed Action Bar */}
        <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-20 flex justify-between items-center px-8">
           <div className="flex items-center gap-6">
              {hasChanges && (
                 <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 px-4 py-2 rounded-lg text-sm text-amber-800">
                    <AlertCircle size={16}/>
                    <span className="font-bold">条款偏差摘要:</span>
                    {negotiableConstraints.map(key => {
                       const original = selectedContract.counterpartyPolicy?.constraints?.[key];
                       const current = draftPolicy.constraints[key];
                       if (original != current) {
                          return (
                             <span key={key} className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-amber-200 text-xs">
                                {CONSTRAINT_META[key].label}: 
                                <span className="line-through text-slate-400">{original}</span> 
                                <ArrowRight size={10}/> 
                                <span className="font-bold text-brand-600">{current}</span>
                             </span>
                          );
                       }
                       return null;
                    })}
                 </div>
              )}
           </div>

           <div className="flex gap-3">
              <input 
                 className="w-64 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                 placeholder="输入协商备注 (可选)..."
                 value={revisionComment}
                 onChange={(e) => setRevisionComment(e.target.value)}
              />
              <button 
                 onClick={handleProposeChange}
                 className="px-6 py-2 bg-white border border-brand-200 text-brand-700 font-medium rounded-lg hover:bg-brand-50 transition"
              >
                 发起新一轮协商
              </button>
              <button 
                 onClick={() => setShowSignModal(true)}
                 disabled={Object.keys(validationErrors).length > 0}
                 className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition shadow-lg shadow-brand-200 disabled:opacity-50 disabled:shadow-none"
              >
                 <PenTool size={18}/> 确认条款并电子签名
              </button>
           </div>
        </div>
        
      </div>
    );
  };

  const renderList = () => (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-2xl font-bold text-slate-800">合约管理</h2>
             <p className="text-sm text-slate-500 mt-1">管理与各参与方的数据流通合约与授权策略。</p>
          </div>
          <div className="flex gap-2">
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                <Filter size={18}/> 筛选
             </button>
             <button 
                onClick={handleCreateStart}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-sm"
             >
                <Plus size={18}/> 发起申请
             </button>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map(contract => (
             <div key={contract.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col gap-4 group">
                {/* Header */}
                <div className="flex justify-between items-start">
                   <div className="flex flex-col">
                      <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-1" title={contract.name}>
                        {contract.name}
                      </h3>
                      <span className="text-xs font-mono text-slate-400 mt-1">{contract.id}</span>
                   </div>
                   {renderStatusBadge(contract.status)}
                </div>

                {/* Body */}
                <div className="space-y-3 flex-1">
                   <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                      <div className="flex items-start gap-2">
                         <Database size={14} className="text-slate-400 mt-0.5"/>
                         <div>
                            <span className="text-xs text-slate-500 block">数据产品</span>
                            <span className="text-sm font-medium text-slate-700 line-clamp-1" title={contract.productName}>{contract.productName}</span>
                         </div>
                      </div>
                      <div className="flex items-start gap-2">
                         <Users size={14} className="text-slate-400 mt-0.5"/>
                         <div>
                            <span className="text-xs text-slate-500 block">对方</span>
                            <span className="text-sm font-medium text-slate-700 line-clamp-1" title={contract.counterpartyName}>{contract.counterpartyName}</span>
                         </div>
                      </div>
                   </div>
                   
                   {/* Description (Truncated) */}
                   {contract.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 px-1">
                         {contract.description}
                      </p>
                   )}

                   <div className="flex justify-between items-center text-xs text-slate-400 px-1 border-t border-slate-100 pt-2">
                      {/* Role Indicator - Moved to Left replacing Date */}
                      {contract.role && (
                         <span className={`flex items-center gap-1 ${contract.role === 'Provider' ? 'text-purple-600' : 'text-blue-600'}`}>
                            <span className="text-slate-400 font-normal">我的角色:</span>
                            {contract.role === 'Provider' ? <Briefcase size={12}/> : <User size={12}/>}
                            <span className="font-bold">{contract.role === 'Provider' ? '提供方' : '需求方'}</span>
                         </span>
                      )}
                      {/* Date - Moved to Right */}
                      <span className="flex items-center gap-1"><Clock size={12}/> {contract.lastUpdated.split(' ')[0]}</span>
                   </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                         <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                            Me
                         </div>
                         <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                            {contract.counterpartyName.charAt(0)}
                         </div>
                      </div>
                      <span className="text-xs text-slate-500">v{contract.version}</span>
                   </div>

                   <button 
                      onClick={() => handleSelectContract(contract)}
                      className="text-brand-600 font-medium hover:text-brand-700 text-sm flex items-center gap-1 hover:underline"
                   >
                      详情 <ChevronRight size={16}/>
                   </button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  return (
    <div className="h-full relative">
      {viewMode === 'list' && renderList()}
      {viewMode === 'create' && renderCreateWizard()}
      
      {/* AccessGuide Component Usage */}
      {viewMode === 'guide' && selectedContract && (
        <AccessGuide 
          contract={selectedContract} 
          onBack={() => setViewMode('detail')}
        />
      )}

      {viewMode === 'detail' && (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => setViewMode('list')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
                >
                    <ArrowRight size={24} className="rotate-180"/>
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">合约详情与协商</h2>
                    <p className="text-sm text-slate-500">
                        {selectedContract?.id} • {selectedContract?.name}
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    {selectedContract?.status === ContractStatus.ACTIVE && (
                       <button 
                          onClick={() => setViewMode('guide')}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-sm text-sm"
                       >
                          <BookOpen size={16}/> 接口文档
                       </button>
                    )}
                    {selectedContract && renderStatusBadge(selectedContract.status)}
                </div>
            </div>
            {renderSigningForm()}
        </div>
      )}

      {showSignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           {signingStatus === 'success' ? (
              <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full text-center animate-scale-in">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <CheckCircle size={32}/>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">签约成功</h3>
                  <p className="text-slate-500 mt-2 mb-6">合约已生效并上链存证。您现在可以查看技术接入指引以开始对接数据。</p>
                  
                  <div className="flex flex-col gap-3">
                     <button 
                        onClick={() => { setShowSignModal(false); setViewMode('guide'); setSigningStatus('idle'); }}
                        className="w-full py-3 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 transition"
                     >
                        查看接口文档
                     </button>
                     <button 
                        onClick={() => { setShowSignModal(false); setSigningStatus('idle'); }}
                        className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition"
                     >
                        返回列表
                     </button>
                  </div>
              </div>
           ) : (
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-3xl w-full animate-scale-in">
                 <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                       <ShieldCheck size={32}/>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">U-Key 签名确认</h3>
                    <p className="text-sm text-slate-500 mt-2">请输入您的 PIN 码以调用私钥进行电子签名。</p>
                 </div>
                 
                 <div className="mb-6">
                    <input 
                       type="password"
                       maxLength={6}
                       value={pinCode}
                       onChange={(e) => setPinCode(e.target.value)}
                       className="w-full text-center text-2xl tracking-widest py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                       placeholder="• • • • • •"
                    />
                 </div>

                 <button 
                    onClick={handleSignContract}
                    disabled={pinCode.length < 4 || signingStatus === 'processing'}
                    className="w-full py-3 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {signingStatus === 'processing' ? <RefreshCw className="animate-spin"/> : <PenTool size={18}/>}
                    {signingStatus === 'processing' ? '正在签名上链...' : '确认签名'}
                 </button>
                 
                 {signingStatus === 'idle' && (
                    <button onClick={() => setShowSignModal(false)} className="w-full mt-3 py-2 text-slate-400 hover:text-slate-600 text-sm">
                       取消
                    </button>
                 )}
              </div>
           )}
        </div>
      )}
    </div>
  );
};

export default ContractManager;