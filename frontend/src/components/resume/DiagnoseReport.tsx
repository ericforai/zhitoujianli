import React, { useEffect, useMemo, useState } from 'react';
import type { DiagnoseResponse } from '../../types/resume';
import DOMPurify from 'dompurify';

interface Props {
  data?: DiagnoseResponse;
}

const tabs: Array<DiagnoseResponse['sections'][number]['name']> = [
  '总体评价',
  '结构分析',
  '内容分析',
  '专业度与可信度',
  'ATS技术分析',
  '可提升点',
  '重写关键段落',
  '最终得分'
];

const DiagnoseReport: React.FC<Props> = ({ data }) => {
  const [active, setActive] = useState<(typeof tabs)[number]>('总体评价');

  // 当数据更新时，自动切到第一个有内容的分组，避免一直显示"暂无数据"
  useEffect(() => {
    if (data?.sections && data.sections.length > 0) {
      // 查找第一个有内容的section（items或content）
      const withContent = data.sections.find(s =>
        (s.items?.length || 0) > 0 ||
        (s.content && (typeof s.content === 'string' ? s.content.trim().length > 0 : Object.keys(s.content).length > 0))
      );
      if (withContent && withContent.name !== active) {
        setActive(withContent.name);
      }
    }
    // 仅在 data 变化时尝试切换
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  const section = data?.sections?.find(s => s.name === active);
  const sanitized = useMemo(() => {
    if (!data?.html) return '';
    return DOMPurify.sanitize(String(data.html));
  }, [data?.html]);
  const getEmptyText = (t: (typeof tabs)[number]) => {
    switch (t) {
      case '总体评价':
        return '正在分析简历总体情况...';
      case '结构分析':
        return '结构良好，暂无调整建议';
      case '内容分析':
        return '内容质量良好';
      case '专业度与可信度':
        return '专业度与可信度良好';
      case 'ATS技术分析':
        return 'ATS兼容性良好';
      case '可提升点':
        return '当前版本表现良好，暂无额外建议';
      case '重写关键段落':
        return '暂无重写内容';
      case '最终得分':
        return '评分加载中...';
      default:
        return '正在分析...';
    }
  };
  return (
    <div className='border rounded-2xl p-6 shadow-lg'>
      <div className='flex gap-2 mb-4'>
        {tabs.map(t => (
          <button
            type='button'
            key={t}
            onClick={() => setActive(t)}
            className={`px-3 py-1 rounded-full text-sm ${t === active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>
      {active === '重写关键段落' ? (
        <div className='prose max-w-none' dangerouslySetInnerHTML={{ __html: sanitized || '<p class="text-gray-500 text-sm">暂无重写内容</p>' }} />
      ) : active === '最终得分' ? (
        <div className='space-y-4'>
          {section?.content && typeof section.content === 'object' ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {Object.entries(section.content).map(([key, value]) => (
                <div key={key} className='border rounded-xl p-4'>
                  <div className='font-medium mb-2'>{key}</div>
                  <div className='text-2xl font-bold text-blue-600'>{String(value)}</div>
                </div>
              ))}
            </div>
          ) : section?.content ? (
            <div className='text-gray-700'>{String(section.content)}</div>
          ) : (
            <div className='text-gray-500 text-sm'>{getEmptyText(active)}</div>
          )}
        </div>
      ) : (
        <div className='space-y-3'>
          {section?.content && typeof section.content === 'string' ? (
            <div className='text-gray-700 whitespace-pre-wrap'>{section.content}</div>
          ) : section?.content && typeof section.content === 'object' ? (
            <div className='space-y-2'>
              {Object.entries(section.content).map(([key, value]) => (
                <div key={key} className='border rounded-xl p-4'>
                  <div className='font-medium mb-1'>{key}</div>
                  <div className='text-sm text-gray-700'>{String(value)}</div>
                </div>
              ))}
            </div>
          ) : !section || section.items.length === 0 ? (
            <div className='text-gray-500 text-sm'>{getEmptyText(active)}</div>
          ) : (
            section.items.map((it, idx) => (
              <div key={idx} className='border rounded-xl p-4'>
                <div className='font-medium mb-1'>{it.issue}</div>
                {it.fix ? <div className='text-sm text-gray-700 mt-1'>{it.fix}</div> : null}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DiagnoseReport;


