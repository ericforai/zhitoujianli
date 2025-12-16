import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import type { ResumeInput } from '../../types/resume';
import { PERSONA_RULES } from '../../utils/schema';

interface Props {
  persona: ResumeInput['persona'];
  defaultValues?: Partial<ResumeInput>;
  onSubmit: (data: ResumeInput) => void;
}

const DynamicForm: React.FC<Props> = ({ persona, defaultValues, onSubmit }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _rules = PERSONA_RULES[persona];
  const { register, handleSubmit, control, formState } = useForm<ResumeInput>({
    defaultValues: {
      persona,
      targetRole: '',
      name: '',
      email: '',
      skills: [{ name: '' }],
      experiences: [{ company: '', role: '', start: '', bullets: [''] }],
      projects: [{ name: '', bullets: [''] }],
      education: [{ school: '' }],
      ...defaultValues,
    } as ResumeInput,
    mode: 'onBlur',
  });

  const skillsFA = useFieldArray({ control, name: 'skills' });
  const expFA = useFieldArray({ control, name: 'experiences' });
  const projFA = useFieldArray({ control, name: 'projects' });
  const eduFA = useFieldArray({ control, name: 'education' });

  const errorText = (name: keyof typeof formState.errors) => {
    const err = (formState.errors as any)[name];
    if (!err) return null;
    return <div className='text-sm text-red-600 mt-1'>必填项</div>;
  };

  return (
    <form
      className='space-y-6'
      onSubmit={handleSubmit(data => {
        onSubmit({ ...data, persona });
      })}
    >
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium mb-1'>目标职位</label>
          <input
            className='w-full border rounded-lg p-3'
            {...register('targetRole', { required: true })}
          />
          {errorText('targetRole')}
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>
            目标行业（可选）
          </label>
          <input
            className='w-full border rounded-lg p-3'
            {...register('targetIndustry')}
          />
        </div>
      </div>
      <div>
        <label className='block text-sm font-medium mb-1'>
          职位JD文本（可选）
        </label>
        <textarea
          className='w-full border rounded-lg p-3'
          rows={3}
          {...register('jdText')}
        />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium mb-1'>姓名</label>
          <input
            className='w-full border rounded-lg p-3'
            {...register('name', { required: true })}
          />
          {errorText('name')}
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>邮箱</label>
          <input
            className='w-full border rounded-lg p-3'
            type='email'
            {...register('email', { required: true })}
          />
          {errorText('email')}
        </div>
      </div>
      <div>
        <label className='block text-sm font-medium mb-1'>
          个人简介（可选）
        </label>
        <textarea
          className='w-full border rounded-lg p-3'
          rows={3}
          {...register('summary')}
        />
      </div>

      {/* 技能 */}
      <div>
        <div className='flex items-center justify-between mb-2'>
          <label className='text-sm font-medium'>技能</label>
          <button
            type='button'
            className='text-blue-600 text-sm'
            onClick={() => skillsFA.append({ name: '' })}
          >
            + 添加
          </button>
        </div>
        {skillsFA.fields.map((f, idx) => (
          <div key={f.id} className='flex gap-2 mb-2'>
            <input
              className='flex-1 border rounded-lg p-3'
              {...register(`skills.${idx}.name` as const, { required: true })}
              placeholder='技能名称'
            />
            <select
              className='w-40 border rounded-lg p-3'
              {...register(`skills.${idx}.level` as const)}
            >
              <option value=''>熟练度</option>
              <option value='basic'>基础</option>
              <option value='intermediate'>中级</option>
              <option value='advanced'>高级</option>
            </select>
            <button
              type='button'
              className='text-red-600 text-sm'
              onClick={() => skillsFA.remove(idx)}
            >
              删除
            </button>
          </div>
        ))}
      </div>

      {/* 经历 */}
      <div>
        <div className='flex items-center justify-between mb-2'>
          <label className='text-sm font-medium'>工作经历</label>
          <button
            type='button'
            className='text-blue-600 text-sm'
            onClick={() =>
              expFA.append({ company: '', role: '', start: '', bullets: [''] })
            }
          >
            + 添加
          </button>
        </div>
        {expFA.fields.map((f, idx) => (
          <div key={f.id} className='border rounded-xl p-4 space-y-2 mb-3'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
              <input
                className='border rounded-lg p-3'
                placeholder='公司'
                {...register(`experiences.${idx}.company` as const, {
                  required: true,
                })}
              />
              <input
                className='border rounded-lg p-3'
                placeholder='职位'
                {...register(`experiences.${idx}.role` as const, {
                  required: true,
                })}
              />
              <input
                className='border rounded-lg p-3'
                placeholder='开始'
                {...register(`experiences.${idx}.start` as const, {
                  required: true,
                })}
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm text-gray-600'>要点</label>
              <textarea
                className='w-full border rounded-lg p-3'
                rows={2}
                {...register(`experiences.${idx}.bullets.0` as const, {
                  required: true,
                })}
              />
            </div>
            <div className='text-right'>
              <button
                type='button'
                className='text-red-600 text-sm'
                onClick={() => expFA.remove(idx)}
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 项目 */}
      <div>
        <div className='flex items-center justify-between mb-2'>
          <label className='text-sm font-medium'>项目经历</label>
          <button
            type='button'
            className='text-blue-600 text-sm'
            onClick={() => projFA.append({ name: '', bullets: [''] })}
          >
            + 添加
          </button>
        </div>
        {projFA.fields.map((f, idx) => (
          <div key={f.id} className='border rounded-xl p-4 space-y-2 mb-3'>
            <input
              className='border rounded-lg p-3 w-full'
              placeholder='项目名'
              {...register(`projects.${idx}.name` as const, { required: true })}
            />
            <label className='text-sm text-gray-600'>要点</label>
            <textarea
              className='w-full border rounded-lg p-3'
              rows={2}
              {...register(`projects.${idx}.bullets.0` as const, {
                required: true,
              })}
            />
            <div className='text-right'>
              <button
                type='button'
                className='text-red-600 text-sm'
                onClick={() => projFA.remove(idx)}
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 教育 */}
      <div>
        <div className='flex items-center justify-between mb-2'>
          <label className='text-sm font-medium'>教育经历</label>
          <button
            type='button'
            className='text-blue-600 text-sm'
            onClick={() => eduFA.append({ school: '' })}
          >
            + 添加
          </button>
        </div>
        {eduFA.fields.map((f, idx) => (
          <div key={f.id} className='border rounded-xl p-4 space-y-2 mb-3'>
            <input
              className='border rounded-lg p-3 w-full'
              placeholder='学校'
              {...register(`education.${idx}.school` as const, {
                required: true,
              })}
            />
            <div className='text-right'>
              <button
                type='button'
                className='text-red-600 text-sm'
                onClick={() => eduFA.remove(idx)}
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className='pt-2'>
        <button
          type='submit'
          className='px-4 py-2 rounded-lg bg-blue-600 text-white'
        >
          生成预览
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;
