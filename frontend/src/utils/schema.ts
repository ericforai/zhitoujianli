/**
 * JSON Schema 与 persona 规则（最小可用）
 * DynamicForm 将基于此进行动态渲染与校验
 */
import type { Persona, ResumeInput } from '../types/resume';

export const BASE_SCHEMA: Record<string, unknown> = {
  title: 'ResumeInput',
  type: 'object',
  required: [
    'persona',
    'targetRole',
    'name',
    'email',
    'skills',
    'experiences',
    'projects',
    'education',
  ],
  properties: {
    persona: {
      type: 'string',
      enum: ['graduate', 'no_experience', 'experienced', 'freelancer'],
    },
    targetRole: { type: 'string', minLength: 2, title: '目标职位' },
    targetIndustry: { type: 'string', title: '目标行业' },
    jdText: { type: 'string', title: '职位JD文本' },
    name: { type: 'string', minLength: 2, title: '姓名' },
    title: { type: 'string', title: '头衔' },
    phone: { type: 'string', title: '电话' },
    email: { type: 'string', format: 'email', title: '邮箱' },
    city: { type: 'string', title: '城市' },
    website: { type: 'string', title: '个人网站' },
    linkedin: { type: 'string', title: 'LinkedIn' },
    github: { type: 'string', title: 'GitHub' },
    summary: { type: 'string', title: '个人简介' },
    skills: {
      type: 'array',
      title: '技能',
      items: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', title: '技能名称' },
          level: {
            type: 'string',
            enum: ['basic', 'intermediate', 'advanced'],
            title: '熟练度',
          },
        },
      },
      minItems: 1,
    },
    experiences: {
      type: 'array',
      title: '工作经历',
      items: {
        type: 'object',
        required: ['company', 'role', 'start', 'bullets'],
        properties: {
          company: { type: 'string', title: '公司' },
          role: { type: 'string', title: '职位' },
          location: { type: 'string', title: '地点' },
          start: { type: 'string', title: '开始时间' },
          end: { type: 'string', title: '结束时间' },
          isCurrent: { type: 'boolean', title: '当前在任' },
          bullets: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            title: '要点',
          },
          techStack: {
            type: 'array',
            items: { type: 'string' },
            title: '技术栈',
          },
        },
      },
      minItems: 1,
    },
    projects: {
      type: 'array',
      title: '项目经历',
      items: {
        type: 'object',
        required: ['name', 'bullets'],
        properties: {
          name: { type: 'string', title: '项目名' },
          role: { type: 'string', title: '职责' },
          link: { type: 'string', title: '链接' },
          start: { type: 'string', title: '开始' },
          end: { type: 'string', title: '结束' },
          bullets: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            title: '要点',
          },
          techStack: {
            type: 'array',
            items: { type: 'string' },
            title: '技术栈',
          },
        },
      },
      minItems: 0,
    },
    education: {
      type: 'array',
      title: '教育经历',
      items: {
        type: 'object',
        required: ['school'],
        properties: {
          school: { type: 'string', title: '学校' },
          degree: { type: 'string', title: '学位' },
          major: { type: 'string', title: '专业' },
          start: { type: 'string', title: '开始' },
          end: { type: 'string', title: '结束' },
          gpa: { type: 'string', title: 'GPA' },
          courses: { type: 'array', items: { type: 'string' }, title: '课程' },
          awards: { type: 'array', items: { type: 'string' }, title: '奖项' },
        },
      },
      minItems: 0,
    },
    certifications: { type: 'array', items: { type: 'string' }, title: '证书' },
  },
};

export const PERSONA_RULES: Record<
  Persona,
  {
    required: Array<keyof ResumeInput>;
    placeholders: Partial<Record<keyof ResumeInput, string>>;
    fieldOrder: Array<keyof ResumeInput>;
  }
> = {
  graduate: {
    required: [
      'persona',
      'targetRole',
      'name',
      'email',
      'skills',
      'education',
      'experiences',
      'projects',
    ],
    placeholders: { summary: '突出校园经历与实习成果，量化产出' },
    fieldOrder: [
      'persona',
      'targetRole',
      'jdText',
      'name',
      'email',
      'summary',
      'skills',
      'projects',
      'experiences',
      'education',
    ],
  },
  no_experience: {
    required: ['persona', 'targetRole', 'name', 'email', 'skills', 'projects'],
    placeholders: { summary: '无正式工作经验也可突出项目/竞赛/课程' },
    fieldOrder: [
      'persona',
      'targetRole',
      'jdText',
      'name',
      'email',
      'summary',
      'skills',
      'projects',
      'education',
    ],
  },
  experienced: {
    required: [
      'persona',
      'targetRole',
      'name',
      'email',
      'skills',
      'experiences',
    ],
    placeholders: { summary: '强调业绩指标与业务影响（用数字）' },
    fieldOrder: [
      'persona',
      'targetRole',
      'jdText',
      'name',
      'email',
      'summary',
      'skills',
      'experiences',
      'projects',
      'education',
    ],
  },
  freelancer: {
    required: ['persona', 'targetRole', 'name', 'email', 'skills', 'projects'],
    placeholders: { summary: '强调客户案例、交付物与工具栈' },
    fieldOrder: [
      'persona',
      'targetRole',
      'jdText',
      'name',
      'email',
      'summary',
      'skills',
      'projects',
      'experiences',
      'education',
    ],
  },
};
