import React from 'react';
import type { Persona } from '../../types/resume';

interface PersonaCardsProps {
  value?: Persona;
  onChange?: (p: Persona) => void;
}

const items: { key: Persona; title: string; desc: string }[] = [
  { key: 'graduate', title: '应届毕业生', desc: '突出校园经历与实习成果' },
  { key: 'no_experience', title: '零经验转岗', desc: '强调项目/课程与潜力' },
  { key: 'experienced', title: '经验丰富', desc: '量化业绩与业务影响' },
  { key: 'freelancer', title: '自由职业者', desc: '展示客户案例与交付' }
];

const PersonaCards: React.FC<PersonaCardsProps> = ({ value, onChange }) => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {items.map(it => {
        const active = value === it.key;
        return (
          <button
            key={it.key}
            type='button'
            onClick={() => onChange?.(it.key)}
            className={`rounded-2xl border p-6 text-left shadow-lg hover:shadow-xl transition ${
              active ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'
            }`}
          >
            <div className='text-lg font-semibold mb-2'>{it.title}</div>
            <div className='text-sm text-gray-600'>{it.desc}</div>
          </button>
        );
      })}
    </div>
  );
};

export default PersonaCards;


