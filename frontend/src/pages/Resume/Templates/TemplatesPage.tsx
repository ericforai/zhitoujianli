import React, { useState, useCallback } from 'react';
import Footer from '../../../components/Footer';
import Navigation from '../../../components/Navigation';
import SimpleResumeForm from '../../../components/resume/SimpleResumeForm';
import ResumePreview from '../../../components/resume/ResumePreview';
import { TEMPLATE_CONFIGS } from '../../../data/resumeTemplates';
import type { TemplateType } from '../../../types/resumeTemplate';
import type { ResumeTemplateData } from '../../../types/resumeTemplate';
import { exportWord } from '../../../services/pdf';

const TemplatesPage: React.FC = () => {
  const [templateType, setTemplateType] = useState<TemplateType>('general');
  const [formData, setFormData] = useState<ResumeTemplateData>({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    portfolio: '',
    education: [],
    skills: [],
    experiences: [],
    projects: [],
    certifications: [],
  });

  const handleFormChange = useCallback((data: ResumeTemplateData) => {
    setFormData(data);
  }, []);

  const handleExportWord = async () => {
    if (!formData.name || !formData.email) {
      alert('请先填写姓名和邮箱');
      return;
    }
    await exportWord(templateType, formData);
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <header>
        <Navigation />
      </header>
      <main className='flex-1 max-w-7xl mx-auto px-4 py-8 pt-20 w-full'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>简历模板</h1>
          <p className='text-gray-600'>选择模板类型，填写信息，实时预览并导出</p>
        </div>

        {/* 模板选择器 */}
        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 mb-3'>选择模板类型</label>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'>
            {Object.values(TEMPLATE_CONFIGS).map((config) => (
              <button
                key={config.type}
                type='button'
                onClick={() => setTemplateType(config.type)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  templateType === config.type
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className='font-semibold mb-1'>{config.name}</div>
                <div className='text-xs text-gray-500'>{config.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* 左侧：表单 */}
          <div className='space-y-6'>
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h2 className='text-xl font-semibold mb-4'>填写信息</h2>
              <SimpleResumeForm templateType={templateType} onChange={handleFormChange} />
            </div>
          </div>

          {/* 右侧：预览和导出 */}
          <div className='space-y-6'>
            <div className='bg-white rounded-lg shadow-sm p-6 sticky top-24'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-semibold'>实时预览</h2>
                <button
                  onClick={handleExportWord}
                  className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm'
                >
                  导出 Word
                </button>
              </div>
              <div className='border rounded-lg overflow-hidden'>
                <ResumePreview templateType={templateType} data={formData} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TemplatesPage;
