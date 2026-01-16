import React, { useState } from 'react';
import { 
  Database, Globe, FileText, Plus, Search, Filter, 
  CheckCircle, AlertTriangle, XCircle, RefreshCw, 
  Eye, Server, Play, Save, ArrowLeft, MoreHorizontal, Power,
  Code, Lock, Key, Settings, Trash2, List, Table
} from 'lucide-react';
import { MOCK_ASSETS } from '../constants';
import { DataAsset, ApiParameter, DataSchemaItem } from '../types';

const AssetManager: React.FC = () => {
  const [assets, setAssets] = useState<DataAsset[]>(MOCK_ASSETS);
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [selectedAsset, setSelectedAsset] = useState<DataAsset | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Database' as 'Database' | 'API' | 'File',
    owner: '',
    
    // Database Config
    jdbcUrl: '',
    jdbcUser: '',
    jdbcPassword: '',
    jdbcDriver: 'com.mysql.cj.jdbc.Driver',
    jdbcQuery: '',
    
    // API Config
    apiUrl: '',
    apiMethod: 'GET',
    apiAuthType: 'None',
    apiUsername: '',
    apiPassword: '',
    apiToken: '',
    apiKeyName: '',
    apiKeyValue: '',
    apiKeyLocation: 'Header',
    
    // File Config
    fileProtocol: 'Local' as 'Local' | 'S3' | 'SFTP',
    filePath: '', // Path or Key
    fileFormat: 'CSV',
    // S3
    fileBucket: '',
    fileRegion: 'cn-north-1',
    fileEndpoint: '',
    fileAccessKey: '',
    fileSecretKey: '',
    // SFTP
    fileHost: '',
    filePort: '22',
    fileUsername: '',
    filePassword: '',
    // Options
    fileEncoding: 'UTF-8',
    fileDelimiter: ','
  });

  // Additional State
  const [apiParams, setApiParams] = useState<ApiParameter[]>([]);
  const [schemaItems, setSchemaItems] = useState<DataSchemaItem[]>([]);
  const [isSyncingSchema, setIsSyncingSchema] = useState(false);

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // API Params Handlers
  const handleParamChange = (index: number, field: keyof ApiParameter, value: any) => {
    const newParams = [...apiParams];
    newParams[index] = { ...newParams[index], [field]: value };
    setApiParams(newParams);
  };
  const addApiParam = () => {
    setApiParams([...apiParams, { name: '', type: 'String', location: 'Query', required: false, description: '', defaultValue: '' }]);
  };
  const removeApiParam = (index: number) => {
    setApiParams(apiParams.filter((_, i) => i !== index));
  };

  // Schema Handlers
  const handleSchemaChange = (index: number, field: keyof DataSchemaItem, value: any) => {
    const newSchema = [...schemaItems];
    newSchema[index] = { ...newSchema[index], [field]: value };
    setSchemaItems(newSchema);
  };
  const addSchemaItem = () => {
    setSchemaItems([...schemaItems, { name: '', type: 'String', description: '', required: false }]);
  };
  const removeSchemaItem = (index: number) => {
    setSchemaItems(schemaItems.filter((_, i) => i !== index));
  };
  const handleSyncSchema = () => {
    if (testStatus !== 'success') {
       alert("请先测试连接成功后再同步元数据。");
       return;
    }
    setIsSyncingSchema(true);
    // Mock Sync
    setTimeout(() => {
       setIsSyncingSchema(false);
       setSchemaItems([
          { name: 'id', type: 'INT', description: 'Primary Key', required: true },
          { name: 'customer_name', type: 'VARCHAR(255)', description: 'Customer Full Name', required: true },
          { name: 'amount', type: 'DECIMAL(10,2)', description: 'Transaction Amount', required: true },
          { name: 'status', type: 'VARCHAR(50)', description: 'Order Status', required: false },
          { name: 'created_at', type: 'TIMESTAMP', description: 'Creation Time', required: true },
       ]);
    }, 1200);
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', type: 'Database', owner: '',
      jdbcUrl: '', jdbcUser: '', jdbcPassword: '', jdbcDriver: 'com.mysql.cj.jdbc.Driver', jdbcQuery: '',
      apiUrl: '', apiMethod: 'GET', apiAuthType: 'None', apiUsername: '', apiPassword: '', apiToken: '', apiKeyName: '', apiKeyValue: '', apiKeyLocation: 'Header',
      fileProtocol: 'Local', filePath: '', fileFormat: 'CSV', fileBucket: '', fileRegion: 'cn-north-1', fileEndpoint: '', fileAccessKey: '', fileSecretKey: '',
      fileHost: '', filePort: '22', fileUsername: '', filePassword: '', fileEncoding: 'UTF-8', fileDelimiter: ','
    });
    setApiParams([]);
    setSchemaItems([]);
    setTestStatus('idle');
    setTestMessage('');
  };

  const handleTestConnection = () => {
    setTestStatus('testing');
    setTestMessage('正在建立连接...');
    
    // Simulate network request
    setTimeout(() => {
      const isSuccess = Math.random() > 0.2; // 80% success rate mock
      if (isSuccess) {
        setTestStatus('success');
        setTestMessage('连接成功！延迟: 45ms');
      } else {
        setTestStatus('error');
        setTestMessage('连接失败: Connection timed out (Error 10060)');
      }
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAsset: DataAsset = {
      id: `AST-${(assets.length + 1).toString().padStart(3, '0')}`,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      owner: formData.owner || 'Admin',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      lastVerified: '刚刚',
      connectionConfig: {},
      schema: schemaItems
    };

    if (formData.type === 'Database') {
      newAsset.connectionConfig = {
        jdbcUrl: formData.jdbcUrl,
        username: formData.jdbcUser,
        driver: formData.jdbcDriver,
        query: formData.jdbcQuery
      };
    } else if (formData.type === 'API') {
      newAsset.connectionConfig = {
        url: formData.apiUrl,
        method: formData.apiMethod as any,
        authType: formData.apiAuthType as any,
        authConfig: {
          username: formData.apiUsername,
          token: formData.apiToken,
          keyName: formData.apiKeyName,
          keyValue: formData.apiKeyValue,
          keyLocation: formData.apiKeyLocation as any
        },
        apiParams: apiParams
      };
    } else {
      newAsset.connectionConfig = {
        protocol: formData.fileProtocol,
        filePath: formData.filePath,
        format: formData.fileFormat,
        fileConfig: {
          bucket: formData.fileBucket,
          region: formData.fileRegion,
          endpoint: formData.fileEndpoint,
          host: formData.fileHost,
          port: parseInt(formData.filePort),
          username: formData.fileUsername,
          encoding: formData.fileEncoding,
          delimiter: formData.fileDelimiter
        }
      };
    }

    setAssets([newAsset, ...assets]);
    setViewMode('list');
    resetForm();
  };

  const handlePreview = (asset: DataAsset) => {
    setSelectedAsset(asset);
    // Mock Data based on type
    if (asset.type === 'Database') {
      setPreviewData([
        { id: 1, name: 'Sample Item A', value: 100, date: '2023-01-01' },
        { id: 2, name: 'Sample Item B', value: 250, date: '2023-01-02' },
        { id: 3, name: 'Sample Item C', value: 90, date: '2023-01-03' },
      ]);
    } else if (asset.type === 'API') {
      setPreviewData([
        { status: 200, message: 'OK', payload: { temp: 24, humidity: 60 } }
      ]);
    } else {
      setPreviewData([
        { line: 1, content: 'Log entry 2023-05-10 10:00:00 INFO Started' },
        { line: 2, content: 'Log entry 2023-05-10 10:00:01 DEBUG Init' },
      ]);
    }
  };

  // --- Render Functions ---

  const renderCreateForm = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => { setViewMode('list'); resetForm(); }}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">新建数据资源</h2>
          <p className="text-slate-500 text-sm">配置到底层数据源的连接信息。</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-8">
            
            {/* Common Info */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 pb-2 border-b border-slate-100">基本信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">资源名称</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition" placeholder="例如：核心交易库" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">资源类型</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                    <option value="Database">数据库 (Database)</option>
                    <option value="API">API 接口</option>
                    <option value="File">文件存储 (File/Object)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">所有者/部门</label>
                  <input name="owner" value={formData.owner} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="例如：IT 运维部" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="描述该数据资源的用途和内容..."></textarea>
                </div>
              </div>
            </section>

            {/* Connection Config */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 pb-2 border-b border-slate-100 flex justify-between items-center">
                <span>连接配置</span>
                {testStatus === 'success' && <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={12}/> 连接有效</span>}
              </h3>
              
              {/* === DATABASE FORM === */}
              {formData.type === 'Database' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                   <div className="col-span-2">
                     <label className="block text-sm font-medium text-slate-700 mb-1">JDBC URL</label>
                     <input name="jdbcUrl" value={formData.jdbcUrl} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm" placeholder="jdbc:mysql://host:port/database" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">JDBC Driver</label>
                     <select name="jdbcDriver" value={formData.jdbcDriver} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono text-sm">
                       <option value="com.mysql.cj.jdbc.Driver">MySQL (com.mysql.cj.jdbc.Driver)</option>
                       <option value="org.postgresql.Driver">PostgreSQL (org.postgresql.Driver)</option>
                       <option value="oracle.jdbc.OracleDriver">Oracle (oracle.jdbc.OracleDriver)</option>
                       <option value="com.microsoft.sqlserver.jdbc.SQLServerDriver">SQL Server (com.microsoft.sqlserver.jdbc.SQLServerDriver)</option>
                     </select>
                   </div>
                   <div></div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">用户名</label>
                     <input name="jdbcUser" value={formData.jdbcUser} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
                     <input type="password" name="jdbcPassword" value={formData.jdbcPassword} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                   </div>
                   <div className="col-span-2">
                     <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                        <Code size={16} className="text-brand-600"/> 数据查询 (SQL SELECT)
                     </label>
                     <textarea 
                        name="jdbcQuery" 
                        value={formData.jdbcQuery} 
                        onChange={handleInputChange} 
                        rows={4} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition" 
                        placeholder="SELECT * FROM table_name WHERE created_at > '2024-01-01'"
                      ></textarea>
                      <p className="text-xs text-slate-500 mt-1">请输入完整的 SELECT 查询语句以定义数据资源的内容范围。</p>
                   </div>
                </div>
              )}

              {/* === API FORM === */}
              {formData.type === 'API' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                   <div className="col-span-2">
                     <label className="block text-sm font-medium text-slate-700 mb-1">Endpoint URL</label>
                     <input name="apiUrl" value={formData.apiUrl} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm" placeholder="https://api.example.com/v1/data" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">HTTP Method</label>
                     <select name="apiMethod" value={formData.apiMethod} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                       <option value="GET">GET</option>
                       <option value="POST">POST</option>
                     </select>
                   </div>
                   
                   {/* Auth Config */}
                   <div className="col-span-2 border-t border-slate-100 pt-4">
                     <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <Lock size={16} className="text-brand-600"/> 认证方式
                     </label>
                     <select name="apiAuthType" value={formData.apiAuthType} onChange={handleInputChange} className="w-full md:w-1/2 px-3 py-2 border border-slate-300 rounded-lg bg-white mb-4">
                        <option value="None">无认证 (None)</option>
                        <option value="Basic">Basic Auth (用户名/密码)</option>
                        <option value="Bearer">Bearer Token (令牌)</option>
                        <option value="ApiKey">API Key (密钥)</option>
                     </select>

                     <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        {formData.apiAuthType === 'None' && <span className="text-sm text-slate-500">该接口公开访问，无需认证凭证。</span>}
                        
                        {formData.apiAuthType === 'Basic' && (
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-xs font-medium text-slate-500 mb-1">Username</label>
                                 <input name="apiUsername" value={formData.apiUsername} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white" />
                              </div>
                              <div>
                                 <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
                                 <input type="password" name="apiPassword" value={formData.apiPassword} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white" />
                              </div>
                           </div>
                        )}

                        {formData.apiAuthType === 'Bearer' && (
                           <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Token</label>
                              <input name="apiToken" value={formData.apiToken} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-mono" placeholder="ey..." />
                           </div>
                        )}

                        {formData.apiAuthType === 'ApiKey' && (
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                 <label className="block text-xs font-medium text-slate-500 mb-1">Key Name</label>
                                 <input name="apiKeyName" value={formData.apiKeyName} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white" placeholder="X-API-Key" />
                              </div>
                              <div>
                                 <label className="block text-xs font-medium text-slate-500 mb-1">Value</label>
                                 <input name="apiKeyValue" value={formData.apiKeyValue} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white" />
                              </div>
                              <div>
                                 <label className="block text-xs font-medium text-slate-500 mb-1">Add To</label>
                                 <select name="apiKeyLocation" value={formData.apiKeyLocation} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                                    <option value="Header">Header</option>
                                    <option value="Query">Query Params</option>
                                 </select>
                              </div>
                           </div>
                        )}
                     </div>
                   </div>

                   {/* Params Config */}
                   <div className="col-span-2 border-t border-slate-100 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                            <List size={16} className="text-brand-600"/> 请求参数配置 (Input)
                        </label>
                        <button type="button" onClick={addApiParam} className="text-xs flex items-center gap-1 bg-brand-50 text-brand-600 px-2 py-1 rounded hover:bg-brand-100 transition">
                            <Plus size={14}/> 添加参数
                        </button>
                      </div>
                      
                      {apiParams.length === 0 ? (
                          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-lg p-4 text-center text-sm text-slate-400">
                              暂无配置参数。点击上方“添加参数”以定义接口入参。
                          </div>
                      ) : (
                          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                              <table className="w-full text-sm text-left">
                                  <thead className="bg-slate-50 text-slate-500 font-medium">
                                      <tr>
                                          <th className="px-3 py-2 w-1/5">参数名称</th>
                                          <th className="px-3 py-2 w-1/6">位置</th>
                                          <th className="px-3 py-2 w-1/6">类型</th>
                                          <th className="px-3 py-2 w-1/12">必填</th>
                                          <th className="px-3 py-2">默认值</th>
                                          <th className="px-3 py-2 w-10"></th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                      {apiParams.map((param, idx) => (
                                          <tr key={idx}>
                                              <td className="p-2">
                                                  <input 
                                                    value={param.name} 
                                                    onChange={(e) => handleParamChange(idx, 'name', e.target.value)}
                                                    className="w-full px-2 py-1 border border-slate-200 rounded focus:border-brand-500 focus:outline-none" 
                                                    placeholder="key"
                                                  />
                                              </td>
                                              <td className="p-2">
                                                  <select 
                                                    value={param.location}
                                                    onChange={(e) => handleParamChange(idx, 'location', e.target.value)}
                                                    className="w-full px-2 py-1 border border-slate-200 rounded focus:border-brand-500 focus:outline-none bg-white"
                                                  >
                                                      <option value="Query">Query</option>
                                                      <option value="Header">Header</option>
                                                      <option value="Body">Body</option>
                                                      <option value="Path">Path</option>
                                                  </select>
                                              </td>
                                              <td className="p-2">
                                                  <select 
                                                    value={param.type}
                                                    onChange={(e) => handleParamChange(idx, 'type', e.target.value)}
                                                    className="w-full px-2 py-1 border border-slate-200 rounded focus:border-brand-500 focus:outline-none bg-white"
                                                  >
                                                      <option value="String">String</option>
                                                      <option value="Number">Number</option>
                                                      <option value="Boolean">Boolean</option>
                                                      <option value="JSON">JSON</option>
                                                  </select>
                                              </td>
                                              <td className="p-2 text-center">
                                                  <input 
                                                    type="checkbox"
                                                    checked={param.required}
                                                    onChange={(e) => handleParamChange(idx, 'required', e.target.checked)}
                                                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                                  />
                                              </td>
                                              <td className="p-2">
                                                  <input 
                                                    value={param.defaultValue || ''} 
                                                    onChange={(e) => handleParamChange(idx, 'defaultValue', e.target.value)}
                                                    className="w-full px-2 py-1 border border-slate-200 rounded focus:border-brand-500 focus:outline-none text-slate-600"
                                                  />
                                              </td>
                                              <td className="p-2 text-center">
                                                  <button 
                                                    type="button" 
                                                    onClick={() => removeApiParam(idx)}
                                                    className="text-slate-400 hover:text-red-500 transition"
                                                  >
                                                      <Trash2 size={16}/>
                                                  </button>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      )}
                   </div>
                </div>
              )}

              {/* === FILE FORM === */}
              {formData.type === 'File' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                   <div className="col-span-2">
                     <label className="block text-sm font-medium text-slate-700 mb-1">存储协议</label>
                     <select name="fileProtocol" value={formData.fileProtocol} onChange={handleInputChange} className="w-full md:w-1/3 px-3 py-2 border border-slate-300 rounded-lg bg-white">
                       <option value="Local">本地/挂载 (Local FS)</option>
                       <option value="S3">对象存储 (AWS S3 Compatible)</option>
                       <option value="SFTP">SFTP / SSH</option>
                     </select>
                   </div>

                   {/* Protocol Specific Fields */}
                   <div className="col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                      {formData.fileProtocol === 'Local' && (
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">文件绝对路径</label>
                            <input name="filePath" value={formData.filePath} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm bg-white" placeholder="/mnt/data/share/marketing_data.csv" />
                            <p className="text-xs text-slate-500 mt-1">请确保连接器进程对该路径有读取权限。</p>
                         </div>
                      )}

                      {formData.fileProtocol === 'S3' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                               <label className="block text-xs font-medium text-slate-500 mb-1">Bucket Name</label>
                               <input name="fileBucket" value={formData.fileBucket} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white" />
                            </div>
                            <div>
                               <label className="block text-xs font-medium text-slate-500 mb-1">Region</label>
                               <input name="fileRegion" value={formData.fileRegion} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white" placeholder="cn-north-1" />
                            </div>
                            <div className="col-span-2">
                               <label className="block text-xs font-medium text-slate-500 mb-1">Endpoint (Optional for AWS)</label>
                               <input name="fileEndpoint" value={formData.fileEndpoint} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-mono" placeholder="https://s3.example.com" />
                            </div>
                            <div>
                               <label className="block text-xs font-medium text-slate-500 mb-1">Access Key ID</label>
                               <input name="fileAccessKey" value={formData.fileAccessKey} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white" />
                            </div>
                            <div>
                               <label className="block text-xs font-medium text-slate-500 mb-1">Secret Access Key</label>
                               <input type="password" name="fileSecretKey" value={formData.fileSecretKey} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white" />
                            </div>
                            <div className="col-span-2">
                               <label className="block text-xs font-medium text-slate-500 mb-1">Object Key / Prefix</label>
                               <input name="filePath" value={formData.filePath} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-mono" placeholder="data/2024/" />
                            </div>
                         </div>
                      )}

                      {formData.fileProtocol === 'SFTP' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2 md:col-span-1">
                               <label className="block text-xs font-medium text-slate-500 mb-1">Host</label>
                               <input name="fileHost" value={formData.fileHost} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-mono" placeholder="sftp.partner.com" />
                            </div>
                            <div>
                               <label className="block text-xs font-medium text-slate-500 mb-1">Port</label>
                               <input name="filePort" type="number" value={formData.filePort} onChange={handleInputChange} className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-mono" placeholder="22" />
                            </div>
                            <div>
                               <label className="block text-xs font-medium text-slate-500 mb-1">Username</label>
                               <input name="fileUsername" value={formData.fileUsername} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white" />
                            </div>
                            <div>
                               <label className="block text-xs font-medium text-slate-500 mb-1">Password / Key</label>
                               <input type="password" name="filePassword" value={formData.filePassword} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white" />
                            </div>
                            <div className="col-span-2">
                               <label className="block text-xs font-medium text-slate-500 mb-1">Remote Path</label>
                               <input name="filePath" value={formData.filePath} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-mono" placeholder="/var/www/uploads/" />
                            </div>
                         </div>
                      )}
                   </div>

                   {/* Format Settings */}
                   <div className="col-span-2 flex gap-4">
                      <div className="flex-1">
                         <label className="block text-sm font-medium text-slate-700 mb-1">文件格式</label>
                         <select name="fileFormat" value={formData.fileFormat} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                           <option value="CSV">CSV (Comma Separated)</option>
                           <option value="JSON">JSON</option>
                           <option value="Parquet">Parquet</option>
                           <option value="XML">XML</option>
                           <option value="Excel">Excel (XLSX)</option>
                         </select>
                      </div>
                      
                      {formData.fileFormat === 'CSV' && (
                        <>
                           <div className="w-1/4">
                              <label className="block text-sm font-medium text-slate-700 mb-1">编码</label>
                              <select name="fileEncoding" value={formData.fileEncoding} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                                <option value="UTF-8">UTF-8</option>
                                <option value="GBK">GBK</option>
                                <option value="ISO-8859-1">ISO-8859-1</option>
                              </select>
                           </div>
                           <div className="w-1/4">
                              <label className="block text-sm font-medium text-slate-700 mb-1">分隔符</label>
                              <input name="fileDelimiter" value={formData.fileDelimiter} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center font-mono" />
                           </div>
                        </>
                      )}
                   </div>
                </div>
              )}

              {/* Connection Test Area */}
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   {testStatus === 'testing' && <RefreshCw className="animate-spin text-brand-600" size={20}/>}
                   {testStatus === 'success' && <CheckCircle className="text-green-500" size={20}/>}
                   {testStatus === 'error' && <XCircle className="text-red-500" size={20}/>}
                   <span className={`text-sm ${
                      testStatus === 'success' ? 'text-green-700' : 
                      testStatus === 'error' ? 'text-red-700' : 'text-slate-600'
                   }`}>
                      {testMessage || '保存前请先测试连接以确保配置正确。'}
                   </span>
                </div>
                <button 
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium disabled:opacity-50"
                >
                  测试连接
                </button>
              </div>
            </section>

             {/* Metadata/Schema Section */}
            <section className="space-y-4 pt-4 border-t border-slate-100 animate-fade-in">
               <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                     <Table size={20} className="text-brand-600"/>
                     <span>元数据配置</span>
                     <span className="text-sm font-normal text-slate-500 ml-2">
                        ({formData.type === 'Database' ? '表结构' : formData.type === 'API' ? '返回参数' : '文件列定义'})
                     </span>
                  </h3>
                  <div className="flex gap-2">
                     {formData.type === 'Database' && (
                        <button 
                           type="button"
                           onClick={handleSyncSchema}
                           disabled={isSyncingSchema}
                           className="text-xs flex items-center gap-1 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded hover:bg-slate-50 transition disabled:opacity-50"
                        >
                           <RefreshCw size={14} className={isSyncingSchema ? 'animate-spin' : ''}/> 
                           {isSyncingSchema ? '同步中...' : '从数据库同步'}
                        </button>
                     )}
                     <button 
                        type="button" 
                        onClick={addSchemaItem} 
                        className="text-xs flex items-center gap-1 bg-brand-50 text-brand-600 px-3 py-1.5 rounded hover:bg-brand-100 transition"
                     >
                        <Plus size={14}/> 添加字段
                     </button>
                  </div>
               </div>

               {schemaItems.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 border-dashed rounded-lg p-6 text-center text-sm text-slate-400">
                     {formData.type === 'Database' ? '点击“从数据库同步”或手动添加字段以定义表结构。' : '暂无元数据定义。点击上方“添加字段”以手动配置。'}
                  </div>
               ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                     <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                           <tr>
                              <th className="px-3 py-2 w-1/4">字段名称 (Name)</th>
                              <th className="px-3 py-2 w-1/5">数据类型 (Type)</th>
                              <th className="px-3 py-2">描述 (Description)</th>
                              <th className="px-3 py-2 w-16 text-center">必填</th>
                              <th className="px-3 py-2 w-10"></th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {schemaItems.map((item, idx) => (
                              <tr key={idx}>
                                 <td className="p-2">
                                    <input 
                                       value={item.name} 
                                       onChange={(e) => handleSchemaChange(idx, 'name', e.target.value)}
                                       className="w-full px-2 py-1 border border-slate-200 rounded focus:border-brand-500 focus:outline-none" 
                                       placeholder="field_name"
                                    />
                                 </td>
                                 <td className="p-2">
                                    <input 
                                       value={item.type} 
                                       onChange={(e) => handleSchemaChange(idx, 'type', e.target.value)}
                                       className="w-full px-2 py-1 border border-slate-200 rounded focus:border-brand-500 focus:outline-none" 
                                       placeholder="VARCHAR"
                                       list="dataTypes"
                                    />
                                    <datalist id="dataTypes">
                                       <option value="String"/>
                                       <option value="Integer"/>
                                       <option value="Boolean"/>
                                       <option value="Double"/>
                                       <option value="Date"/>
                                       <option value="Timestamp"/>
                                       <option value="VARCHAR(255)"/>
                                       <option value="INT"/>
                                       <option value="Object"/>
                                       <option value="Array"/>
                                    </datalist>
                                 </td>
                                 <td className="p-2">
                                    <input 
                                       value={item.description || ''} 
                                       onChange={(e) => handleSchemaChange(idx, 'description', e.target.value)}
                                       className="w-full px-2 py-1 border border-slate-200 rounded focus:border-brand-500 focus:outline-none text-slate-600"
                                       placeholder="字段含义..."
                                    />
                                 </td>
                                 <td className="p-2 text-center">
                                    <input 
                                       type="checkbox"
                                       checked={item.required}
                                       onChange={(e) => handleSchemaChange(idx, 'required', e.target.checked)}
                                       className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                    />
                                 </td>
                                 <td className="p-2 text-center">
                                    <button 
                                       type="button" 
                                       onClick={() => removeSchemaItem(idx)}
                                       className="text-slate-400 hover:text-red-500 transition"
                                    >
                                       <Trash2 size={16}/>
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </section>
          </div>

          <div className="px-8 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
            <button type="button" onClick={() => setViewMode('list')} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-white transition font-medium">取消</button>
            <button type="submit" disabled={testStatus === 'testing'} className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-medium shadow-sm disabled:opacity-50">
               <Save size={18} /> 保存资源
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {viewMode === 'create' ? renderCreateForm() : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
               <h2 className="text-2xl font-bold text-slate-800">数据资源管理</h2>
               <p className="text-sm text-slate-500 mt-1">管理连接到底层数据源（数据库、API、文件）的技术配置。</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition">
                <Filter size={18} /> 筛选
              </button>
              <button 
                onClick={() => setViewMode('create')}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition shadow-sm"
              >
                <Plus size={18} /> 新建资源
              </button>
            </div>
          </div>

          {/* Asset List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map(asset => (
              <div key={asset.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group">
                <div className="p-5 border-b border-slate-50 flex justify-between items-start">
                   <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        asset.type === 'Database' ? 'bg-cyan-50 text-cyan-600' :
                        asset.type === 'API' ? 'bg-purple-50 text-purple-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                         {asset.type === 'Database' ? <Database size={20}/> : 
                          asset.type === 'API' ? <Globe size={20}/> : <FileText size={20}/>}
                      </div>
                      <div>
                         <h3 className="font-semibold text-slate-800">{asset.name}</h3>
                         <span className="text-xs text-slate-400">{asset.id}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${asset.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                   </div>
                </div>
                
                <div className="p-5 space-y-3">
                   <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">{asset.description}</p>
                   
                   <div className="p-3 bg-slate-50 rounded border border-slate-100 text-xs font-mono text-slate-600 break-all space-y-1">
                      {asset.type === 'Database' && (
                        <>
                          <div>{asset.connectionConfig.jdbcUrl}</div>
                          <div className="text-slate-400 mt-1 truncate border-t border-slate-200 pt-1">
                             {asset.connectionConfig.query}
                          </div>
                        </>
                      )}
                      
                      {asset.type === 'API' && (
                        <>
                          <div className="flex gap-2">
                             <span className="font-bold text-purple-600">{asset.connectionConfig.method}</span>
                             <span>{asset.connectionConfig.url}</span>
                          </div>
                          {asset.connectionConfig.authType !== 'None' && (
                             <div className="text-slate-400 mt-1 flex items-center gap-1">
                                <Lock size={10}/> {asset.connectionConfig.authType} Auth
                             </div>
                          )}
                          {asset.connectionConfig.apiParams && asset.connectionConfig.apiParams.length > 0 && (
                            <div className="text-slate-400 mt-1 flex items-center gap-1">
                                <List size={10}/> {asset.connectionConfig.apiParams.length} Params Configured
                             </div>
                          )}
                        </>
                      )}
                      
                      {asset.type === 'File' && (
                        <>
                          <div className="flex items-center gap-1 mb-1">
                             <span className="font-bold text-amber-600 uppercase">{asset.connectionConfig.protocol}</span>
                             <span className="text-slate-400">({asset.connectionConfig.format})</span>
                          </div>
                          <div className="truncate">
                             {asset.connectionConfig.protocol === 'S3' 
                                ? `s3://${asset.connectionConfig.fileConfig?.bucket}/${asset.connectionConfig.filePath}`
                                : asset.connectionConfig.filePath
                             }
                          </div>
                        </>
                      )}
                      {/* Metadata Summary */}
                      {asset.schema && asset.schema.length > 0 && (
                         <div className="text-slate-400 mt-1 border-t border-slate-200 pt-1 flex items-center gap-1">
                            <Table size={10}/> Metadata: {asset.schema.length} fields
                         </div>
                      )}
                   </div>
                   
                   <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
                      <span>上次验证: {asset.lastVerified}</span>
                      <span>{asset.owner}</span>
                   </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-b-xl">
                   <button className="text-slate-400 hover:text-slate-600"><Settings size={16}/></button>
                   <button 
                     onClick={() => handlePreview(asset)}
                     className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                   >
                      <Eye size={16}/> 预览数据
                   </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Data Preview Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col animate-fade-in">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-bold text-slate-800">数据预览</h3>
                    <p className="text-sm text-slate-500">资源: {selectedAsset.name}</p>
                 </div>
                 <button onClick={() => setSelectedAsset(null)} className="text-slate-400 hover:text-slate-600">
                    <XCircle size={24}/>
                 </button>
              </div>
              
              <div className="flex-1 overflow-auto p-6 bg-slate-50">
                 {previewData ? (
                   <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm text-left">
                         <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                               {Object.keys(previewData[0]).map(key => (
                                 <th key={key} className="px-4 py-2 capitalize">{key}</th>
                               ))}
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                            {previewData.map((row, i) => (
                               <tr key={i} className="hover:bg-slate-50">
                                  {Object.values(row).map((val: any, j) => (
                                    <td key={j} className="px-4 py-2 text-slate-700">
                                       {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                    </td>
                                  ))}
                               </tr>
                            ))}
                         </tbody>
                      </table>
                      <div className="p-2 text-xs text-slate-400 text-center bg-slate-50 border-t border-slate-100">
                         仅显示前 {previewData.length} 条记录样本
                      </div>
                   </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                       <RefreshCw className="animate-spin mb-2" size={24}/>
                       <span>加载数据中...</span>
                    </div>
                 )}
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end">
                 <button onClick={() => setSelectedAsset(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">关闭</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AssetManager;