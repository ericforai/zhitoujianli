import React, { useEffect, useMemo, useState } from 'react';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import ScoreBadge from '../../../components/resume/ScoreBadge';
import { getFormData, setLatestResult } from '../../../store/resumeSlice';
import { generate } from '../../../services/ai';
import DOMPurify from 'dompurify';
import { exportPdf } from '../../../services/pdf';
import { createVersion, incrementExport } from '../../../services/resumes';

const TemplatesPreview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState<string>('');
  const [score, setScore] = useState<number | undefined>(undefined);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [historyId, setHistoryId] = useState<string | null>(null);

  useEffect(() => {
    const form = getFormData();
    if (!form) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const res = await generate(form);
        setHtml(res.html);
        setScore(res.score);
        setKeywords(res.atsKeywords || []);
        setLatestResult({
          html: res.html,
          score: res.score,
          keywords: res.atsKeywords,
        });
        const created = await createVersion({
          type: '模板',
          score: res.score,
          meta: { persona: form.persona },
        });
        setHistoryId(created.id);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sanitized = useMemo(() => {
    return DOMPurify.sanitize(
      html || '<div class="text-gray-500">暂无预览</div>'
    );
  }, [html]);

  const handleExport = async () => {
    const res = await exportPdf(sanitized);
    if (historyId) {
      await incrementExport(historyId, res.url);
    }
    window.open(res.url, '_blank');
  };

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <header>
        <Navigation />
      </header>
      <main className='flex-1 max-w-7xl mx-auto px-4 py-8 pt-16 space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='text-xl font-semibold'>AI 生成预览</div>
          <div className='flex items-center gap-3'>
            <ScoreBadge score={score} />
            <button
              onClick={handleExport}
              className='px-4 py-2 rounded-lg bg-emerald-600 text-white'
            >
              导出 PDF
            </button>
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          {keywords.map(k => (
            <span
              key={k}
              className='px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs'
            >
              {k}
            </span>
          ))}
        </div>
        <div className='border rounded-2xl shadow-lg p-6'>
          {loading ? (
            <div className='animate-pulse space-y-3'>
              <div className='h-6 bg-gray-200 rounded w-1/3' />
              <div className='h-4 bg-gray-200 rounded' />
              <div className='h-4 bg-gray-200 rounded w-5/6' />
              <div className='h-4 bg-gray-200 rounded w-2/3' />
            </div>
          ) : (
            <div
              className='prose max-w-none'
              dangerouslySetInnerHTML={{ __html: sanitized }}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TemplatesPreview;
