/**
 * 投递配置相关类型定义
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */

/**
 * 投递策略配置
 */
export interface DeliveryStrategy {
  useSmartGreeting: boolean;
  greetingType: 'default' | 'custom' | 'ai';
}

/**
 * 黑名单配置
 */
export interface BlacklistConfig {
  companies: string[];
  jobs: string[];
}

/**
 * 投递配置
 */
export interface DeliveryConfig {
  maxJobsPerDay: number;
  blacklist: BlacklistConfig;
  deliveryStrategy: DeliveryStrategy;
}

/**
 * AI服务提供商
 */
export type AiProvider = 'deepseek' | 'openai' | 'ollama';

/**
 * AI配置
 */
export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
  temperature: number;
}

/**
 * 简历内容
 */
export interface ResumeContent {
  [key: string]: unknown;
}

/**
 * API响应基础结构
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
