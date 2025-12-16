/**
 * 简历模块类型定义
 * 说明：严格按照需求提供的类型声明，供表单、服务与页面使用
 */

export type Persona =
  | 'graduate'
  | 'no_experience'
  | 'experienced'
  | 'freelancer';

export interface ResumeInput {
  persona: Persona;
  targetRole: string;
  targetIndustry?: string;
  jdText?: string;
  name: string;
  title?: string;
  phone?: string;
  email: string;
  city?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  skills: { name: string; level?: 'basic' | 'intermediate' | 'advanced' }[];
  experiences: {
    company: string;
    role: string;
    location?: string;
    start: string;
    end?: string;
    isCurrent?: boolean;
    bullets: string[];
    techStack?: string[];
  }[];
  projects: {
    name: string;
    role?: string;
    link?: string;
    start?: string;
    end?: string;
    bullets: string[];
    techStack?: string[];
  }[];
  education: {
    school: string;
    degree?: string;
    major?: string;
    start?: string;
    end?: string;
    gpa?: string;
    courses?: string[];
    awards?: string[];
  }[];
  certifications?: string[];
}

export interface GenerateResponse {
  summary: string;
  skills: { name: string; level?: string }[];
  experiences: { bullets: string[] }[];
  projects: { bullets: string[] }[];
  atsKeywords: string[];
  html: string; // 渲染后的 ATS 友好 HTML
  score: number; // 0-100
}

export interface DiagnoseResponse {
  sections: Array<{
    name:
      | '总体评价'
      | '结构分析'
      | '内容分析'
      | '专业度与可信度'
      | 'ATS技术分析'
      | '可提升点'
      | '重写关键段落'
      | '最终得分';
    items: Array<{ issue: string; fix: string }>;
    content?: string | object; // 用于存储分析内容（可能是字符串或对象）
  }>;
  /** 诊断服务耗时（毫秒） */
  tookMs?: number;
  /** 后端生成的请求ID，用于问题排查与关联日志 */
  requestId?: string;
  rewritten: {
    summary?: string;
    experiences?: Array<{ role: string; company?: string; bullets: string[] }>;
    skills?: string[];
  };
  /** 综合分数（0-100），从scorecard计算得出 */
  score: number;
  keywords: string[];
  /** 重写关键段落内容（HTML格式） */
  html: string;
}
