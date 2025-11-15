import React, { useMemo, useState } from 'react';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import UploadBox from '../../../components/resume/UploadBox';
import DiagnoseReport from '../../../components/resume/DiagnoseReport';
import { diagnose } from '../../../services/ai';
import { exportPdf } from '../../../services/pdf';
import { createVersion, incrementExport } from '../../../services/resumes';
import DOMPurify from 'dompurify';
import ScoreBadge from '../../../components/resume/ScoreBadge';

const OptimizePage: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Awaited<ReturnType<typeof diagnose>> | null>(null);
  const [revisionHtml, setRevisionHtml] = useState<string>('');
  const [historyId, setHistoryId] = useState<string | null>(null);

  const sanitized = useMemo(() => DOMPurify.sanitize(revisionHtml || ''), [revisionHtml]);

  const onParsed = async (t: string) => {
    setText(t);
    setLoading(true);
    try {
      const r = await diagnose({ text: t });
      setReport(r);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const onGenerateRevision = () => {
    if (!report) return;
    setRevisionHtml(report.html);
  };

  const onExport = async () => {
    if (!sanitized) return;
    const res = await exportPdf(sanitized);
    if (!historyId) {
      const created = await createVersion({ type: '优化', score: report?.score, downloadUrl: res.url });
      setHistoryId(created.id);
    } else {
      await incrementExport(historyId, res.url);
    }
    window.open(res.url, '_blank');
  };

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <header>
        <Navigation />
      </header>
      <main className='flex-1 max-w-7xl mx-auto px-4 py-8 space-y-8'>
        <div>
          <div className='text-xl font-semibold mb-3'>上传简历 → 解析 → 诊断报告</div>
          <UploadBox onParsed={onParsed} />
          {loading ? <div className='text-sm text-gray-500 mt-3'>诊断中...</div> : null}
        </div>
        {report ? (
          <>
            <div className='flex items-center justify-between'>
              <div className='text-lg font-semibold'>诊断报告</div>
              <ScoreBadge score={report.score} />
            </div>
            <DiagnoseReport data={report} />
            <div className='flex gap-3'>
              <button className='px-4 py-2 rounded-lg bg-blue-600 text-white' onClick={onGenerateRevision}>
                生成修订版
              </button>
              <button className='px-4 py-2 rounded-lg bg-emerald-600 text-white' onClick={onExport} disabled={!sanitized}>
                导出 PDF
              </button>
            </div>
            {sanitized ? (
              <div className='border rounded-2xl shadow-lg p-6'>
                <div className='text-sm text-gray-600 mb-2'>修订版预览</div>
                <div className='prose max-w-none' dangerouslySetInnerHTML={{ __html: sanitized }} />
              </div>
            ) : null}
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default OptimizePage;


