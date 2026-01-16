import { LucideIcon } from 'lucide-react';

export enum UserRole {
  SYSTEM_ADMIN = '系统管理员',
  CONNECTOR_ADMIN = '连接器管理员',
  DATA_CATALOGER = '数据编目员',
  DATA_AUDITOR = '数据审计员',
  CONTRACT_ADMIN = '合约管理员',
  DATA_CONSUMER = '数据消费者',
  AUDITOR = '审计员'
}

export enum Page {
  DASHBOARD = 'dashboard',
  IDENTITY = 'identity',
  ASSETS = 'assets',
  DATA = 'data',
  CONTRACTS = 'contracts',
  ACCESS = 'access',
  DELIVERY = 'delivery',
  LOGS = 'logs',
  SYSTEM = 'system'
}

export enum ProductStatus {
  DRAFT = '草稿',
  PENDING_AUDIT = '待审核',
  PUBLISHED = '已发布',
  OFF_SHELF = '已下架',
  REVOKED = '已注销'
}

export enum ContractStatus {
  DRAFT = 'Draft',
  NEGOTIATING = 'Negotiating',
  PENDING_SIGNATURE = 'PendingSign',
  ACTIVE = 'Active',
  TERMINATED = 'Terminated',
  REVOKED = 'Revoked'
}

export enum SignMode {
  P2P = 'Point-to-Point',
  BROKER = 'Broker-Mediated'
}

// --- ODRL Compliant Policy Types ---

export type OdrlOperator = 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'gteq' | 'lteq' | 'neq' | 'isA' | 'hasPart' | 'isPartOf' | 'isAllOf' | 'isAnyOf' | 'isNoneOf';

// New: Constraint Modes
export type ConstraintMode = 'Locked' | 'Negotiable' | 'Injected';

export interface OdrlConstraint {
  leftOperand: string; // e.g., 'dateTime', 'count', 'spatial', 'targetConnectorDid'
  operator: OdrlOperator;
  rightOperand: string | number | string[]; 
  comment?: string; // UI helper
  
  // New fields for negotiation and context
  mode?: ConstraintMode; 
  negotiationOptions?: {
    min?: number | string;
    max?: number | string;
    step?: number;
  };
}

export interface OdrlRefinement {
  leftOperand: string; // e.g., 'algorithm', 'key', 'method'
  operator: OdrlOperator;
  rightOperand: string | number;
}

export interface OdrlAction {
  name: string; // e.g., 'use', 'read', 'transfer', 'anonymize', 'encrypt'
  refinement?: OdrlConstraint[]; // Refinements on the action itself
}

export interface OdrlDuty {
  action: string; // e.g., 'encrypt', 'anonymize', 'log'
  target?: string; // Specific field or asset part
  constraint?: OdrlConstraint[]; // Configuration for the duty (e.g. algo=SM4)
}

export interface OdrlPermission {
  target?: string; // Asset ID (optional in template)
  action: string; // Primary action, usually 'use' or 'read'
  constraint?: OdrlConstraint[]; // Rules: Time, Count, Location
  duty?: OdrlDuty[]; // Obligations: Encrypt, Desensitize
}

export interface Policy {
  '@context'?: string;
  '@type': 'Set' | 'Offer' | 'Agreement';
  uid: string; // ODRL uid
  profile?: string; // e.g. "http://example.com/odrl-profile/trusted-data"
  
  // Metadata (Non-ODRL standard fields, kept for UI)
  humanName: string; 
  description: string;
  status: 'Active' | 'Disabled';
  priority: number;
  version: string;
  createdAt: string;

  // ODRL Core
  permission: OdrlPermission[];
}

// --- Other Types ---

export interface MenuItem {
  id: Page;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

export interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon;
  colorClass: string;
}

export interface PricingConfig {
  mode: 'Free' | 'Pay-per-request' | 'Subscription' | 'Fixed';
  price?: number;
  currency: string;
  period?: string;
  terms?: string;
}

export interface DataProduct {
  id: string;
  code: string;
  version: string;
  name: string;
  description: string;
  status: ProductStatus;
  themeCategory: string;
  industryCategory: string;
  sourceType: 'Original' | 'Collected' | 'Derived';
  updated: string;
  securityLevel: 1 | 2 | 3 | 4 | 5;
  qualityLevel: 'A' | 'B' | 'C' | 'D';
  provider: string;
  type: 'Dataset' | 'API' | 'Report' | 'Database';
  assetIds: string[];
  policyId?: string;
  pricing: PricingConfig;
  sampleData?: {
    fileName: string;
    fileSize: string;
    uploadedAt: string;
  };
}

// Contract types updated to use ODRL structure implicitly or mapped
export interface ContractPolicy {
  actions: string[]; // Simplified view for UI
  constraints: any;  // Simplified view for UI
}

export interface ContractHistoryItem {
  version: number;
  proposer: 'Me' | 'Counterparty';
  timestamp: string;
  comment: string;
  policySnapshot: ContractPolicy; // Keeping simplified for Negotiation View compatibility
}

export interface Contract {
  id: string;
  name: string;
  description?: string; // Added description
  role: 'Provider' | 'Consumer'; // Added role
  productId: string;
  productName: string;
  counterpartyName: string;
  counterpartyDid: string;
  signatorySpecifiedPointId: string;
  status: ContractStatus;
  signMode: SignMode;
  lastUpdated: string;
  version: number;
  myPolicy: ContractPolicy;
  counterpartyPolicy?: ContractPolicy;
  history: ContractHistoryItem[];
  executionStats?: {
    totalCalls: number;
    remainingCalls: number;
    lastCallTime: string;
  };
  signature?: {
    hash: string;
    signerDid: string;
    timestamp: string;
  };
}

export interface ApiParameter {
  name: string;
  type: 'String' | 'Number' | 'Boolean' | 'JSON';
  location: 'Query' | 'Header' | 'Body' | 'Path';
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export interface DataSchemaItem {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
}

export interface DataAsset {
  id: string;
  name: string;
  description: string;
  type: 'Database' | 'API' | 'File';
  owner: string;
  status: 'Active' | 'Inactive' | 'Deprecated';
  createdAt: string;
  lastVerified: string;
  connectionConfig: any;
  schema?: DataSchemaItem[];
}

export interface LogEntry {
  id: string;
  time: string;
  user: string;
  action: string;
  target: string;
  status: 'Success' | 'Failure' | 'Warning';
}