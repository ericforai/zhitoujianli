import React, { useMemo, useState } from 'react';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import PersonaCards from '../../../components/resume/PersonaCards';
import DynamicForm from '../../../components/resume/DynamicForm';
import PreviewPane from '../../../components/resume/PreviewPane';
import { setFormData, setPersona } from '../../../store/resumeSlice';
import type { ResumeInput } from '../../../types/resume';
import { useNavigate } from 'react-router-dom';
import { atsScore } from '../../../utils/ats';

const TemplatesPage: React.FC = () => {
  const [persona, updatePersona] = useState<ResumeInput['persona']>('experienced');
  const [jdKeywords, setJdKeywords] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleSubmit = (data: ResumeInput) => {
    setPersona(data.persona);
    setFormData(data);
    const kw = (data.jdText || '')
      .split(/[\s,，。.;；\n]+/)
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 20);
    setJdKeywords(kw);
    navigate('/resume/templates/preview');
  };

  const estScore = useMemo(() => {
    return atsScore(jdKeywords, '', ([] as string[]), ([] as string[]));
  }, [jdKeywords]);

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <header>
        <Navigation />
      </header>
      <main className='flex-1 max-w-7xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 space-y-6'>
            <div className='space-y-4'>
              <div className='text-xl font-semibold'>选择人群画像</div>
              <PersonaCards value={persona} onChange={p => updatePersona(p)} />
            </div>
            <div className='space-y-4'>
              <div className='text-xl font-semibold'>填写核心信息</div>
              <DynamicForm persona={persona} onSubmit={handleSubmit} />
            </div>
          </div>
          <div className='lg:col-span-1'>
            <PreviewPane loading={false} score={estScore} keywords={jdKeywords} pagesEstimate={1} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TemplatesPage;


