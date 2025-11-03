/**
 * API响应类型定义
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
  requestId?: string;
}

/**
 * 简历信息类型定义
 */
export interface ResumeInfo {
  id: string;
  name: string;
  currentTitle: string;
  yearsExperience: number;
  education: string;
  phone: string;
  email: string;
  skills: string[];
  coreStrengths: string[];
  workExperience: string;
  projects: string[];
  confidence: ConfidenceScore;
  filePath?: string;
  originalText?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * 置信度评分
 */
export interface ConfidenceScore {
  name: number;
  skills: number;
  experience: number;
  overall: number;
}

/**
 * 投递配置类型定义
 */
export interface DeliveryConfig {
  id: string;
  bossConfig: BossConfig;
  deliveryStrategy: DeliveryStrategy;
  greetingConfig: GreetingConfig;
  blacklistConfig: BlacklistConfig;
  createdAt: number;
  updatedAt: number;
}

/**
 * Boss直聘配置
 */
export interface BossConfig {
  keywords: string[];
  cities: string[];
  salaryRange: SalaryRange;
  experienceRequirement: string;
  educationRequirement: string;
  companySize: string[];
  financingStage: string[];
  enableSmartGreeting: boolean;
  defaultGreeting: string;
}

/**
 * 薪资范围
 */
export interface SalaryRange {
  minSalary: number;
  maxSalary: number;
  unit: 'K' | 'W';
}

/**
 * 投递策略配置
 */
export interface DeliveryStrategy {
  deliveryFrequency: number; // 次/小时
  maxDailyDelivery: number;
  deliveryInterval: number; // 秒
  enableAutoDelivery: boolean;
  deliveryTimeRange: TimeRange;
  matchThreshold: number; // 匹配度阈值
}

/**
 * 时间范围
 */
export interface TimeRange {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

/**
 * 打招呼语配置
 */
export interface GreetingConfig {
  enableSmartGreeting: boolean;
  defaultGreeting: string;
  greetingStyle: 'professional' | 'sincere' | 'concise';
  maxLength: number;
  personalizationLevel: 'low' | 'medium' | 'high';
}

/**
 * 黑名单配置
 */
export interface BlacklistConfig {
  companyBlacklist: string[];
  positionBlacklist: string[];
  keywordBlacklist: string[];
  enableBlacklistFilter: boolean;
}

/**
 * 投递记录类型定义
 */
export interface DeliveryRecord {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: DeliveryStatus;
  deliveryTime: number;
  replyTime?: number;
  replyContent?: string;
  greetingContent?: string;
  matchScore?: number;
  platform: 'boss' | 'lagou' | 'liepin' | 'zhilian';
  jobUrl?: string;
  remarks?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * 投递状态枚举
 */
export enum DeliveryStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  REPLIED = 'REPLIED',
  INTERVIEW_INVITED = 'INTERVIEW_INVITED',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
}

/**
 * 投递统计类型定义
 */
export interface DeliveryStatistics {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  hrReplies: number;
  interviewInvitations: number;
  rejections: number;
  deliverySuccessRate: number;
  hrReplyRate: number;
  interviewInvitationRate: number;
  todayDeliveries: number;
  weeklyDeliveries: number;
  monthlyDeliveries: number;
  averageMatchScore: number;
  timeRange: string;
  lastUpdated: number;
}

/**
 * WebSocket消息类型定义
 */
export interface WebSocketMessage {
  type: 'status' | 'progress' | 'record' | 'error' | 'success';
  data: any;
  timestamp: number;
}

/**
 * 投递状态WebSocket消息
 */
export interface DeliveryStatusMessage {
  isRunning: boolean;
  currentJob?: string;
  totalDelivered: number;
  successfulDelivered: number;
  failedDelivered: number;
  lastDeliveryTime?: number;
  nextDeliveryTime?: number;
  timestamp: number;
}

/**
 * 投递进度WebSocket消息
 */
export interface DeliveryProgressMessage {
  totalJobs: number;
  processedJobs: number;
  successfulJobs: number;
  failedJobs: number;
  progressPercentage: number;
  estimatedTimeRemaining: number;
  timestamp: number;
}

/**
 * 投递记录WebSocket消息
 */
export interface DeliveryRecordMessage {
  record: DeliveryRecord;
  timestamp: number;
}

/**
 * 错误消息WebSocket消息
 */
export interface ErrorMessage {
  type: 'error';
  message: string;
  timestamp: number;
}

/**
 * 成功消息WebSocket消息
 */
export interface SuccessMessage {
  type: 'success';
  message: string;
  timestamp: number;
}

/**
 * 文件上传类型定义
 */
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

/**
 * 表单验证错误类型
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * 分页参数类型
 */
export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/**
 * 搜索参数类型
 */
export interface SearchParams {
  keyword?: string;
  status?: DeliveryStatus;
  platform?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 投递记录查询参数
 */
export interface DeliveryRecordQuery extends PaginationParams, SearchParams {}

/**
 * 投递统计查询参数
 */
export interface DeliveryStatisticsQuery {
  timeRange?: 'today' | 'week' | 'month' | 'year' | 'all';
  platform?: string;
  startDate?: string;
  endDate?: string;
}
