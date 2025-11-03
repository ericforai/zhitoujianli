/**
 * 简历管理主组件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import React, { useState } from 'react';
import { useResume } from '../../hooks/useResume';
import ResumeEditor from './ResumeEditor';
import ResumeInfoDisplay from './ResumeInfoDisplay';
import ResumeUpload from './ResumeUpload';

const ResumeManagement: React.FC = () => {
  const {
    resumeInfo,
    loading,
    error,
    hasResume,
    parseResume,
    updateResumeInfo,
    deleteResume,
  } = useResume();

  const [isEditing, setIsEditing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * 处理上传成功
   */
  const handleUploadSuccess = () => {
    setUploadError(null);
    setSuccessMessage('简历上传并解析成功！');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  /**
   * 处理上传错误
   */
  const handleUploadError = (error: string) => {
    setUploadError(error);
    setSuccessMessage(null);
  };

  /**
   * 处理编辑
   */
  const handleEdit = () => {
    setIsEditing(true);
  };

  /**
   * 处理取消编辑
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  /**
   * 处理保存编辑
   */
  const handleSaveEdit = async (updatedResumeInfo: any) => {
    try {
      await updateResumeInfo(updatedResumeInfo);
      setIsEditing(false);
      setSuccessMessage('简历信息更新成功！');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('保存失败:', error);
    }
  };

  /**
   * 处理删除简历
   */
  const handleDeleteResume = async () => {
    if (window.confirm('确定要删除简历吗？此操作不可恢复。')) {
      try {
        await deleteResume();
        setSuccessMessage('简历删除成功！');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error: any) {
        console.error('删除失败:', error);
      }
    }
  };

  /**
   * 处理文本解析
   */
  const handleTextParse = async (text: string) => {
    try {
      await parseResume(text);
      setSuccessMessage('简历解析成功！');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('解析失败:', error);
    }
  };

  return (
    <div className='space-y-6'>
      {/* 页面标题 */}
      <div>
        <h3 className='text-xl font-semibold text-gray-900'>简历管理</h3>
        <p className='mt-1 text-sm text-gray-600'>
          上传、编辑和管理您的简历信息，为智能投递做准备
        </p>
      </div>

      {/* 成功消息 */}
      {successMessage && (
        <div className='bg-green-50 border border-green-200 rounded-md p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-green-400'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-green-800'>
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 错误消息 */}
      {(error || uploadError) && (
        <div className='bg-red-50 border border-red-200 rounded-md p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-red-400'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-red-800'>
                {error || uploadError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          <span className='ml-2 text-gray-600'>处理中...</span>
        </div>
      )}

      {/* 主要内容 */}
      {!loading && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* 左侧：上传区域 */}
          <div className='space-y-6'>
            {/* 文件上传 */}
            <div>
              <h4 className='text-lg font-medium text-gray-900 mb-4'>
                上传简历文件
              </h4>
              <ResumeUpload
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                disabled={loading}
              />
            </div>

            {/* 文本解析 */}
            <div>
              <h4 className='text-lg font-medium text-gray-900 mb-4'>
                或粘贴简历文本
              </h4>
              <div className='space-y-4'>
                <textarea
                  rows={8}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='请粘贴您的简历文本内容...'
                  disabled={loading}
                />
                <button
                  type='button'
                  onClick={() => {
                    const textarea = document.querySelector('textarea');
                    if (textarea?.value) {
                      handleTextParse(textarea.value);
                    }
                  }}
                  disabled={loading}
                  className='w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  解析简历文本
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：简历信息 */}
          <div>
            {hasResume && resumeInfo ? (
              <>
                {isEditing ? (
                  <ResumeEditor
                    resumeInfo={resumeInfo}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                    loading={loading}
                  />
                ) : (
                  <ResumeInfoDisplay
                    resumeInfo={resumeInfo}
                    onEdit={handleEdit}
                    onDelete={handleDeleteResume}
                    showActions={true}
                  />
                )}
              </>
            ) : (
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'>
                <div className='space-y-4'>
                  <svg
                    className='mx-auto h-12 w-12 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                  <div>
                    <h4 className='text-lg font-medium text-gray-900'>
                      暂无简历信息
                    </h4>
                    <p className='text-sm text-gray-500 mt-2'>
                      请上传简历文件或粘贴简历文本，系统将自动解析您的简历信息
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
        <div className='flex'>
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-blue-400'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='ml-3'>
            <h4 className='text-sm font-medium text-blue-800'>使用提示</h4>
            <div className='mt-2 text-sm text-blue-700'>
              <ul className='list-disc list-inside space-y-1'>
                <li>支持PDF、Word文档、纯文本格式的简历文件</li>
                <li>文件大小限制为10MB，建议使用PDF格式获得最佳解析效果</li>
                <li>系统会自动提取姓名、联系方式、技能、工作经验等关键信息</li>
                <li>解析完成后可以手动编辑和完善简历信息</li>
                <li>简历信息将用于智能匹配和个性化打招呼语生成</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeManagement;
