import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import type { TemplateType } from '../../types/resumeTemplate';
import type { ResumeTemplateData } from '../../types/resumeTemplate';
import { TEMPLATE_PRESETS } from '../../data/templatePresets';

interface Props {
  templateType: TemplateType;
  defaultValues?: Partial<ResumeTemplateData>;
  onChange: (data: ResumeTemplateData) => void;
}

const SimpleResumeForm: React.FC<Props> = ({ templateType, defaultValues, onChange }) => {
  const preset = TEMPLATE_PRESETS[templateType];

  // 初始化技能类别（如果defaultValues中没有技能数据）
  const initialSkills = defaultValues?.skills && defaultValues.skills.length > 0
    ? defaultValues.skills
    : preset.skillCategories.map((cat) => ({
        category: cat.category,
        items: [''],
      }));

  const { register, handleSubmit, watch, control, formState, getValues, setValue } = useForm<ResumeTemplateData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      portfolio: '',
      education: [{ school: '', degree: '', location: '', gpa: '', startDate: '', endDate: '' }],
      skills: initialSkills,
      experiences: [{ company: '', role: '', startDate: '', endDate: '', bullets: [''] }],
      projects: [{ name: '', startDate: '', endDate: '', bullets: [''] }],
      certifications: [{ name: '', issuer: '', date: '' }],
      ...defaultValues,
    },
    mode: 'onChange',
  });

  // 当模板类型改变时，更新技能类别
  useEffect(() => {
    const newPreset = TEMPLATE_PRESETS[templateType];
    const currentSkills = getValues('skills');

    // 检查当前技能类别是否匹配新模板的预设
    const currentCategories = currentSkills.map((s) => s.category).filter(Boolean);
    const presetCategories = newPreset.skillCategories.map((cat) => cat.category);
    const categoriesMatch =
      currentCategories.length === presetCategories.length &&
      currentCategories.every((cat) => presetCategories.includes(cat));

    // 如果技能类别不匹配新模板，或者用户还没有填写技能项，则更新为新的预设
    if (!categoriesMatch || currentSkills.length === 0) {
      const newSkills = newPreset.skillCategories.map((cat) => ({
        category: cat.category,
        items: [''],
      }));
      setValue('skills', newSkills, { shouldValidate: false });

      // 确保每个技能类别的值被正确设置
      newSkills.forEach((skill, idx) => {
        setValue(`skills.${idx}.category`, skill.category, { shouldValidate: false });
      });
    }
  }, [templateType, setValue, getValues]);

  // 监听表单变化，实时更新预览
  const formData = watch();
  React.useEffect(() => {
    const subscription = watch((data) => {
      onChange(data as ResumeTemplateData);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const educationFA = useFieldArray({ control, name: 'education' });
  const skillsFA = useFieldArray({ control, name: 'skills' });
  const experiencesFA = useFieldArray({ control, name: 'experiences' });
  const projectsFA = useFieldArray({ control, name: 'projects' });
  const certificationsFA = useFieldArray({ control, name: 'certifications' });

  // 技能项数组管理
  const handleAddSkillItem = (skillIndex: number) => {
    const currentSkills = getValues(`skills.${skillIndex}.items`) || [];
    const newItems = [...currentSkills, ''];
    setValue(`skills.${skillIndex}.items`, newItems, { shouldValidate: true });
  };

  const handleRemoveSkillItem = (skillIndex: number, itemIndex: number) => {
    const currentSkills = getValues(`skills.${skillIndex}.items`) || [];
    const newItems = currentSkills.filter((_, idx) => idx !== itemIndex);
    setValue(`skills.${skillIndex}.items`, newItems, { shouldValidate: true });
  };

  // 工作经历要点数组管理
  const handleAddExperienceBullet = (expIndex: number) => {
    const currentBullets = getValues(`experiences.${expIndex}.bullets`) || [];
    const newBullets = [...currentBullets, ''];
    setValue(`experiences.${expIndex}.bullets`, newBullets, { shouldValidate: true });
  };

  const handleRemoveExperienceBullet = (expIndex: number, bulletIndex: number) => {
    const currentBullets = getValues(`experiences.${expIndex}.bullets`) || [];
    const newBullets = currentBullets.filter((_, idx) => idx !== bulletIndex);
    setValue(`experiences.${expIndex}.bullets`, newBullets, { shouldValidate: true });
  };

  // 项目要点数组管理
  const handleAddProjectBullet = (projIndex: number) => {
    const currentBullets = getValues(`projects.${projIndex}.bullets`) || [];
    const newBullets = [...currentBullets, ''];
    setValue(`projects.${projIndex}.bullets`, newBullets, { shouldValidate: true });
  };

  const handleRemoveProjectBullet = (projIndex: number, bulletIndex: number) => {
    const currentBullets = getValues(`projects.${projIndex}.bullets`) || [];
    const newBullets = currentBullets.filter((_, idx) => idx !== bulletIndex);
    setValue(`projects.${projIndex}.bullets`, newBullets, { shouldValidate: true });
  };

  return (
    <form className='space-y-6' onSubmit={handleSubmit(() => {})}>
      {/* 基本信息 */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>基本信息</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>
              姓名 <span className='text-red-500'>*</span>
            </label>
            <input
              className='w-full border rounded-lg p-3'
              {...register('name', { required: true })}
              placeholder='请输入姓名'
            />
            {formState.errors.name && <div className='text-sm text-red-600 mt-1'>必填项</div>}
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>
              邮箱 <span className='text-red-500'>*</span>
            </label>
            <input
              className='w-full border rounded-lg p-3'
              type='email'
              {...register('email', { required: true })}
              placeholder='example@email.com'
            />
            {formState.errors.email && <div className='text-sm text-red-600 mt-1'>必填项</div>}
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>电话</label>
            <input className='w-full border rounded-lg p-3' {...register('phone')} placeholder='请输入电话' />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>LinkedIn</label>
            <input className='w-full border rounded-lg p-3' {...register('linkedin')} placeholder='LinkedIn链接' />
          </div>
        </div>
        {(templateType === 'general' || templateType === 'marketing') && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {templateType === 'general' && (
              <div>
                <label className='block text-sm font-medium mb-1'>GitHub</label>
                <input className='w-full border rounded-lg p-3' {...register('github')} placeholder='GitHub链接' />
              </div>
            )}
            {templateType === 'marketing' && (
              <div>
                <label className='block text-sm font-medium mb-1'>作品集/公众号</label>
                <input className='w-full border rounded-lg p-3' {...register('portfolio')} placeholder='作品集或公众号' />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 教育背景 */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>教育背景</h3>
          <button
            type='button'
            className='text-blue-600 text-sm hover:underline'
            onClick={() => educationFA.append({ school: '', degree: '', location: '', gpa: '', startDate: '', endDate: '' })}
          >
            + 添加
          </button>
        </div>
        {educationFA.fields.map((field, idx) => (
          <div key={field.id} className='border rounded-xl p-4 space-y-3'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm font-medium mb-1'>学校名称</label>
                <input className='w-full border rounded-lg p-2' {...register(`education.${idx}.school`)} placeholder='学校名称' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>城市，国家（可选）</label>
                <input className='w-full border rounded-lg p-2' {...register(`education.${idx}.location`)} placeholder='城市，国家' />
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              <div>
                <label className='block text-sm font-medium mb-1'>学位</label>
                <input className='w-full border rounded-lg p-2' {...register(`education.${idx}.degree`)} placeholder='如：本科、硕士' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>专业（可选）</label>
                <input className='w-full border rounded-lg p-2' {...register(`education.${idx}.major`)} placeholder='专业名称' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>GPA（可选）</label>
                <input className='w-full border rounded-lg p-2' {...register(`education.${idx}.gpa`)} placeholder='如：3.8' />
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm font-medium mb-1'>开始时间</label>
                <input className='w-full border rounded-lg p-2' {...register(`education.${idx}.startDate`)} placeholder='如：2020-09' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>结束时间</label>
                <input className='w-full border rounded-lg p-2' {...register(`education.${idx}.endDate`)} placeholder='如：2024-06' />
              </div>
            </div>
            <div className='text-right'>
              <button type='button' className='text-red-600 text-sm hover:underline' onClick={() => educationFA.remove(idx)}>
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 技能 */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>技能概览</h3>
          <button
            type='button'
            className='text-blue-600 text-sm hover:underline'
            onClick={() => skillsFA.append({ category: '', items: [''] })}
          >
            + 添加技能类别
          </button>
        </div>
        {skillsFA.fields.map((field, idx) => (
          <div key={field.id} className='border rounded-xl p-4 space-y-3'>
            <div>
              <label className='block text-sm font-medium mb-1'>技能类别</label>
              <input
                className='w-full border rounded-lg p-2 bg-gray-50'
                {...register(`skills.${idx}.category`)}
                placeholder={preset.skillCategories[idx]?.placeholder || '技能类别'}
              />
              {preset.skillCategories[idx] && (
                <div className='text-xs text-gray-500 mt-1'>
                  示例：{preset.skillCategories[idx].examples.slice(0, 3).join('、')}...
                </div>
              )}
            </div>
            <div>
              <div className='flex items-center justify-between mb-2'>
                <label className='block text-sm font-medium'>技能项（用逗号分隔或每行一个）</label>
                <button
                  type='button'
                  className='text-blue-600 text-sm hover:underline'
                  onClick={() => handleAddSkillItem(idx)}
                >
                  + 添加
                </button>
              </div>
              {(formData.skills?.[idx]?.items || ['']).map((item, itemIdx) => (
                <div key={itemIdx} className='flex gap-2 mb-2'>
                  <input
                    className='flex-1 border rounded-lg p-2'
                    {...register(`skills.${idx}.items.${itemIdx}`)}
                    placeholder='技能名称'
                  />
                  {(formData.skills?.[idx]?.items || []).length > 1 && (
                    <button
                      type='button'
                      className='text-red-600 text-sm hover:underline'
                      onClick={() => handleRemoveSkillItem(idx, itemIdx)}
                    >
                      删除
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className='text-right'>
              <button type='button' className='text-red-600 text-sm hover:underline' onClick={() => skillsFA.remove(idx)}>
                删除此类别
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 工作经历 */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>工作经历</h3>
          <button
            type='button'
            className='text-blue-600 text-sm hover:underline'
            onClick={() => experiencesFA.append({ company: '', role: '', startDate: '', endDate: '', bullets: [''] })}
          >
            + 添加
          </button>
        </div>
        {experiencesFA.fields.map((field, idx) => (
          <div key={field.id} className='border rounded-xl p-4 space-y-3'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              <div>
                <label className='block text-sm font-medium mb-1'>公司名称</label>
                <input className='w-full border rounded-lg p-2' {...register(`experiences.${idx}.company`)} placeholder='公司名称' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>职位名称</label>
                <input className='w-full border rounded-lg p-2' {...register(`experiences.${idx}.role`)} placeholder='职位名称' />
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <label className='block text-sm font-medium mb-1'>开始时间</label>
                  <input className='w-full border rounded-lg p-2' {...register(`experiences.${idx}.startDate`)} placeholder='如：2020-01' />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>结束时间</label>
                  <input className='w-full border rounded-lg p-2' {...register(`experiences.${idx}.endDate`)} placeholder='如：2024-12' />
                </div>
              </div>
            </div>
            <div>
              <div className='flex items-center justify-between mb-2'>
                <label className='block text-sm font-medium'>工作要点</label>
                <button
                  type='button'
                  className='text-blue-600 text-sm hover:underline'
                  onClick={() => handleAddExperienceBullet(idx)}
                >
                  + 添加要点
                </button>
              </div>
              {(formData.experiences?.[idx]?.bullets || ['']).map((bullet, bulletIdx) => (
                <div key={bulletIdx} className='flex gap-2 mb-2'>
                  <textarea
                    className='flex-1 border rounded-lg p-2'
                    rows={2}
                    {...register(`experiences.${idx}.bullets.${bulletIdx}`)}
                    placeholder={
                      preset.experiencePlaceholders[bulletIdx % preset.experiencePlaceholders.length] ||
                      '描述工作内容和成果（可参考上方模板）'
                    }
                  />
                  {(formData.experiences?.[idx]?.bullets || []).length > 1 && (
                    <button
                      type='button'
                      className='text-red-600 text-sm hover:underline self-start mt-2'
                      onClick={() => handleRemoveExperienceBullet(idx, bulletIdx)}
                    >
                      删除
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className='text-right'>
              <button type='button' className='text-red-600 text-sm hover:underline' onClick={() => experiencesFA.remove(idx)}>
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 项目经验 */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>项目经验</h3>
          <button
            type='button'
            className='text-blue-600 text-sm hover:underline'
            onClick={() => projectsFA.append({ name: '', startDate: '', endDate: '', bullets: [''] })}
          >
            + 添加
          </button>
        </div>
        {projectsFA.fields.map((field, idx) => (
          <div key={field.id} className='border rounded-xl p-4 space-y-3'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              <div>
                <label className='block text-sm font-medium mb-1'>项目名称</label>
                <input className='w-full border rounded-lg p-2' {...register(`projects.${idx}.name`)} placeholder='项目名称' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>开始时间</label>
                <input className='w-full border rounded-lg p-2' {...register(`projects.${idx}.startDate`)} placeholder='如：2023-01' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>结束时间</label>
                <input className='w-full border rounded-lg p-2' {...register(`projects.${idx}.endDate`)} placeholder='如：2023-12' />
              </div>
            </div>
            <div>
              <div className='flex items-center justify-between mb-2'>
                <label className='block text-sm font-medium'>项目要点</label>
                <button
                  type='button'
                  className='text-blue-600 text-sm hover:underline'
                  onClick={() => handleAddProjectBullet(idx)}
                >
                  + 添加要点
                </button>
              </div>
              {(formData.projects?.[idx]?.bullets || ['']).map((bullet, bulletIdx) => (
                <div key={bulletIdx} className='flex gap-2 mb-2'>
                  <textarea
                    className='flex-1 border rounded-lg p-2'
                    rows={2}
                    {...register(`projects.${idx}.bullets.${bulletIdx}`)}
                    placeholder={
                      preset.projectPlaceholders[bulletIdx % preset.projectPlaceholders.length] ||
                      '描述项目内容和成果（可参考上方模板）'
                    }
                  />
                  {(formData.projects?.[idx]?.bullets || []).length > 1 && (
                    <button
                      type='button'
                      className='text-red-600 text-sm hover:underline self-start mt-2'
                      onClick={() => handleRemoveProjectBullet(idx, bulletIdx)}
                    >
                      删除
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className='text-right'>
              <button type='button' className='text-red-600 text-sm hover:underline' onClick={() => projectsFA.remove(idx)}>
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 证书 */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>证书</h3>
          <button
            type='button'
            className='text-blue-600 text-sm hover:underline'
            onClick={() => certificationsFA.append({ name: '', issuer: '', date: '' })}
          >
            + 添加
          </button>
        </div>
        {certificationsFA.fields.map((field, idx) => (
          <div key={field.id} className='border rounded-xl p-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              <div>
                <label className='block text-sm font-medium mb-1'>证书名称</label>
                <input className='w-full border rounded-lg p-2' {...register(`certifications.${idx}.name`)} placeholder='证书名称' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>颁发机构（可选）</label>
                <input className='w-full border rounded-lg p-2' {...register(`certifications.${idx}.issuer`)} placeholder='颁发机构' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>日期（可选）</label>
                <input className='w-full border rounded-lg p-2' {...register(`certifications.${idx}.date`)} placeholder='如：2024-01' />
              </div>
            </div>
            <div className='text-right mt-3'>
              <button type='button' className='text-red-600 text-sm hover:underline' onClick={() => certificationsFA.remove(idx)}>
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </form>
  );
};

export default SimpleResumeForm;

