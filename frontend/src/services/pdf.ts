/**
 * PDF 和 Word 导出服务
 * - 不在后端保存用户简历，使用前端Blob方式
 * - PDF：创建可打印的HTML页面，用户可通过浏览器"打印"→"另存为PDF"保存
 * - Word：使用docx库生成Word文档
 */

import { renderResumeHtml } from '../data/resumeTemplates';
import type { TemplateType } from '../types/resumeTemplate';
import type { ResumeTemplateData } from '../types/resumeTemplate';

// 动态导入docx和file-saver（如果可用）
let docxModule: any = null;
let fileSaverModule: any = null;

async function loadDocx() {
  if (!docxModule) {
    try {
      docxModule = await import('docx');
    } catch (error) {
      console.warn('docx库未安装，Word导出功能不可用');
    }
  }
  return docxModule;
}

async function loadFileSaver() {
  if (!fileSaverModule) {
    try {
      fileSaverModule = await import('file-saver');
    } catch (error) {
      console.warn('file-saver库未安装，文件保存功能不可用');
    }
  }
  return fileSaverModule;
}

/**
 * 导出PDF（从HTML字符串）
 * @param html HTML内容
 * @param filename 文件名（可选）
 * @returns 包含URL的对象（兼容旧代码）
 */
export async function exportPdf(html: string, filename?: string): Promise<{ url: string }>;
/**
 * 导出PDF（从模板数据）
 * @param templateType 模板类型
 * @param data 简历数据
 * @param filename 文件名（可选）
 */
export async function exportPdf(
  templateType: TemplateType,
  data: ResumeTemplateData,
  filename?: string
): Promise<void>;
/**
 * 导出PDF实现
 */
export async function exportPdf(
  htmlOrTemplateType: string | TemplateType,
  dataOrFilename?: ResumeTemplateData | string,
  filename?: string
): Promise<{ url: string } | void> {
  // 判断是旧调用方式（第一个参数是字符串）还是新调用方式
  let html: string;
  let finalFilename: string;

  if (typeof htmlOrTemplateType === 'string') {
    // 旧调用方式：exportPdf(html, filename?)
    html = htmlOrTemplateType;
    finalFilename = (dataOrFilename as string) || 'resume.pdf';
  } else {
    // 新调用方式：exportPdf(templateType, data, filename?)
    const templateType = htmlOrTemplateType as TemplateType;
    const data = dataOrFilename as ResumeTemplateData;
    finalFilename = filename || 'resume.pdf';
    html = renderResumeHtml(templateType, data);
  }

  // 创建包含完整HTML的可打印页面
  const printable = `<!doctype html><html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${finalFilename}</title>
<style>
  @page {
    size: A4;
    margin: 15mm;
  }
  body {
    font-family: -apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei','Helvetica Neue',Helvetica,Arial,sans-serif;
    color: #333;
    margin: 0;
    padding: 0;
    background: white;
  }
  .resume-container {
    max-width: 210mm;
    margin: 0 auto;
    padding: 15mm;
    background: white;
  }
  .resume-header {
    border-bottom: 2px solid #333;
    padding-bottom: 15px;
    margin-bottom: 20px;
  }
  .resume-name {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 10px 0;
    color: #1a1a1a;
  }
  .resume-contact {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    font-size: 13px;
    color: #666;
  }
  .resume-section {
    margin-bottom: 25px;
    page-break-inside: avoid;
  }
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #e0e0e0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .education-item {
    margin-bottom: 15px;
    padding-left: 10px;
    line-height: 1.8;
  }
  .skills-list, .certifications-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .skills-list li, .certifications-list li {
    margin-bottom: 8px;
    padding-left: 0;
    line-height: 1.6;
  }
  .skills-list li::before, .certifications-list li::before {
    content: '• ';
    color: #333;
    font-weight: bold;
    margin-right: 5px;
  }
  .experience-item, .project-item {
    margin-bottom: 20px;
    page-break-inside: avoid;
  }
  .experience-header, .project-header {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #1a1a1a;
  }
  .experience-bullets, .project-bullets {
    list-style: none;
    padding: 0;
    margin: 8px 0 0 0;
  }
  .experience-bullets li, .project-bullets li {
    margin-bottom: 6px;
    padding-left: 20px;
    position: relative;
    line-height: 1.6;
  }
  .experience-bullets li::before, .project-bullets li::before {
    content: '- ';
    position: absolute;
    left: 0;
    color: #666;
  }
  @media print {
    body {
      padding: 0;
    }
    .resume-container {
      padding: 15mm;
    }
  }
</style>
</head><body>
${html}
<div style="position: fixed; bottom: 20px; right: 20px; background: #f0f0f0; padding: 12px 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 14px; color: #333;">
  <div style="font-weight: 600; margin-bottom: 8px;">💡 如何保存为PDF：</div>
  <div style="line-height: 1.6;">
    <div>1. 按 <kbd style="background: #fff; padding: 2px 6px; border-radius: 3px; border: 1px solid #ccc;">Ctrl+P</kbd> (Windows/Linux) 或 <kbd style="background: #fff; padding: 2px 6px; border-radius: 3px; border: 1px solid #ccc;">Cmd+P</kbd> (Mac)</div>
    <div>2. 选择"另存为PDF"或"Save as PDF"</div>
    <div>3. 点击"保存"</div>
  </div>
</div>
</body></html>`;

  // 创建Blob URL，不在后端保存
  const blob = new Blob([printable], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  // 如果是旧调用方式，返回URL对象（兼容旧代码，不自动打开窗口）
  if (typeof htmlOrTemplateType === 'string') {
    return { url };
  }

  // 新调用方式：自动打开打印窗口
  const printWindow = window.open(url, '_blank');
  if (!printWindow) {
    alert('无法打开打印窗口，请检查浏览器弹窗设置');
  }
}

/**
 * 导出Word文档
 * @param templateType 模板类型
 * @param data 简历数据
 * @param filename 文件名（可选）
 */
export async function exportWord(
  templateType: TemplateType,
  data: ResumeTemplateData,
  filename = 'resume.docx'
): Promise<void> {
  const docx = await loadDocx();
  const fileSaver = await loadFileSaver();

  if (!docx || !fileSaver) {
    alert('Word导出功能需要安装docx和file-saver库，请先安装：npm install docx file-saver');
    return;
  }

  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

  // 创建文档段落
  const children: any[] = [];

  // 标题（姓名）
  children.push(
    new Paragraph({
      text: data.name || '姓名',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
    })
  );

  // 联系信息
  const contactInfo: string[] = [];
  if (data.email) contactInfo.push(`邮箱：${data.email}`);
  if (data.phone) contactInfo.push(`电话：${data.phone}`);
  if (data.linkedin) contactInfo.push(`LinkedIn：${data.linkedin}`);
  if (data.github) contactInfo.push(`GitHub：${data.github}`);
  if (data.portfolio) contactInfo.push(`作品集/公众号：${data.portfolio}`);

  if (contactInfo.length > 0) {
    children.push(
      new Paragraph({
        text: contactInfo.join('    '),
        spacing: { after: 400 },
      })
    );
  }

  // 教育背景
  if (data.education && data.education.length > 0) {
    children.push(
      new Paragraph({
        text: '教育背景',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    data.education.forEach((edu) => {
      if (edu.school) {
        let eduText = edu.school;
        if (edu.location) eduText += `，${edu.location}`;
        if (edu.degree) {
          eduText += `\n${edu.degree}`;
          if (edu.major) eduText += `：${edu.major}`;
        }
        if (edu.gpa) eduText += ` | GPA：${edu.gpa}`;
        if (edu.startDate || edu.endDate) {
          eduText += `\n起止时间：${edu.startDate || ''} – ${edu.endDate || ''}`;
        }
        children.push(
          new Paragraph({
            text: eduText,
            spacing: { after: 200 },
          })
        );
      }
    });
  }

  // 技能概览
  if (data.skills && data.skills.length > 0) {
    children.push(
      new Paragraph({
        text: '技能概览',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    data.skills.forEach((skillGroup) => {
      if (skillGroup.category && skillGroup.items && skillGroup.items.length > 0) {
        const skillText = `${skillGroup.category}：${skillGroup.items.filter((s) => s.trim()).join('、')}`;
        children.push(
          new Paragraph({
            text: skillText,
            spacing: { after: 100 },
          })
        );
      }
    });
  }

  // 工作经历
  if (data.experiences && data.experiences.length > 0) {
    children.push(
      new Paragraph({
        text: '工作经历',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    data.experiences.forEach((exp) => {
      if (exp.company && exp.role) {
        const timeRange = exp.endDate ? `${exp.startDate} – ${exp.endDate}` : exp.startDate;
        children.push(
          new Paragraph({
            text: `${exp.role} | ${exp.company} | 起止时间：${timeRange}`,
            spacing: { after: 100 },
          })
        );

        if (exp.bullets && exp.bullets.length > 0) {
          exp.bullets.forEach((bullet) => {
            if (bullet.trim()) {
              children.push(
                new Paragraph({
                  text: `- ${bullet}`,
                  spacing: { after: 50 },
                  indent: { left: 400 },
                })
              );
            }
          });
        }
      }
    });
  }

  // 项目经验
  if (data.projects && data.projects.length > 0) {
    children.push(
      new Paragraph({
        text: '项目经验',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    data.projects.forEach((proj) => {
      if (proj.name) {
        const timeRange = proj.startDate || proj.endDate ? `起止时间：${proj.startDate || ''} – ${proj.endDate || ''}` : '';
        children.push(
          new Paragraph({
            text: `${proj.name}${timeRange ? ` | ${timeRange}` : ''}`,
            spacing: { after: 100 },
          })
        );

        if (proj.bullets && proj.bullets.length > 0) {
          proj.bullets.forEach((bullet) => {
            if (bullet.trim()) {
              children.push(
                new Paragraph({
                  text: `- ${bullet}`,
                  spacing: { after: 50 },
                  indent: { left: 400 },
                })
              );
            }
          });
        }
      }
    });
  }

  // 证书
  if (data.certifications && data.certifications.length > 0) {
    children.push(
      new Paragraph({
        text: '证书',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    data.certifications.forEach((cert) => {
      if (cert.name) {
        let certText = cert.name;
        if (cert.issuer) certText += ` — ${cert.issuer}`;
        if (cert.date) certText += ` | 日期：${cert.date}`;
        children.push(
          new Paragraph({
            text: certText,
            spacing: { after: 100 },
          })
        );
      }
    });
  }

  // 创建文档
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  // 生成并下载
  const blob = await Packer.toBlob(doc);
  fileSaver.saveAs(blob, filename);
}
