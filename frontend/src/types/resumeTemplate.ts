/**
 * 简历模板类型定义
 */

export type TemplateType = 'general' | 'hr' | 'marketing' | 'operations' | 'finance' | 'sales';

export interface ResumeTemplateData {
  // 基本信息
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string; // 作品集/公众号（市场模板用）

  // 教育背景
  education: Array<{
    school: string;
    degree?: string;
    major?: string;
    location?: string; // 城市，国家
    gpa?: string;
    startDate?: string;
    endDate?: string;
  }>;

  // 技能
  skills: Array<{
    category: string; // 技能类别（如"编程语言"、"HR技能"等）
    items: string[]; // 技能列表
  }>;

  // 工作经历
  experiences: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    bullets: string[]; // 工作要点
  }>;

  // 项目经验
  projects: Array<{
    name: string;
    startDate?: string;
    endDate?: string;
    bullets: string[]; // 项目要点
  }>;

  // 证书
  certifications: Array<{
    name: string;
    issuer?: string; // 颁发机构
    date?: string;
  }>;
}

export interface TemplateConfig {
  type: TemplateType;
  name: string;
  description: string;
  fields: {
    required: string[];
    optional: string[];
  };
}

