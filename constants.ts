import { UserRole, ProductStatus, DataProduct, LogEntry, DataAsset, Policy, Contract, ContractStatus, SignMode } from './types';

export const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.SYSTEM_ADMIN]: 'bg-gray-600 text-white',
  [UserRole.CONNECTOR_ADMIN]: 'bg-blue-600 text-white',
  [UserRole.DATA_CATALOGER]: 'bg-cyan-600 text-white',
  [UserRole.DATA_AUDITOR]: 'bg-purple-600 text-white',
  [UserRole.CONTRACT_ADMIN]: 'bg-orange-600 text-white',
  [UserRole.DATA_CONSUMER]: 'bg-green-600 text-white',
  [UserRole.AUDITOR]: 'bg-red-600 text-white'
};

// Mock Policies (ODRL Compliant)
export const MOCK_POLICIES: Policy[] = [
  { 
    "@context": "http://www.w3.org/ns/odrl.jsonld",
    "@type": "Set",
    uid: 'POL-001', 
    humanName: '仅供研究使用 (混合模式示例)', 
    description: '限制数据集仅用于非商业研究目的，包含可协商的次数和系统注入的环境绑定。',
    status: 'Active',
    version: 'v1.2',
    priority: 50,
    createdAt: '2024-01-01',
    permission: [{
      action: 'use',
      target: 'http://data.example.com/dataset/weather',
      constraint: [
        {
          leftOperand: 'dateTime',
          operator: 'gte',
          rightOperand: '2024-01-01',
          comment: 'Effective Start',
          mode: 'Locked'
        },
        {
          leftOperand: 'count',
          operator: 'lte',
          rightOperand: 1000,
          comment: 'Max Usage',
          mode: 'Negotiable',
          negotiationOptions: {
            min: 100,
            max: 5000
          }
        },
        {
          leftOperand: 'targetConnectorDid',
          operator: 'eq',
          rightOperand: '', 
          comment: 'Auto-Bind Connector',
          mode: 'Locked'
        }
      ],
      duty: [
        {
          action: 'anonymize', // ODRL term for Desensitization
          target: 'mobile',
          constraint: [
             { leftOperand: 'algorithm', operator: 'eq', rightOperand: 'Masking' },
             { leftOperand: 'params', operator: 'eq', rightOperand: 'Keep 3, 4' }
          ]
        }
      ]
    }]
  },
  { 
    "@context": "http://www.w3.org/ns/odrl.jsonld",
    "@type": "Set",
    uid: 'POL-002', 
    humanName: '高密金融数据传输', 
    description: '要求全链路国密加密，且仅能在隐私计算环境中使用。',
    status: 'Active',
    version: 'v2.0',
    priority: 90,
    createdAt: '2024-03-15',
    permission: [{
      action: 'transfer',
      constraint: [
        {
          leftOperand: 'absoluteSpatialPosition', // Using spatial/env constraint
          operator: 'eq',
          rightOperand: 'PrivacyCompute',
          comment: 'Execution Environment',
          mode: 'Locked'
        },
        {
          leftOperand: 'virtualLocation', // IP Whitelist
          operator: 'isA',
          rightOperand: '10.20.0.0/16',
          mode: 'Locked'
        }
      ],
      duty: [
        {
          action: 'encrypt',
          constraint: [
             { leftOperand: 'algorithm', operator: 'eq', rightOperand: 'SM4' },
             { leftOperand: 'keyManagement', operator: 'eq', rightOperand: 'OneTime' }
          ]
        }
      ]
    }]
  }
];

// Mock Contracts
export const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'CNT-2025-001',
    name: '区域气象数据-科研所申请',
    description: '海淀科研所申请使用 2024 年度气象数据进行气候模型训练，要求每日更新。',
    role: 'Provider',
    productId: 'DP-BJ-882001',
    productName: '区域气象历史数据',
    counterpartyName: '海淀区科研所',
    counterpartyDid: 'did:conn:group:556677',
    signatorySpecifiedPointId: 'did:conn:my-connector:001',
    status: ContractStatus.NEGOTIATING,
    signMode: SignMode.BROKER,
    version: 4,
    lastUpdated: '2025-05-10 09:30:00',
    myPolicy: {
      actions: ['read', 'desensitize'],
      constraints: {
        usageCount: 1000,
        validUntil: '2025-12-31',
        environment: 'None'
      }
    },
    counterpartyPolicy: {
      actions: ['read', 'desensitize', 'transfer'],
      constraints: {
        usageCount: 2000,
        validUntil: '2025-12-31',
        environment: 'None'
      }
    },
    history: [
      {
        version: 4,
        proposer: 'Counterparty',
        timestamp: '2025-05-10 09:30:00',
        comment: '申请增加使用次数至2000次，以支持更大规模的模型训练。',
        policySnapshot: {
          actions: ['read', 'desensitize', 'transfer'],
          constraints: { usageCount: 2000, validUntil: '2025-12-31', environment: 'None' }
        }
      },
      {
        version: 3,
        proposer: 'Me',
        timestamp: '2025-05-09 14:00:00',
        comment: '基于合规要求，移除“转存(Transfer)”权限，仅允许在线读取。',
        policySnapshot: {
          actions: ['read', 'desensitize'],
          constraints: { usageCount: 1000, validUntil: '2025-12-31', environment: 'None' }
        }
      },
      {
        version: 2,
        proposer: 'Counterparty',
        timestamp: '2025-05-08 16:30:00',
        comment: '更新执行环境要求，目前测试环境无需 TEE。',
        policySnapshot: {
          actions: ['read', 'desensitize', 'transfer'],
          constraints: { usageCount: 1000, validUntil: '2025-12-31', environment: 'None' }
        }
      },
      {
        version: 1,
        proposer: 'Me',
        timestamp: '2025-05-08 10:00:00',
        comment: '初始草案发起。',
        policySnapshot: {
          actions: ['read', 'desensitize'],
          constraints: { usageCount: 1000, validUntil: '2025-06-30', environment: 'TEE' }
        }
      }
    ]
  },
  {
    id: 'CNT-2025-002',
    name: '交通API-出行公司接入',
    description: '出行无忧公司请求接入实时交通流量接口，用于优化路线规划算法。',
    role: 'Provider',
    productId: 'DP-BJ-882002',
    productName: '交通流量实时 API',
    counterpartyName: '出行无忧科技有限公司',
    counterpartyDid: 'did:conn:ent:112233',
    signatorySpecifiedPointId: 'did:conn:my-connector:001',
    status: ContractStatus.PENDING_SIGNATURE,
    signMode: SignMode.P2P,
    version: 3,
    lastUpdated: '2025-05-09 16:00:00',
    myPolicy: {
      actions: ['read'],
      constraints: { usageCount: 50000, environment: 'TEE', ipWhitelist: '10.20.1.5' }
    },
    counterpartyPolicy: {
      actions: ['read'],
      constraints: { usageCount: 50000, environment: 'TEE', ipWhitelist: '10.20.1.5' }
    },
    history: [
       {
        version: 3,
        proposer: 'Counterparty',
        timestamp: '2025-05-09 16:00:00',
        comment: '已确认最终条款，准备签署。',
        policySnapshot: {
          actions: ['read'],
          constraints: { usageCount: 50000, environment: 'TEE', ipWhitelist: '10.20.1.5' }
        }
      }
    ]
  }
];

export const MOCK_PRODUCTS: DataProduct[] = [
  {
    id: 'DP-BJ-882001',
    code: '882001',
    version: 'v1.0',
    name: '区域气象历史数据',
    description: '包含过去5年北京地区各监测站点的气温、湿度、降雨量等分钟级数据。',
    status: ProductStatus.PUBLISHED,
    themeCategory: 'A1000',
    industryCategory: 'I65',
    sourceType: 'Original',
    updated: '每日',
    securityLevel: 2,
    qualityLevel: 'A',
    provider: '北极星数据',
    type: 'Dataset',
    assetIds: ['AST-001'],
    policyId: 'POL-001',
    pricing: { mode: 'Subscription', price: 5000, currency: 'CNY', period: 'Yearly' },
    sampleData: { fileName: 'weather_sample_2024.csv', fileSize: '2.5 MB', uploadedAt: '2024-01-01' }
  },
  {
    id: 'DP-BJ-882002',
    code: '882002',
    version: 'v2.1',
    name: '交通流量实时 API',
    description: '提供主要环路及高速出入口的实时车流量监控数据接口。',
    status: ProductStatus.PUBLISHED,
    themeCategory: 'B2000',
    industryCategory: 'G54',
    sourceType: 'Collected',
    updated: '实时',
    securityLevel: 3,
    qualityLevel: 'B',
    provider: '北极星数据',
    type: 'API',
    assetIds: ['AST-002'],
    policyId: 'POL-002',
    pricing: { mode: 'Pay-per-request', price: 0.1, currency: 'CNY' }
  },
  {
    id: 'DP-BJ-882003',
    code: '882003',
    version: 'v0.9',
    name: '2024 Q1 消费趋势报告',
    description: '基于脱敏后的聚合消费数据生成的宏观趋势分析报告。',
    status: ProductStatus.DRAFT,
    themeCategory: 'C3000',
    industryCategory: 'F52',
    sourceType: 'Derived',
    updated: '不定期',
    securityLevel: 2,
    qualityLevel: 'A',
    provider: '北极星数据',
    type: 'Report',
    assetIds: ['AST-003'],
    pricing: { mode: 'Fixed', price: 2000, currency: 'CNY' }
  }
];

export const MOCK_ASSETS: DataAsset[] = [
  {
    id: 'AST-001',
    name: '核心气象数据库',
    description: '存储全量历史气象数据的 MySQL 集群节点。',
    type: 'Database',
    owner: '数据工程部',
    status: 'Active',
    createdAt: '2023-11-01',
    lastVerified: '2025-05-10 08:00:00',
    connectionConfig: { jdbcUrl: 'jdbc:mysql://10.20.5.88:3306/weather_core' }
  },
  {
    id: 'AST-002',
    name: '交通委数据网关',
    description: '对接市政交通委的外部专线接口网关。',
    type: 'API',
    owner: '外部接入组',
    status: 'Active',
    createdAt: '2024-02-15',
    lastVerified: '2025-05-10 14:30:00',
    connectionConfig: { url: 'https://gw.traffic.beijing.gov.cn/v2/stream' }
  },
  {
    id: 'AST-003',
    name: '消费日志归档',
    description: '存储于 S3 的冷数据归档文件。',
    type: 'File',
    owner: '大数据平台',
    status: 'Inactive',
    createdAt: '2024-04-01',
    lastVerified: '2025-04-20 00:00:00',
    connectionConfig: { protocol: 'S3', path: 's3://archive-bucket/2024/q1/' }
  }
];

export const MOCK_LOGS: LogEntry[] = [
  { id: 'LOG-10001', time: '2025-05-10 14:23:45', user: '张三 (Admin)', action: 'Create Contract', target: 'CNT-2025-003', status: 'Success' },
  { id: 'LOG-10002', time: '2025-05-10 14:15:22', user: 'System', action: 'Policy Check', target: 'Access Request #9921', status: 'Warning' },
  { id: 'LOG-10003', time: '2025-05-10 13:50:11', user: '李四 (Auditor)', action: 'Export Log', target: 'Audit_2025_04.csv', status: 'Success' },
  { id: 'LOG-10004', time: '2025-05-10 11:30:05', user: 'External: Node-05', action: 'Data Transfer', target: 'TRX-9980', status: 'Success' },
  { id: 'LOG-10005', time: '2025-05-10 09:12:33', user: '王五 (Cataloger)', action: 'Publish Product', target: 'DP-BJ-882002', status: 'Failure' }
];