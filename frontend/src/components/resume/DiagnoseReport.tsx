import React, { useState } from 'react';
import type { DiagnoseResponse } from '../../types/resume';

interface Props {
  data?: DiagnoseResponse;
}

const tabs: Array<DiagnoseResponse['sections'][number]['name']> = ['结构', '关键词', '量化', '措辞', '风险'];

const DiagnoseReport: React.FC<Props> = ({ data }) => {
  const [active, setActive] = useState<(typeof tabs)[number]>('结构');
  const section = data?.sections?.find(s => s.name === active);
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
      <div className='space-y-3'>
        {!section || section.items.length === 0 ? (
          <div className='text-gray-500 text-sm'>暂无数据</div>
        ) : (
          section.items.map((it, idx) => (
            <div key={idx} className='border rounded-xl p-4'>
              <div className='font-medium mb-1'>问题：{it.issue}</div>
              <div className='text-sm text-gray-700'>修复：{it.fix}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiagnoseReport;


