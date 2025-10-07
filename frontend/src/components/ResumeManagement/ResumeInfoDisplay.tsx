/**
 * 简历信息展示组件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import React from 'react';
import { ResumeInfo } from '../../types/api';

interface ResumeInfoDisplayProps {
  resumeInfo: ResumeInfo;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const ResumeInfoDisplay: React.FC<ResumeInfoDisplayProps> = ({
  resumeInfo,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  /**
   * 格式化置信度评分
   */
  const formatConfidence = (score: number): string => {
    return `${Math.round(score * 100)}%`;
  };

  /**
   * 获取置信度颜色
   */
  const getConfidenceColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      {/* 头部信息 */}
      <div className='flex items-start justify-between mb-6'>
        <div className='flex items-center space-x-4'>
          <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
            <span className='text-white font-bold text-lg'>
              {resumeInfo.name?.charAt(0) || '?'}
            </span>
          </div>
          <div>
            <h3 className='text-xl font-semibold text-gray-900'>
              {resumeInfo.name || '未填写'}
            </h3>
            <p className='text-gray-600'>
              {resumeInfo.currentTitle || '未填写'} ·{' '}
              {resumeInfo.yearsExperience || 0}年经验
            </p>
          </div>
        </div>

        {showActions && (
          <div className='flex space-x-2'>
            {onEdit && (
              <button
                onClick={onEdit}
                className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <svg
                  className='w-4 h-4 mr-1'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                  />
                </svg>
                编辑
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className='inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
              >
                <svg
                  className='w-4 h-4 mr-1'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                  />
                </svg>
                删除
              </button>
            )}
          </div>
        )}
      </div>

      {/* 基本信息 */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        <div className='space-y-4'>
          <div>
            <label className='text-sm font-medium text-gray-500'>
              联系方式
            </label>
            <p className='mt-1 text-sm text-gray-900'>
              {resumeInfo.phone || resumeInfo.email || '未填写'}
            </p>
          </div>
          <div>
            <label className='text-sm font-medium text-gray-500'>学历</label>
            <p className='mt-1 text-sm text-gray-900'>
              {resumeInfo.education || '未填写'}
            </p>
          </div>
        </div>
        <div className='space-y-4'>
          <div>
            <label className='text-sm font-medium text-gray-500'>
              工作经验
            </label>
            <p className='mt-1 text-sm text-gray-900'>
              {resumeInfo.workExperience || '未填写'}
            </p>
          </div>
          <div>
            <label className='text-sm font-medium text-gray-500'>
              置信度评分
            </label>
            <div className='mt-1 flex space-x-2'>
              {resumeInfo.confidence && (
                <>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(resumeInfo.confidence.overall)}`}
                  >
                    总体: {formatConfidence(resumeInfo.confidence.overall)}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(resumeInfo.confidence.name)}`}
                  >
                    姓名: {formatConfidence(resumeInfo.confidence.name)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 技能列表 */}
      {resumeInfo.skills && resumeInfo.skills.length > 0 && (
        <div className='mb-6'>
          <label className='text-sm font-medium text-gray-500 mb-3 block'>
            技能
          </label>
          <div className='flex flex-wrap gap-2'>
            {resumeInfo.skills.map((skill, index) => (
              <span
                key={index}
                className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 核心优势 */}
      {resumeInfo.coreStrengths && resumeInfo.coreStrengths.length > 0 && (
        <div className='mb-6'>
          <label className='text-sm font-medium text-gray-500 mb-3 block'>
            核心优势
          </label>
          <div className='space-y-2'>
            {resumeInfo.coreStrengths.map((strength, index) => (
              <div key={index} className='flex items-start space-x-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0'></div>
                <p className='text-sm text-gray-700'>{strength}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 项目经验 */}
      {resumeInfo.projects && resumeInfo.projects.length > 0 && (
        <div className='mb-6'>
          <label className='text-sm font-medium text-gray-500 mb-3 block'>
            项目经验
          </label>
          <div className='space-y-3'>
            {resumeInfo.projects.map((project, index) => (
              <div key={index} className='p-3 bg-gray-50 rounded-lg'>
                <p className='text-sm text-gray-700'>{project}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 底部信息 */}
      <div className='pt-4 border-t border-gray-200'>
        <div className='flex justify-between items-center text-xs text-gray-500'>
          <span>
            创建时间: {new Date(resumeInfo.createdAt).toLocaleString()}
          </span>
          <span>
            更新时间: {new Date(resumeInfo.updatedAt).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResumeInfoDisplay;
