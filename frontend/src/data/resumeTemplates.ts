/**
 * 简历模板数据
 * 包含6种模板：通用、人力、市场、运营、财务、销售
 */

import type { TemplateConfig, TemplateType } from '../types/resumeTemplate';

export const TEMPLATE_CONFIGS: Record<TemplateType, TemplateConfig> = {
  general: {
    type: 'general',
    name: '通用模板',
    description: '适合大多数岗位的通用简历模板',
    fields: {
      required: ['name', 'email'],
      optional: ['phone', 'linkedin', 'github', 'education', 'skills', 'experiences', 'projects', 'certifications'],
    },
  },
  hr: {
    type: 'hr',
    name: '人力模板',
    description: '适合人力资源、招聘、培训等岗位',
    fields: {
      required: ['name', 'email'],
      optional: ['phone', 'linkedin', 'education', 'skills', 'experiences', 'projects', 'certifications'],
    },
  },
  marketing: {
    type: 'marketing',
    name: '市场模板',
    description: '适合市场营销、品牌、推广等岗位',
    fields: {
      required: ['name', 'email'],
      optional: ['phone', 'linkedin', 'portfolio', 'education', 'skills', 'experiences', 'projects', 'certifications'],
    },
  },
  operations: {
    type: 'operations',
    name: '运营模板',
    description: '适合运营、产品运营、用户运营等岗位',
    fields: {
      required: ['name', 'email'],
      optional: ['phone', 'education', 'skills', 'experiences', 'projects', 'certifications'],
    },
  },
  finance: {
    type: 'finance',
    name: '财务模板',
    description: '适合财务、会计、审计等岗位',
    fields: {
      required: ['name', 'email'],
      optional: ['phone', 'linkedin', 'education', 'skills', 'experiences', 'projects', 'certifications'],
    },
  },
  sales: {
    type: 'sales',
    name: '销售模板',
    description: '适合销售、商务、客户经理等岗位',
    fields: {
      required: ['name', 'email'],
      optional: ['phone', 'linkedin', 'education', 'skills', 'experiences', 'projects', 'certifications'],
    },
  },
};

/**
 * 渲染简历HTML的函数
 * 根据模板类型和填写的数据生成格式化的简历HTML
 */
export function renderResumeHtml(
  templateType: TemplateType,
  data: {
    name: string;
    email: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    education: Array<{
      school: string;
      degree?: string;
      major?: string;
      location?: string;
      gpa?: string;
      startDate?: string;
      endDate?: string;
    }>;
    skills: Array<{
      category: string;
      items: string[];
    }>;
    experiences: Array<{
      company: string;
      role: string;
      startDate: string;
      endDate?: string;
      bullets: string[];
    }>;
    projects: Array<{
      name: string;
      startDate?: string;
      endDate?: string;
      bullets: string[];
    }>;
    certifications: Array<{
      name: string;
      issuer?: string;
      date?: string;
    }>;
  }
): string {
  const { name, email, phone, linkedin, github, portfolio, education, skills, experiences, projects, certifications } = data;

  let html = '<div class="resume-container">';

  // 基本信息
  html += '<div class="resume-header">';
  html += `<h1 class="resume-name">${escapeHtml(name)}</h1>`;
  html += '<div class="resume-contact">';
  html += `<span>邮箱：${escapeHtml(email)}</span>`;
  if (phone) html += `<span>电话：${escapeHtml(phone)}</span>`;
  if (linkedin) html += `<span>LinkedIn：${escapeHtml(linkedin)}</span>`;
  if (github) html += `<span>GitHub：${escapeHtml(github)}</span>`;
  if (portfolio) html += `<span>作品集/公众号：${escapeHtml(portfolio)}</span>`;
  html += '</div>';
  html += '</div>';

  // 教育背景
  if (education && education.length > 0) {
    html += '<div class="resume-section">';
    html += '<h2 class="section-title">教育背景</h2>';
    education.forEach((edu) => {
      html += '<div class="education-item">';
      let eduText = escapeHtml(edu.school);
      if (edu.location) eduText += `，${escapeHtml(edu.location)}`;
      if (edu.degree) eduText += `<br/>${escapeHtml(edu.degree)}`;
      if (edu.major) eduText += `：${escapeHtml(edu.major)}`;
      if (edu.gpa) eduText += ` | GPA：${escapeHtml(edu.gpa)}`;
      if (edu.startDate || edu.endDate) {
        eduText += `<br/>起止时间：${edu.startDate || ''} – ${edu.endDate || ''}`;
      }
      html += `<div>${eduText}</div>`;
      html += '</div>';
    });
    html += '</div>';
  }

  // 技能概览
  if (skills && skills.length > 0) {
    html += '<div class="resume-section">';
    html += '<h2 class="section-title">技能概览</h2>';
    html += '<ul class="skills-list">';
    skills.forEach((skillGroup) => {
      if (skillGroup.items && skillGroup.items.length > 0) {
        html += `<li>${escapeHtml(skillGroup.category)}：${skillGroup.items.map((s) => escapeHtml(s)).join('、')}</li>`;
      }
    });
    html += '</ul>';
    html += '</div>';
  }

  // 工作经历
  if (experiences && experiences.length > 0) {
    html += '<div class="resume-section">';
    html += '<h2 class="section-title">工作经历</h2>';
    experiences.forEach((exp) => {
      html += '<div class="experience-item">';
      const timeRange = exp.endDate ? `${exp.startDate} – ${exp.endDate}` : exp.startDate;
      html += `<div class="experience-header"><strong>${escapeHtml(exp.role)}</strong> | ${escapeHtml(exp.company)} | 起止时间：${escapeHtml(timeRange)}</div>`;
      if (exp.bullets && exp.bullets.length > 0) {
        html += '<ul class="experience-bullets">';
        exp.bullets.forEach((bullet) => {
          if (bullet.trim()) {
            html += `<li>${escapeHtml(bullet)}</li>`;
          }
        });
        html += '</ul>';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  // 项目经验
  if (projects && projects.length > 0) {
    html += '<div class="resume-section">';
    html += '<h2 class="section-title">项目经验</h2>';
    projects.forEach((proj) => {
      html += '<div class="project-item">';
      const timeRange = proj.startDate || proj.endDate ? `起止时间：${proj.startDate || ''} – ${proj.endDate || ''}` : '';
      html += `<div class="project-header"><strong>${escapeHtml(proj.name)}</strong>${timeRange ? ` | ${escapeHtml(timeRange)}` : ''}</div>`;
      if (proj.bullets && proj.bullets.length > 0) {
        html += '<ul class="project-bullets">';
        proj.bullets.forEach((bullet) => {
          if (bullet.trim()) {
            html += `<li>${escapeHtml(bullet)}</li>`;
          }
        });
        html += '</ul>';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  // 证书
  if (certifications && certifications.length > 0) {
    html += '<div class="resume-section">';
    html += '<h2 class="section-title">证书</h2>';
    html += '<ul class="certifications-list">';
    certifications.forEach((cert) => {
      let certText = escapeHtml(cert.name);
      if (cert.issuer) certText += ` — ${escapeHtml(cert.issuer)}`;
      if (cert.date) certText += ` | 日期：${escapeHtml(cert.date)}`;
      html += `<li>${certText}</li>`;
    });
    html += '</ul>';
    html += '</div>';
  }

  html += '</div>';
  return html;
}

/**
 * HTML转义函数
 */
function escapeHtml(text: string): string {
  if (typeof document === 'undefined') {
    // 服务端渲染时使用简单转义
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

