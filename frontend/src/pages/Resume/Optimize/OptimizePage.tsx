import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Awaited<ReturnType<typeof diagnose>> | null>(null);
  const [revisionHtml, setRevisionHtml] = useState<string>('');
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [savedHint, setSavedHint] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null); // 清除之前的错误
    try {
      const r = await diagnose({ text: t });
      setReport(r);
      // 直接生成修订版预览（无需再点按钮）
      console.log('诊断结果:', r);
      console.log('修订版HTML:', r?.html);
      if (r?.html) {
        setRevisionHtml(r.html);
        console.log('已设置修订版HTML，长度:', r.html.length);
      } else {
        console.warn('诊断结果中没有html字段');
        // 如果诊断完成但没有html，尝试从report.html获取
        if (report?.html) {
          setRevisionHtml(report.html);
        }
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
      } catch (err) {
        // ignore localStorage 失败，不影响主要功能
        console.warn('保存历史记录失败:', err);
      }
    } catch (err: unknown) {
      // 显示友好的错误信息
      const errorMessage = err instanceof Error ? err.message : '诊断失败，请稍后重试';
      setError(errorMessage);
      console.error('简历诊断失败:', err);
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
      <main className='flex-1 max-w-7xl mx-auto px-4 py-8'>
        <div className='space-y-6'>
          {/* 标题和上传区域 */}
          <div>
            <div className='text-xl font-semibold mb-3'>上传简历 → 解析 → 诊断报告</div>
            <UploadBox onParsed={onParsed} />
          </div>

          {/* 加载状态和错误提示 - 紧跟在上传区域后面 */}
          {loading ? (
            <div className='flex items-center gap-2 text-sm text-gray-500'>
              <span className='inline-block h-3 w-3 rounded-full bg-blue-500 animate-pulse' />
              <span className='inline-block h-3 w-3 rounded-full bg-blue-400 animate-pulse delay-150' />
              <span className='inline-block h-3 w-3 rounded-full bg-blue-300 animate-pulse delay-300' />
              <span>正在诊断与生成建议，请稍候…</span>
            </div>
          ) : null}
          {error ? (
            <div className='inline-flex items-center space-x-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className='ml-2 text-red-400 hover:text-red-600'
                aria-label='关闭错误提示'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
          ) : null}

          {/* 诊断报告和修订版预览 - 紧跟在上传区域后面 */}
          {report ? (
            <div className='space-y-6'>
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

              {/* 操作按钮 */}
              <div className='flex gap-3 items-center flex-wrap'>
                <button className='px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors' onClick={onGenerateRevision}>
                  生成修订版
                </button>
                <button className='px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors' onClick={onExport} disabled={!sanitized}>
                  导出 PDF
                </button>
                <button
                  className='px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2'
                  onClick={() => navigate('/dashboard')}
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  查看历史记录
                </button>
                {savedHint ? <span className='text-xs text-emerald-600 self-center'>已保存到历史</span> : null}
              </div>

              {/* 修订版预览 */}
              {sanitized ? (
                <div className='border rounded-2xl shadow-lg p-6'>
                  <div className='text-lg font-semibold text-gray-900 mb-4'>修订版预览</div>
                  <div className='prose max-w-none' dangerouslySetInnerHTML={{ __html: sanitized }} />
                </div>
              ) : (
                <div className='border rounded-2xl shadow-lg p-6 bg-gray-50'>
                  <div className='text-lg font-semibold text-gray-900 mb-2'>修订版预览</div>
                  <div className='text-sm text-gray-500'>
                    点击&ldquo;生成修订版&rdquo;按钮查看优化后的简历内容
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* 产品价值展示区域 - 始终显示 */}
          <div className='space-y-6'>
            {/* 产品价值主张区域 */}
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100'>
              <div className='text-center mb-4'>
                <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                  🚀 让AI为你的求职之路助力
                </h3>
                <p className='text-gray-600 text-lg'>
                  智能简历解析 + 个性化打招呼语 = 更高的面试命中率
                </p>
              </div>

              {/* 核心价值点 */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6'>
                <div className='bg-white rounded-lg p-4 shadow-sm border border-gray-100'>
                  <div className='text-2xl mb-2'>🎯</div>
                  <h4 className='font-semibold text-gray-900 mb-1'>智能匹配</h4>
                  <p className='text-sm text-gray-600'>
                    AI深度分析职位要求与简历，精准计算匹配度
                  </p>
                </div>
                <div className='bg-white rounded-lg p-4 shadow-sm border border-gray-100'>
                  <div className='text-2xl mb-2'>✨</div>
                  <h4 className='font-semibold text-gray-900 mb-1'>个性化优化</h4>
                  <p className='text-sm text-gray-600'>
                    基于目标岗位自动生成个性化打招呼语
                  </p>
                </div>
                <div className='bg-white rounded-lg p-4 shadow-sm border border-gray-100'>
                  <div className='text-2xl mb-2'>⚡</div>
                  <h4 className='font-semibold text-gray-900 mb-1'>效率提升</h4>
                  <p className='text-sm text-gray-600'>
                    自动化投递流程，节省90%的重复操作时间
                  </p>
                </div>
              </div>
            </div>

            {/* 优化原则和效果展示 */}
            <div className='bg-white rounded-2xl p-6 border border-gray-200 shadow-sm'>
              <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                <span className='text-blue-600 mr-2'>💡</span>
                我们的优化原则
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-start space-x-3'>
                  <div className='flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                    <span className='text-blue-600 font-bold text-sm'>1</span>
                  </div>
                  <div>
                    <h5 className='font-medium text-gray-900 mb-1'>关键词智能提取</h5>
                    <p className='text-sm text-gray-600'>
                      自动识别简历中的核心技能、工作经验和项目亮点，确保关键信息不遗漏
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                    <span className='text-green-600 font-bold text-sm'>2</span>
                  </div>
                  <div>
                    <h5 className='font-medium text-gray-900 mb-1'>匹配度精准计算</h5>
                    <p className='text-sm text-gray-600'>
                      多维度分析技能、经验、背景匹配度，只推荐真正适合你的岗位
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center'>
                    <span className='text-purple-600 font-bold text-sm'>3</span>
                  </div>
                  <div>
                    <h5 className='font-medium text-gray-900 mb-1'>个性化打招呼语</h5>
                    <p className='text-sm text-gray-600'>
                      基于简历亮点和岗位要求，生成自然、专业、有吸引力的开场白
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center'>
                    <span className='text-orange-600 font-bold text-sm'>4</span>
                  </div>
                  <div>
                    <h5 className='font-medium text-gray-900 mb-1'>持续学习优化</h5>
                    <p className='text-sm text-gray-600'>
                      AI不断学习HR反馈模式，持续优化匹配算法和打招呼语质量
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 客户利益点 */}
            <div className='bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100'>
              <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                <span className='text-green-600 mr-2'>🎁</span>
                使用我们的产品，你将获得
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div className='flex items-center space-x-3 bg-white rounded-lg p-3 shadow-sm'>
                  <div className='text-green-600 text-xl'>✓</div>
                  <span className='text-sm text-gray-700'>
                    <strong>HR回复率提升2-3倍</strong> - 个性化打招呼语更吸引HR注意
                  </span>
                </div>
                <div className='flex items-center space-x-3 bg-white rounded-lg p-3 shadow-sm'>
                  <div className='text-green-600 text-xl'>✓</div>
                  <span className='text-sm text-gray-700'>
                    <strong>投递效率提升10倍</strong> - 自动化流程，告别重复操作
                  </span>
                </div>
                <div className='flex items-center space-x-3 bg-white rounded-lg p-3 shadow-sm'>
                  <div className='text-green-600 text-xl'>✓</div>
                  <span className='text-sm text-gray-700'>
                    <strong>面试机会增加50%+</strong> - 精准匹配，只投递适合的岗位
                  </span>
                </div>
                <div className='flex items-center space-x-3 bg-white rounded-lg p-3 shadow-sm'>
                  <div className='text-green-600 text-xl'>✓</div>
                  <span className='text-sm text-gray-700'>
                    <strong>求职周期缩短30%</strong> - 更快找到心仪工作
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OptimizePage;


