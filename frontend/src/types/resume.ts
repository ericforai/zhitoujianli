/**
 * 简历模块类型定义
 * 说明：严格按照需求提供的类型声明，供表单、服务与页面使用
 */

export type Persona = 'graduate' | 'no_experience' | 'experienced' | 'freelancer';

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
    name: '结构' | '关键词' | '量化' | '措辞' | '风险';
    items: Array<{ issue: string; fix: string }>;
  }>;
  rewritten: {
    summary?: string;
    experiences?: Array<{ role: string; company?: string; bullets: string[] }>;
    skills?: string[];
  };
  score: number;
  keywords: string[];
  html: string;
}


