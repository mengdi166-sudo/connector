import React, { useState } from 'react';
import { MOCK_PRODUCTS, MOCK_ASSETS, MOCK_POLICIES } from '../constants';
import { ProductStatus, DataProduct } from '../types';
import { 
  Search, Filter, Plus, Database, FileBox, Tag, Shield, ArrowLeft, 
  Code, Globe, Server, Save, MoreHorizontal, CheckCircle, Upload, 
  DollarSign, FileText, AlertTriangle, Layers, CreditCard, Cloud, Lock,
  ChevronRight, Play, Eye, Activity, Clock
} from 'lucide-react';

const DataManager: React.FC = () => {
  const [products, setProducts] = useState<DataProduct[]>(MOCK_PRODUCTS);
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [activeStep, setActiveStep] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // Wizard Form State
  const initialFormState: DataProduct = {
    id: '',
    code: '',
    version: 'v1.0',
    name: '',
    description: '',
    status: ProductStatus.DRAFT,
    securityLevel: 1,
    qualityLevel: 'B',
    provider: '北极星数据',
    type: 'Dataset',
    updated: '每日',
    sourceType: 'Original',
    themeCategory: 'A1000',
    industryCategory: 'I65',
    assetIds: [],
    pricing: {
      mode: 'Free',
      currency: 'CNY',
      price: 0
    },
    sampleData: undefined
  };
  
  const [formData, setFormData] = useState<DataProduct>(initialFormState);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');

  // --- Handlers ---

  const handleStepChange = (step: number) => {
    // Validation Logic
    if (step > activeStep) {
       if (activeStep === 1 && formData.assetIds.length === 0) {
         alert("请至少关联一个数据资源。");
         return;
       }
       if (activeStep === 2 && !formData.name) {
         alert("请输入产品名称。");
         return;
       }
       if (activeStep === 4 && !selectedPolicyId) {
         alert("必须绑定一个使用策略。");
         return;
       }
    }
    setActiveStep(step);
  };

  const updateForm = (field: keyof DataProduct, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updatePricing = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, [field]: value } }));
  };

  const toggleAsset = (assetId: string) => {
    const current = formData.assetIds;
    const next = current.includes(assetId) ? current.filter(id => id !== assetId) : [...current, assetId];
    updateForm('assetIds', next);
  };

  const handleCreateNew = () => {
    setFormData({
       ...initialFormState,
       id: `DP-BJ-${Math.floor(Math.random() * 900000) + 100000}`,
       code: Math.floor(Math.random() * 900000).toString()
    });
    setActiveStep(1);
    setSelectedPolicyId('');
    setViewMode('create');
  };

  const handleEdit = (product: DataProduct) => {
    if (product.status === ProductStatus.PUBLISHED) {
       // Versioning Logic: Create Draft of V2
       const vNum = parseInt(product.version.replace('v', '').split('.')[0]) + 1;
       setFormData({
          ...product,
          version: `v${vNum}.0`,
          status: ProductStatus.DRAFT
       });
    } else {
       setFormData({ ...product });
    }
    setSelectedPolicyId(product.policyId || '');
    setActiveStep(1);
    setViewMode('create');
  };

  const handleLifecycleAction = (id: string, action: 'off-shelf' | 'revoke') => {
    setProducts(products.map(p => {
       if (p.id === id) {
          return {
             ...p,
             status: action === 'off-shelf' ? ProductStatus.OFF_SHELF : ProductStatus.REVOKED
          };
       }
       return p;
    }));
  };

  const handleSubmit = () => {
    const finalProduct = {
      ...formData,
      policyId: selectedPolicyId,
      status: ProductStatus.PENDING_AUDIT // Send for audit
    };

    // Check if updating existing ID
    const exists = products.find(p => p.id === finalProduct.id && p.version === finalProduct.version);
    if (exists) {
       setProducts(products.map(p => (p.id === finalProduct.id && p.version === finalProduct.version) ? finalProduct : p));
    } else {
       setProducts([finalProduct, ...products]);
    }
    
    setViewMode('list');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        sampleData: {
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          uploadedAt: new Date().toISOString().split('T')[0]
        }
      }));
    }
  };

  // --- Renderers ---

  const renderWizardSteps = () => (
    <div className="mb-8">
       <div className="flex items-center justify-between relative z-0">
          {[
            { id: 1, label: '资源关联', icon: Database },
            { id: 2, label: '目录编目', icon: Layers },
            { id: 3, label: '价值与样本', icon: DollarSign },
            { id: 4, label: '策略绑定', icon: Shield },
            { id: 5, label: '发布审核', icon: CheckCircle },
          ].map((step, idx) => (
             <div key={step.id} className="flex-1 flex flex-col items-center relative z-10">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                     activeStep >= step.id ? 'bg-brand-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                   <step.icon size={18} />
                </div>
                <span className={`text-xs font-medium ${activeStep >= step.id ? 'text-brand-700' : 'text-slate-400'}`}>{step.label}</span>
                {/* Connector Line */}
                {idx < 4 && (
                   <div className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 ${activeStep > step.id ? 'bg-brand-500' : 'bg-slate-200'}`}></div>
                )}
             </div>
          ))}
       </div>
    </div>
  );

  const renderCreateForm = () => (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setViewMode('list')}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">产品封装向导</h2>
            <p className="text-slate-500 text-sm">将原始数据资源封装为标准化的可交易产品。</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
               {formData.version}
            </span>
            <span className="text-sm font-mono text-slate-400">{formData.id}</span>
        </div>
      </div>

      {renderWizardSteps()}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
         <div className="p-8 flex-1">
            
            {/* Step 1: Asset Selection */}
            {activeStep === 1 && (
               <div className="space-y-6 animate-fade-in">
                  <h3 className="text-lg font-semibold text-slate-800">选择原始资源 (Assets)</h3>
                  <p className="text-sm text-slate-500 mb-4">请勾选构成此产品的一个或多个数据资源。系统将自动校验连接状态。</p>
                  
                  <div className="grid grid-cols-1 gap-4">
                     {MOCK_ASSETS.map(asset => (
                        <div 
                           key={asset.id} 
                           onClick={() => toggleAsset(asset.id)}
                           className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                              formData.assetIds.includes(asset.id) 
                              ? 'border-brand-500 bg-brand-50 shadow-sm' 
                              : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                           }`}
                        >
                           <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center ${
                              formData.assetIds.includes(asset.id) ? 'bg-brand-500 border-brand-500' : 'border-slate-300 bg-white'
                           }`}>
                              {formData.assetIds.includes(asset.id) && <CheckCircle size={14} className="text-white"/>}
                           </div>
                           <div className="flex-1">
                              <div className="flex justify-between items-start">
                                 <h4 className="font-semibold text-slate-800">{asset.name}</h4>
                                 <span className={`text-xs px-2 py-0.5 rounded ${asset.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {asset.status}
                                 </span>
                              </div>
                              <p className="text-sm text-slate-600 mt-1">{asset.description}</p>
                              <div className="flex gap-4 mt-2 text-xs text-slate-500 font-mono">
                                 <span>ID: {asset.id}</span>
                                 <span>Type: {asset.type}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Step 2: Cataloging */}
            {activeStep === 2 && (
               <div className="space-y-6 animate-fade-in">
                  <h3 className="text-lg font-semibold text-slate-800">核心编目信息</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">产品名称 <span className="text-red-500">*</span></label>
                        <input 
                           value={formData.name}
                           onChange={e => updateForm('name', e.target.value)}
                           className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                           placeholder="例如：2024年第一季度全国气象汇总"
                        />
                     </div>
                     <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                        <textarea 
                           value={formData.description}
                           onChange={e => updateForm('description', e.target.value)}
                           rows={3}
                           className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        />
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">主题分类 (Theme)</label>
                        <select 
                           value={formData.themeCategory}
                           onChange={e => updateForm('themeCategory', e.target.value)}
                           className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white"
                        >
                           <option value="A1000">A1000 气象环保</option>
                           <option value="B2000">B2000 交通运输</option>
                           <option value="C3000">C3000 商业贸易</option>
                           <option value="D4000">D4000 金融服务</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">行业分类 (GB/T 4754)</label>
                        <input 
                           value={formData.industryCategory}
                           onChange={e => updateForm('industryCategory', e.target.value)}
                           className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        />
                     </div>
                     
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">数据来源类型</label>
                        <select 
                           value={formData.sourceType}
                           onChange={e => updateForm('sourceType', e.target.value)}
                           className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white"
                        >
                           <option value="Original">原始取得 (Original)</option>
                           <option value="Collected">收集取得 (Collected)</option>
                           <option value="Derived">加工衍生 (Derived)</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">更新频率</label>
                        <select 
                           value={formData.updated}
                           onChange={e => updateForm('updated', e.target.value)}
                           className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white"
                        >
                           <option value="实时">实时 (Real-time)</option>
                           <option value="每日">每日 (Daily)</option>
                           <option value="每周">每周 (Weekly)</option>
                           <option value="每月">每月 (Monthly)</option>
                           <option value="不定期">不定期 (Irregular)</option>
                        </select>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">质量等级</label>
                        <div className="flex gap-4">
                           {['A', 'B', 'C', 'D'].map(level => (
                              <label key={level} className="flex items-center gap-2 cursor-pointer">
                                 <input 
                                    type="radio" 
                                    name="quality" 
                                    checked={formData.qualityLevel === level}
                                    onChange={() => updateForm('qualityLevel', level)}
                                    className="text-brand-600 focus:ring-brand-500"
                                 />
                                 <span className="text-sm font-medium">{level}级</span>
                              </label>
                           ))}
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">安全分级 (1-5)</label>
                        <div className="flex items-center gap-2">
                           <input 
                              type="range" 
                              min="1" max="5" 
                              value={formData.securityLevel}
                              onChange={e => updateForm('securityLevel', parseInt(e.target.value))}
                              className="flex-1"
                           />
                           <span className={`font-bold px-2 py-1 rounded text-sm ${
                              formData.securityLevel >= 4 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                           }`}>L{formData.securityLevel}</span>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* Step 3: Value & Samples */}
            {activeStep === 3 && (
               <div className="space-y-8 animate-fade-in">
                  
                  {/* Pricing */}
                  <div>
                     <h3 className="text-lg font-semibold text-slate-800 mb-4">定价与商业条款</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2 md:col-span-1">
                           <label className="block text-sm font-medium text-slate-700 mb-2">定价模式</label>
                           <div className="grid grid-cols-2 gap-3">
                              {[
                                 { id: 'Free', label: '免费共享', icon: Cloud },
                                 { id: 'Pay-per-request', label: '按次计费', icon: Activity },
                                 { id: 'Subscription', label: '包时订阅', icon: Clock },
                                 { id: 'Fixed', label: '固定对价', icon: CreditCard },
                              ].map(mode => (
                                 <div 
                                    key={mode.id}
                                    onClick={() => updatePricing('mode', mode.id)}
                                    className={`p-3 rounded-lg border cursor-pointer flex flex-col items-center gap-2 text-center transition ${
                                       formData.pricing.mode === mode.id 
                                       ? 'bg-brand-50 border-brand-500 text-brand-700' 
                                       : 'bg-white border-slate-200 hover:bg-slate-50'
                                    }`}
                                 >
                                    <mode.icon size={20}/>
                                    <span className="text-sm font-medium">{mode.label}</span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {formData.pricing.mode !== 'Free' && (
                           <div className="col-span-2 md:col-span-1 space-y-4">
                              <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">金额 (CNY)</label>
                                 <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">¥</span>
                                    <input 
                                       type="number"
                                       value={formData.pricing.price}
                                       onChange={e => updatePricing('price', parseFloat(e.target.value))}
                                       className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg text-lg font-bold text-slate-800"
                                    />
                                 </div>
                              </div>
                              {formData.pricing.mode === 'Subscription' && (
                                 <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">周期</label>
                                    <select 
                                       className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                                       onChange={(e) => updatePricing('period', e.target.value)}
                                    >
                                       <option>每月 (Monthly)</option>
                                       <option>每年 (Yearly)</option>
                                       <option>每季度 (Quarterly)</option>
                                    </select>
                                 </div>
                              )}
                           </div>
                        )}
                        <div className="col-span-2">
                           <label className="block text-sm font-medium text-slate-700 mb-1">商业使用限制条款</label>
                           <input 
                              value={formData.pricing.terms || ''}
                              onChange={e => updatePricing('terms', e.target.value)}
                              placeholder="例如：仅限内部使用，禁止转售、公开披露。"
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                           />
                        </div>
                     </div>
                  </div>

                  {/* Sample Data */}
                  <div className="pt-6 border-t border-slate-100">
                     <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        样本数据 (Sample Data)
                        <span className="text-xs font-normal text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                           必须手动上传已脱敏文件，严禁自动抽样
                        </span>
                     </h3>
                     
                     <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition">
                        {formData.sampleData ? (
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-green-50 rounded-full text-green-600">
                                 <FileText size={24}/>
                              </div>
                              <div className="text-left">
                                 <p className="font-bold text-slate-800">{formData.sampleData.fileName}</p>
                                 <p className="text-xs text-slate-500">{formData.sampleData.fileSize} • Uploaded {formData.sampleData.uploadedAt}</p>
                              </div>
                              <button 
                                 onClick={() => setFormData(prev => ({...prev, sampleData: undefined}))}
                                 className="text-red-500 hover:underline text-sm ml-4"
                              >
                                 删除
                              </button>
                           </div>
                        ) : (
                           <label className="cursor-pointer block w-full h-full">
                              <Upload size={32} className="mx-auto text-slate-400 mb-2"/>
                              <p className="text-sm font-medium text-slate-700">点击上传样本文件 (CSV/JSON)</p>
                              <p className="text-xs text-slate-400 mt-1">文件大小限制 5MB</p>
                              <input type="file" className="hidden" accept=".csv,.json" onChange={handleFileUpload} />
                           </label>
                        )}
                     </div>
                  </div>
               </div>
            )}

            {/* Step 4: Policy Binding */}
            {activeStep === 4 && (
               <div className="space-y-6 animate-fade-in">
                  <h3 className="text-lg font-semibold text-slate-800">绑定使用策略</h3>
                  <p className="text-sm text-slate-500 mb-4">必须为产品绑定一个有效的使用控制策略，否则无法上架。</p>
                  
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                     {MOCK_POLICIES.map(policy => {
                        const preprocessingActions = policy.permission.flatMap(p => p.duty || []).map(d => d.action);
                        return (
                        <div 
                           key={policy.uid}
                           onClick={() => setSelectedPolicyId(policy.uid)}
                           className={`p-4 rounded-xl border cursor-pointer transition flex items-start justify-between group ${
                              selectedPolicyId === policy.uid
                              ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                              : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                           }`}
                        >
                           <div className="flex gap-3">
                              <div className={`mt-1 p-1.5 rounded ${policy.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                 <Shield size={18}/>
                              </div>
                              <div>
                                 <h4 className="font-bold text-slate-800">{policy.humanName}</h4>
                                 <p className="text-sm text-slate-600 mt-1">{policy.description}</p>
                                 <div className="flex gap-2 mt-2">
                                    {preprocessingActions.map((action, idx) => (
                                       <span key={idx} className="text-xs px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500">
                                          {action}
                                       </span>
                                    ))}
                                    <span className="text-xs px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">{policy.uid}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center group-hover:border-brand-400">
                              {selectedPolicyId === policy.uid && <div className="w-3 h-3 rounded-full bg-brand-500"></div>}
                           </div>
                        </div>
                     )})}
                  </div>
               </div>
            )}

            {/* Step 5: Review */}
            {activeStep === 5 && (
               <div className="space-y-6 animate-fade-in">
                  <div className="text-center mb-8">
                     <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32}/>
                     </div>
                     <h3 className="text-2xl font-bold text-slate-800">确认发布信息</h3>
                     <p className="text-slate-500">提交后，产品将推送至 SP 平台进行审核。</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 grid grid-cols-2 gap-y-6 gap-x-12 text-sm">
                     <div>
                        <span className="text-slate-400 block mb-1">产品全称</span>
                        <span className="font-bold text-slate-800 text-lg">{formData.name}</span>
                     </div>
                     <div>
                        <span className="text-slate-400 block mb-1">唯一标识 (PID)</span>
                        <span className="font-mono text-slate-800">{formData.id}</span>
                     </div>
                     <div>
                        <span className="text-slate-400 block mb-1">版本</span>
                        <span className="font-mono text-slate-800 bg-white border px-2 py-0.5 rounded">{formData.version}</span>
                     </div>
                     <div>
                        <span className="text-slate-400 block mb-1">定价模式</span>
                        <span className="font-bold text-brand-700">
                           {formData.pricing.mode === 'Free' ? '免费' : `¥${formData.pricing.price} (${formData.pricing.mode})`}
                        </span>
                     </div>
                     <div>
                        <span className="text-slate-400 block mb-1">关联资源</span>
                        <div className="flex flex-wrap gap-1">
                           {formData.assetIds.map(id => <span key={id} className="bg-white border px-2 rounded text-xs text-slate-600">{id}</span>)}
                        </div>
                     </div>
                     <div>
                        <span className="text-slate-400 block mb-1">绑定策略</span>
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                           <Shield size={14} className="text-green-600"/> {MOCK_POLICIES.find(p => p.uid === selectedPolicyId)?.humanName || selectedPolicyId}
                        </span>
                     </div>
                     <div>
                        <span className="text-slate-400 block mb-1">样本数据</span>
                        {formData.sampleData ? (
                           <span className="text-green-600 flex items-center gap-1"><CheckCircle size={14}/> {formData.sampleData.fileName}</span>
                        ) : (
                           <span className="text-red-500 flex items-center gap-1"><AlertTriangle size={14}/> 未上传</span>
                        )}
                     </div>
                  </div>
               </div>
            )}

         </div>

         {/* Footer Controls */}
         <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-between items-center">
            {activeStep > 1 ? (
               <button onClick={() => handleStepChange(activeStep - 1)} className="text-slate-600 font-medium hover:text-slate-900">
                  上一步
               </button>
            ) : (
               <div></div>
            )}
            
            <div className="flex gap-3">
               <button 
                  onClick={() => setViewMode('list')} 
                  className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-white transition"
               >
                  取消
               </button>
               {activeStep < 5 ? (
                  <button 
                     onClick={() => handleStepChange(activeStep + 1)}
                     className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition shadow-lg shadow-brand-200"
                  >
                     下一步 <ChevronRight size={18}/>
                  </button>
               ) : (
                  <button 
                     onClick={handleSubmit}
                     className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-200"
                  >
                     <Upload size={18}/> 推送至平台
                  </button>
               )}
            </div>
         </div>
      </div>
    </div>
  );

  const renderList = () => (
    <div className="space-y-6 animate-fade-in">
       {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">数据产品管理</h2>
           <p className="text-sm text-slate-500 mt-1">管理对外发布的数据产品全生命周期。</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition">
            <Filter size={18} /> 筛选: {filterStatus}
          </button>
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition shadow-sm"
          >
            <Plus size={18} /> 新建产品
          </button>
        </div>
      </div>

      {/* Product List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {products.map(product => (
            <div key={`${product.id}-${product.version}`} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group flex flex-col">
               <div className="p-5 border-b border-slate-50 flex justify-between items-start">
                  <div className="flex items-start gap-3">
                     <div className={`p-2 rounded-lg ${
                        product.type === 'Dataset' ? 'bg-blue-50 text-blue-600' : 
                        product.type === 'API' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-600'
                     }`}>
                        {product.type === 'Dataset' ? <Database size={20}/> : <Globe size={20}/>}
                     </div>
                     <div>
                        <h3 className="font-semibold text-slate-800 leading-tight mb-1">{product.name}</h3>
                        <div className="flex items-center gap-2 text-xs">
                           <span className="font-mono text-slate-400">{product.id}</span>
                           <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono">{product.version}</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        product.status === ProductStatus.PUBLISHED ? 'bg-green-50 text-green-700 border-green-100' :
                        product.status === ProductStatus.OFF_SHELF ? 'bg-slate-100 text-slate-500 border-slate-200' :
                        product.status === ProductStatus.REVOKED ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                     }`}>
                        {product.status}
                     </span>
                  </div>
               </div>

               <div className="p-5 flex-1 space-y-3">
                  <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">{product.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                     <div className="p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="text-slate-400 block mb-1">定价模式</span>
                        <span className="font-semibold text-slate-700">{product.pricing.mode}</span>
                     </div>
                     <div className="p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="text-slate-400 block mb-1">安全等级</span>
                        <span className={`font-bold ${product.securityLevel >=4 ? 'text-red-600' : 'text-green-600'}`}>Level {product.securityLevel}</span>
                     </div>
                     <div className="col-span-2 p-2 bg-slate-50 rounded border border-slate-100 flex justify-between items-center">
                        <span className="text-slate-400">使用策略</span>
                        <span className="font-mono text-brand-600 truncate max-w-[120px]">{product.policyId}</span>
                     </div>
                  </div>
               </div>

               <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-b-xl">
                  {product.status !== ProductStatus.REVOKED ? (
                     <>
                        <div className="flex gap-2">
                           <button 
                              onClick={() => handleEdit(product)}
                              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition"
                           >
                              {product.status === ProductStatus.PUBLISHED ? '编辑 (v2)' : '编辑'}
                           </button>
                        </div>
                        
                        <div className="flex gap-2">
                           {product.status === ProductStatus.PUBLISHED && (
                              <button 
                                 onClick={() => handleLifecycleAction(product.id, 'off-shelf')}
                                 className="text-xs px-2 py-1 rounded border border-slate-200 hover:bg-white hover:text-amber-600 transition"
                              >
                                 下架
                              </button>
                           )}
                           {product.status !== ProductStatus.DRAFT && (
                              <button 
                                 onClick={() => handleLifecycleAction(product.id, 'revoke')}
                                 className="text-xs px-2 py-1 rounded border border-slate-200 hover:bg-white hover:text-red-600 transition"
                              >
                                 注销
                              </button>
                           )}
                        </div>
                     </>
                  ) : (
                     <span className="text-xs text-red-500 w-full text-center py-1">已注销 (Terminated)</span>
                  )}
               </div>
            </div>
         ))}
      </div>
    </div>
  );

  return (
    <div className="relative">
      {viewMode === 'create' ? renderCreateForm() : renderList()}
    </div>
  );
};

export default DataManager;