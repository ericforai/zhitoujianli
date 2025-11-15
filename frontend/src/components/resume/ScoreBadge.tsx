import React from 'react';

interface Props {
  score?: number;
}

const ScoreBadge: React.FC<Props> = ({ score }) => {
  if (score === undefined || score === null) return null;
  const color =
    score >= 85 ? 'bg-green-600' : score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-semibold ${color}`}>
      ATS 分数：{score}
    </span>
  );
};

export default ScoreBadge;


