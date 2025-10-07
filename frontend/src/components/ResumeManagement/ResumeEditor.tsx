/**
 * 简历内容编辑组件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import React, { useEffect, useState } from 'react';
import { ResumeInfo } from '../../types/api';

interface ResumeEditorProps {
  resumeInfo: ResumeInfo;
  onSave: (resumeInfo: ResumeInfo) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ResumeEditor: React.FC<ResumeEditorProps> = ({
  resumeInfo,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ResumeInfo>(resumeInfo);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(resumeInfo);
  }, [resumeInfo]);

  /**
   * 处理输入变化
   */
  const handleInputChange = (field: keyof ResumeInfo, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  /**
   * 处理技能变化
   */
  const handleSkillsChange = (skills: string[]) => {
    setFormData(prev => ({
      ...prev,
      skills,
    }));
  };

  /**
   * 处理核心优势变化
   */
  const handleCoreStrengthsChange = (strengths: string[]) => {
    setFormData(prev => ({
      ...prev,
      coreStrengths: strengths,
    }));
  };

  /**
   * 处理项目经验变化
   */
  const handleProjectsChange = (projects: string[]) => {
    setFormData(prev => ({
      ...prev,
      projects,
    }));
  };

  /**
   * 添加技能
   */
  const addSkill = () => {
    const newSkill = prompt('请输入新技能:');
    if (newSkill && newSkill.trim()) {
      handleSkillsChange([...formData.skills, newSkill.trim()]);
    }
  };

  /**
   * 删除技能
   */
  const removeSkill = (index: number) => {
    handleSkillsChange(formData.skills.filter((_, i) => i !== index));
  };

  /**
   * 添加核心优势
   */
  const addCoreStrength = () => {
    const newStrength = prompt('请输入核心优势:');
    if (newStrength && newStrength.trim()) {
      handleCoreStrengthsChange([
        ...formData.coreStrengths,
        newStrength.trim(),
      ]);
    }
  };

  /**
   * 删除核心优势
   */
  const removeCoreStrength = (index: number) => {
    handleCoreStrengthsChange(
      formData.coreStrengths.filter((_, i) => i !== index)
    );
  };

  /**
   * 添加项目经验
   */
  const addProject = () => {
    const newProject = prompt('请输入项目经验:');
    if (newProject && newProject.trim()) {
      handleProjectsChange([...formData.projects, newProject.trim()]);
    }
  };

  /**
   * 删除项目经验
   */
  const removeProject = (index: number) => {
    handleProjectsChange(formData.projects.filter((_, i) => i !== index));
  };

  /**
   * 表单验证
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = '姓名不能为空';
    }

    if (!formData.currentTitle?.trim()) {
      newErrors.currentTitle = '当前职位不能为空';
    }

    if (
      formData.yearsExperience === undefined ||
      formData.yearsExperience < 0
    ) {
      newErrors.yearsExperience = '工作年限不能为负数';
    }

    if (!formData.phone?.trim() && !formData.email?.trim()) {
      newErrors.contact = '联系方式（电话或邮箱）至少填写一个';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 处理保存
   */
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSave({
        ...formData,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900'>编辑简历信息</h3>
        <p className='text-sm text-gray-500'>修改简历信息后点击保存</p>
      </div>

      <div className='space-y-6'>
        {/* 基本信息 */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              姓名 <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={formData.name || ''}
              onChange={e => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder='请输入姓名'
            />
            {errors.name && (
              <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              当前职位 <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={formData.currentTitle || ''}
              onChange={e => handleInputChange('currentTitle', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.currentTitle ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder='请输入当前职位'
            />
            {errors.currentTitle && (
              <p className='mt-1 text-sm text-red-600'>{errors.currentTitle}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              工作年限 <span className='text-red-500'>*</span>
            </label>
            <input
              type='number'
              min='0'
              value={formData.yearsExperience || ''}
              onChange={e =>
                handleInputChange(
                  'yearsExperience',
                  parseInt(e.target.value) || 0
                )
              }
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.yearsExperience ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder='请输入工作年限'
            />
            {errors.yearsExperience && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.yearsExperience}
              </p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              学历
            </label>
            <select
              value={formData.education || ''}
              onChange={e => handleInputChange('education', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>请选择学历</option>
              <option value='高中'>高中</option>
              <option value='大专'>大专</option>
              <option value='本科'>本科</option>
              <option value='硕士'>硕士</option>
              <option value='博士'>博士</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              电话
            </label>
            <input
              type='tel'
              value={formData.phone || ''}
              onChange={e => handleInputChange('phone', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='请输入电话号码'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              邮箱
            </label>
            <input
              type='email'
              value={formData.email || ''}
              onChange={e => handleInputChange('email', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='请输入邮箱地址'
            />
          </div>
        </div>

        {errors.contact && (
          <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
            <p className='text-sm text-red-600'>{errors.contact}</p>
          </div>
        )}

        {/* 工作经验 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            工作经验
          </label>
          <textarea
            value={formData.workExperience || ''}
            onChange={e => handleInputChange('workExperience', e.target.value)}
            rows={4}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='请描述您的工作经验...'
          />
        </div>

        {/* 技能列表 */}
        <div>
          <div className='flex items-center justify-between mb-2'>
            <label className='block text-sm font-medium text-gray-700'>
              技能
            </label>
            <button
              type='button'
              onClick={addSkill}
              className='text-sm text-blue-600 hover:text-blue-700'
            >
              + 添加技能
            </button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {formData.skills?.map((skill, index) => (
              <span
                key={index}
                className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'
              >
                {skill}
                <button
                  type='button'
                  onClick={() => removeSkill(index)}
                  className='ml-2 text-blue-600 hover:text-blue-800'
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 核心优势 */}
        <div>
          <div className='flex items-center justify-between mb-2'>
            <label className='block text-sm font-medium text-gray-700'>
              核心优势
            </label>
            <button
              type='button'
              onClick={addCoreStrength}
              className='text-sm text-blue-600 hover:text-blue-700'
            >
              + 添加优势
            </button>
          </div>
          <div className='space-y-2'>
            {formData.coreStrengths?.map((strength, index) => (
              <div key={index} className='flex items-center space-x-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full flex-shrink-0'></div>
                <span className='flex-1 text-sm text-gray-700'>{strength}</span>
                <button
                  type='button'
                  onClick={() => removeCoreStrength(index)}
                  className='text-red-600 hover:text-red-800'
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 项目经验 */}
        <div>
          <div className='flex items-center justify-between mb-2'>
            <label className='block text-sm font-medium text-gray-700'>
              项目经验
            </label>
            <button
              type='button'
              onClick={addProject}
              className='text-sm text-blue-600 hover:text-blue-700'
            >
              + 添加项目
            </button>
          </div>
          <div className='space-y-3'>
            {formData.projects?.map((project, index) => (
              <div
                key={index}
                className='flex items-start space-x-2 p-3 bg-gray-50 rounded-lg'
              >
                <span className='flex-1 text-sm text-gray-700'>{project}</span>
                <button
                  type='button'
                  onClick={() => removeProject(index)}
                  className='text-red-600 hover:text-red-800'
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className='flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200'>
        <button
          type='button'
          onClick={onCancel}
          className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        >
          取消
        </button>
        <button
          type='button'
          onClick={handleSave}
          disabled={loading}
          className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
};

export default ResumeEditor;
