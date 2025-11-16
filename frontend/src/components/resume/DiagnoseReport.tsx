import React, { useEffect, useMemo, useState } from 'react';
import type { DiagnoseResponse } from '../../types/resume';
import DOMPurify from 'dompurify';

interface Props {
  data?: DiagnoseResponse;
}

const tabs: Array<DiagnoseResponse['sections'][number]['name'] | '建议'> = ['结构', '关键词', '量化', '措辞', '风险', '建议'];

const DiagnoseReport: React.FC<Props> = ({ data }) => {
  const [active, setActive] = useState<(typeof tabs)[number]>('结构');

  // 当数据更新时，自动切到第一个有内容的分组，避免一直显示“暂无数据”
  useEffect(() => {
    if (data?.sections && data.sections.length > 0) {
      const withItems = data.sections.find(s => (s.items?.length || 0) > 0);
      if (withItems && withItems.name !== active) {
        setActive(withItems.name);
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
      case '结构':
        return '结构良好，暂无调整建议';
      case '关键词':
        return '技能与证据匹配度良好';
      case '量化':
        return '量化表达到位';
      case '措辞':
        return '措辞清晰、可读性良好';
      case '风险':
        return '未发现明显风险';
      case '建议':
        return '当前版本表现良好，无需额外建议';
      default:
        return '当前项表现良好';
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
      {active !== '建议' ? (
        <div className='space-y-3'>
          {!section || section.items.length === 0 ? (
            <div className='text-gray-500 text-sm'>{getEmptyText(active)}</div>
          ) : (
            section.items.map((it, idx) => (
              <div key={idx} className='border rounded-xl p-4'>
                <div className='font-medium mb-1'>问题：{it.issue}</div>
                {it.fix ? <div className='text-sm text-gray-700'>修复：{it.fix}</div> : null}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className='prose max-w-none' dangerouslySetInnerHTML={{ __html: sanitized || '<p class="text-gray-500 text-sm">当前版本表现良好，无需额外建议</p>' }} />
      )}
    </div>
  );
};

export default DiagnoseReport;


