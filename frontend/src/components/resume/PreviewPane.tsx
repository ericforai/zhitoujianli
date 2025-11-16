import React from 'react';
import ScoreBadge from './ScoreBadge';

interface Props {
  loading?: boolean;
  score?: number;
  keywords?: string[];
  pagesEstimate?: number;
}

const PreviewPane: React.FC<Props> = ({ loading, score, keywords = [], pagesEstimate }) => {
  if (loading) {
    return (
      <div className='border rounded-2xl p-6 shadow-lg'>
        <div className='animate-pulse space-y-3'>
          <div className='h-6 bg-gray-200 rounded w-1/3' />
          <div className='h-4 bg-gray-200 rounded' />
          <div className='h-4 bg-gray-200 rounded w-5/6' />
          <div className='h-4 bg-gray-200 rounded w-2/3' />
        </div>
      </div>
    );
  }
  return (
    <div className='border rounded-2xl p-6 shadow-lg space-y-4'>
      <div className='flex items-center gap-3'>
        <ScoreBadge score={score} />
        {pagesEstimate ? <span className='text-sm text-gray-600'>预计页数：{pagesEstimate}</span> : null}
      </div>
      {keywords.length > 0 ? (
        <div>
          <div className='text-sm text-gray-600 mb-2'>关键词建议</div>
          <div className='flex flex-wrap gap-2'>
            {keywords.map(k => (
              <span key={k} className='px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs'>
                {k}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className='text-sm text-gray-400'>关键词建议：填写后生成</div>
      )}
    </div>
  );
};

export default PreviewPane;


