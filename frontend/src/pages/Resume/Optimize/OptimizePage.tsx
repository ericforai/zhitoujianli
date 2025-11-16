import React, { useEffect, useMemo, useState } from 'react';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import UploadBox from '../../../components/resume/UploadBox';
import DiagnoseReport from '../../../components/resume/DiagnoseReport';
import { diagnose } from '../../../services/ai';
import { exportPdf } from '../../../services/pdf';
import { createVersion, incrementExport, get as getHistory, replaceMeta } from '../../../services/resumes';
import DOMPurify from 'dompurify';
import ScoreBadge from '../../../components/resume/ScoreBadge';
import { useSearchParams } from 'react-router-dom';

const OptimizePage: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Awaited<ReturnType<typeof diagnose>> | null>(null);
  const [revisionHtml, setRevisionHtml] = useState<string>('');
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [savedHint, setSavedHint] = useState<boolean>(false);

  const sanitized = useMemo(() => DOMPurify.sanitize(revisionHtml || ''), [revisionHtml]);

  // 支持从历史记录重放：/resume/optimize?hid=xxx
  useEffect(() => {
    const hid = searchParams.get('hid');
    if (!hid) return;
    (async () => {
      const item = await getHistory(hid);
      if (item?.meta) {
        const meta = item.meta as Record<string, unknown>;
        if (meta.report) {
          setReport(meta.report as any);
        }
        if (meta.html) {
          setRevisionHtml(String(meta.html));
        }
        setHistoryId(hid);
      }
    })();
  }, [searchParams]);

  const onParsed = async (t: string) => {
    setText(t);
    setLoading(true);
    try {
      const r = await diagnose({ text: t });
      setReport(r);
      // 直接生成修订版预览（无需再点按钮）
      if (r?.html) {
        setRevisionHtml(r.html);
      }
      // 诊断完成即写入历史，便于刷新后可见
      try {
        const created = await createVersion({
          type: '优化',
          score: r.score,
          meta: {
            kind: 'diagnose',
            chars: t.length,
            report: r,
            html: r.html,
            requestId: r.requestId,
            tookMs: r.tookMs
          }
        });
        setHistoryId(created.id);
        setSavedHint(true);
      } catch {
        // ignore localStorage 失败
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const onGenerateRevision = () => {
    if (!report) return;
    setRevisionHtml(report.html);
    // 更新历史记录中的 html 字段，便于重放直接展示修订预览
    if (historyId) {
      replaceMeta(historyId, { html: report.html });
    }
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
          {loading ? (
            <div className='flex items-center gap-2 text-sm text-gray-500 mt-3'>
              <span className='inline-block h-3 w-3 rounded-full bg-blue-500 animate-pulse' />
              <span className='inline-block h-3 w-3 rounded-full bg-blue-400 animate-pulse delay-150' />
              <span className='inline-block h-3 w-3 rounded-full bg-blue-300 animate-pulse delay-300' />
              <span>正在诊断与生成建议，请稍候…</span>
            </div>
          ) : null}
        </div>
        {report ? (
          <>
            <div className='flex items-center justify-between'>
              <div className='text-lg font-semibold'>诊断报告</div>
              <div className='flex items-center gap-3'>
                <ScoreBadge score={report.score} />
                {typeof report.tookMs === 'number' ? (
                  <span className='text-xs text-gray-500'>耗时：{report.tookMs}ms</span>
                ) : null}
                {report.requestId ? (
                  <span className='text-xs text-gray-400'>请求ID：{report.requestId}</span>
                ) : null}
              </div>
            </div>
            <DiagnoseReport data={report} />
            <div className='flex gap-3'>
              <button className='px-4 py-2 rounded-lg bg-blue-600 text-white' onClick={onGenerateRevision}>
                生成修订版
              </button>
              <button className='px-4 py-2 rounded-lg bg-emerald-600 text-white' onClick={onExport} disabled={!sanitized}>
                导出 PDF
              </button>
              {savedHint ? <span className='text-xs text-emerald-600 self-center'>已保存到历史</span> : null}
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


