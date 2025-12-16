import React from 'react';
import type { TemplateType } from '../../types/resumeTemplate';
import type { ResumeTemplateData } from '../../types/resumeTemplate';
import { renderResumeHtml } from '../../data/resumeTemplates';
import '../../styles/resume-print.css';

interface Props {
  templateType: TemplateType;
  data: ResumeTemplateData;
}

const ResumePreview: React.FC<Props> = ({ templateType, data }) => {
  // 过滤空数据
  const filteredData: ResumeTemplateData = {
    ...data,
    education: (data.education || []).filter(edu => edu.school?.trim()),
    skills: (data.skills || [])
      .map(skill => ({
        ...skill,
        items: (skill.items || []).filter(item => item?.trim()),
      }))
      .filter(skill => skill.category?.trim() && skill.items.length > 0),
    experiences: (data.experiences || [])
      .map(exp => ({
        ...exp,
        bullets: (exp.bullets || []).filter(bullet => bullet?.trim()),
      }))
      .filter(exp => exp.company?.trim() && exp.role?.trim()),
    projects: (data.projects || [])
      .map(proj => ({
        ...proj,
        bullets: (proj.bullets || []).filter(bullet => bullet?.trim()),
      }))
      .filter(proj => proj.name?.trim()),
    certifications: (data.certifications || []).filter(cert =>
      cert.name?.trim()
    ),
  };

  const html = renderResumeHtml(templateType, filteredData);

  return (
    <div className='resume-preview-container'>
      <div
        className='resume-preview-content'
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default ResumePreview;
