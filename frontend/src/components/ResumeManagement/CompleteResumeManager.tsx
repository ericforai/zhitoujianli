/**
 * 完整的简历管理组件
 * 包含上传、解析、默认打招呼语生成等完整功能
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

import React, { useRef, useState } from 'react';
import {
  ResumeParseResult,
  aiGreetingService,
  aiResumeService,
} from '../../services/aiService';

interface CompleteResumeManagerProps {
  onResumeSaved?: (resumeInfo: ResumeParseResult) => void;
}

const CompleteResumeManager: React.FC<CompleteResumeManagerProps> = ({
  onResumeSaved,
}) => {
  // 状态管理
  const [resumeInfo, setResumeInfo] = useState<ResumeParseResult | null>(null);
  const [defaultGreeting, setDefaultGreeting] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [useTextInput, setUseTextInput] = useState(false);
  const [resumeText, setResumeText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 处理文件上传
   */
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.match(/\.(pdf|doc|docx|txt)$/i)
    ) {
      setError('不支持的文件格式，请上传PDF、DOC、DOCX、TXT文件');
      return;
    }

    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过10MB');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('📤 开始上传简历文件:', file.name);

      // 调用API上传并解析简历
      const result = await aiResumeService.uploadResume(file);
      console.log('✅ 简历解析成功:', result);

      setResumeInfo(result);

      // 生成默认打招呼语
      await generateDefaultGreeting(result);

      setSuccessMessage('简历上传并解析成功！');

      // 通知父组件
      if (onResumeSaved) {
        onResumeSaved(result);
      }
    } catch (error: any) {
      console.error('❌ 简历上传失败:', error);
      setError(`简历上传失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理文本解析
   */
  const handleTextParse = async () => {
    if (!resumeText.trim()) {
      setError('请输入简历文本内容');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('📝 开始解析简历文本');

      // 调用API解析简历文本
      const result = await aiResumeService.parseResume(resumeText);
      console.log('✅ 简历解析成功:', result);

      setResumeInfo(result);

      // 生成默认打招呼语
      await generateDefaultGreeting(result);

      setSuccessMessage('简历解析成功！');

      // 通知父组件
      if (onResumeSaved) {
        onResumeSaved(result);
      }
    } catch (error: any) {
      console.error('❌ 简历解析失败:', error);
      setError(`简历解析失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 生成默认打招呼语
   */
  const generateDefaultGreeting = async (candidate: ResumeParseResult) => {
    try {
      console.log('🤖 开始生成默认打招呼语');

      const greeting =
        await aiGreetingService.generateDefaultGreeting(candidate);
      console.log('✅ 默认打招呼语生成成功:', greeting);

      setDefaultGreeting(greeting);
    } catch (error: any) {
      console.error('❌ 默认打招呼语生成失败:', error);
      setError(`默认打招呼语生成失败: ${error.message || '未知错误'}`);
    }
  };

  /**
   * 重新生成默认打招呼语
   */
  const handleRegenerateGreeting = async () => {
    if (!resumeInfo) {
      setError('请先上传简历');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await generateDefaultGreeting(resumeInfo);
      setSuccessMessage('默认打招呼语重新生成成功！');
    } catch (error: any) {
      console.error('❌ 重新生成失败:', error);
      setError(`重新生成失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 保存默认打招呼语
   */
  const handleSaveGreeting = async () => {
    if (!defaultGreeting.trim()) {
      setError('没有可保存的打招呼语');
      return;
    }

    try {
      console.log('💾 开始保存默认打招呼语');

      await aiGreetingService.saveDefaultGreeting(defaultGreeting);
      console.log('✅ 默认打招呼语保存成功');

      setSuccessMessage('默认打招呼语保存成功！');
    } catch (error: any) {
      console.error('❌ 保存失败:', error);
      setError(`保存失败: ${error.message || '未知错误'}`);
    }
  };

  /**
   * 删除简历
   */
  const handleDeleteResume = async () => {
    if (!window.confirm('确定要删除简历吗？此操作不可恢复。')) {
      return;
    }

    try {
      console.log('🗑️ 开始删除简历');

      await aiResumeService.deleteResume();
      console.log('✅ 简历删除成功');

      setResumeInfo(null);
      setDefaultGreeting('');
      setSuccessMessage('简历删除成功！');
    } catch (error: any) {
      console.error('❌ 删除失败:', error);
      setError(`删除失败: ${error.message || '未知错误'}`);
    }
  };

  // 暂时注释掉未使用的工具函数
  // /**
  //  * 格式化置信度评分
  //  */
  // const formatConfidence = (score: number): string => {
  //   return `${Math.round(score * 100)}%`;
  // };

  // /**
  //  * 获取置信度颜色
  //  */
  // const getConfidenceColor = (score: number): string => {
  //   if (score >= 0.8) return 'text-green-600 bg-green-100';
  //   if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
  //   return 'text-red-600 bg-red-100';
  // };

  return (
    <div className='space-y-6'>
      {/* 页面标题 */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-semibold text-gray-900'>简历管理</h3>
          <p className='mt-1 text-sm text-gray-600'>
            上传、编辑和管理您的简历信息，为智能投递做准备
          </p>
        </div>
        <button
          onClick={() => window.history.back()}
          className='flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors'
        >
          <svg
            className='w-5 h-5 mr-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
            />
          </svg>
          返回主页
        </button>
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
      {error && (
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
              <p className='text-sm font-medium text-red-800'>{error}</p>
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

      {/* 上传简历区域 */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h4 className='text-lg font-medium text-gray-900 mb-4'>上传简历</h4>

        {/* 文件上传 */}
        <div
          className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors'
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              const file = files[0];
              // 直接调用文件处理逻辑
              const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
              ];

              if (
                !allowedTypes.includes(file.type) &&
                !file.name.match(/\.(pdf|doc|docx|txt)$/i)
              ) {
                setError('不支持的文件格式，请上传PDF、DOC、DOCX、TXT文件');
                return;
              }

              if (file.size > 10 * 1024 * 1024) {
                setError('文件大小不能超过10MB');
                return;
              }

              // 直接处理文件上传
              (async () => {
                setLoading(true);
                setError(null);
                setSuccessMessage(null);

                try {
                  console.log('📤 开始上传简历文件:', file.name);
                  const result = await aiResumeService.uploadResume(file);
                  console.log('✅ 简历解析成功:', result);

                  setResumeInfo(result);
                  await generateDefaultGreeting(result);
                  setSuccessMessage('简历上传并解析成功！');

                  if (onResumeSaved) {
                    onResumeSaved(result);
                  }
                } catch (error: any) {
                  console.error('❌ 简历上传失败:', error);
                  setError(`简历上传失败: ${error.message || '未知错误'}`);
                } finally {
                  setLoading(false);
                }
              })();
            }
          }}
        >
          <div className='space-y-4'>
            <div className='text-4xl'>☁️</div>
            <div>
              <p className='text-lg font-medium text-gray-900'>
                拖拽文件到此处或点击上传
              </p>
              <p className='text-sm text-gray-500'>
                支持 TXT、PDF、DOC、DOCX 格式，文件大小不超过10MB |
                AI自动提取文本内容
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type='file'
                accept='.pdf,.doc,.docx,.txt'
                onChange={handleFileUpload}
                className='hidden'
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className='bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                + 选择文件
              </button>
            </div>
          </div>
        </div>

        {/* 文本输入选项 */}
        <div className='mt-6'>
          <div className='flex items-center mb-4'>
            <input
              type='checkbox'
              id='use-text-input'
              checked={useTextInput}
              onChange={e => setUseTextInput(e.target.checked)}
              className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
            />
            <label
              htmlFor='use-text-input'
              className='ml-2 text-sm text-gray-700'
            >
              或直接粘贴简历文本:
            </label>
          </div>

          {useTextInput && (
            <div className='space-y-4'>
              <textarea
                rows={8}
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='请粘贴您的简历内容...'
                disabled={loading}
              />
              <div className='text-sm text-gray-500'>
                <p className='font-medium mb-2'>建议包含:</p>
                <ul className='list-disc list-inside space-y-1'>
                  <li>个人信息(姓名、职位)</li>
                  <li>工作经历(公司、职位、年限)</li>
                  <li>核心技能</li>
                  <li>主要成就</li>
                  <li>教育背景</li>
                </ul>
              </div>
              <div className='flex space-x-4'>
                <button
                  onClick={handleTextParse}
                  disabled={loading || !resumeText.trim()}
                  className='bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  AI解析简历
                </button>
                {resumeInfo && (
                  <button
                    onClick={handleDeleteResume}
                    disabled={loading}
                    className='bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    删除简历
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 解析结果 */}
      {resumeInfo && (
        <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white'>
          <h4 className='text-xl font-semibold mb-6'>解析结果</h4>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 候选人信息 */}
            <div>
              <h5 className='font-medium mb-4'>候选人信息:</h5>
              <div className='space-y-3'>
                <div>
                  <span className='text-blue-200'>当前职位:</span>
                  <span className='ml-2'>{resumeInfo.current_title}</span>
                </div>
                <div>
                  <span className='text-blue-200'>工作年限:</span>
                  <span className='ml-2'>{resumeInfo.years_experience}年</span>
                </div>
                <div>
                  <span className='text-blue-200'>学历:</span>
                  <span className='ml-2'>{resumeInfo.education}</span>
                </div>
                <div>
                  <span className='text-blue-200'>公司:</span>
                  <span className='ml-2'>{resumeInfo.company || '未填写'}</span>
                </div>
              </div>
            </div>

            {/* 核心优势 */}
            <div>
              <h5 className='font-medium mb-4'>核心优势:</h5>
              <div className='flex flex-wrap gap-2'>
                {resumeInfo.core_strengths?.map((strength, index) => (
                  <span
                    key={index}
                    className='bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm'
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 技能 */}
          <div className='mt-6'>
            <h5 className='font-medium mb-4'>技能:</h5>
            <div className='flex flex-wrap gap-2'>
              {resumeInfo.skills?.map((skill, index) => (
                <span
                  key={index}
                  className='bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm'
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI生成的默认打招呼语 */}
      {resumeInfo && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h4 className='text-xl font-semibold text-gray-900 mb-4'>
            AI生成的默认打招呼语
          </h4>

          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
            <div className='flex items-start'>
              <svg
                className='h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                  clipRule='evenodd'
                />
              </svg>
              <div>
                <p className='text-sm text-blue-800'>
                  说明: 基于您的简历,
                  AI已生成一段通用的打招呼语。您可以直接使用,
                  也可以根据需要修改。
                </p>
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                默认打招呼语:
              </label>
              <textarea
                rows={8}
                value={defaultGreeting}
                onChange={e => setDefaultGreeting(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='AI正在生成默认打招呼语...'
                disabled={loading}
              />
            </div>

            <div className='flex space-x-4'>
              <button
                onClick={handleSaveGreeting}
                disabled={loading || !defaultGreeting.trim()}
                className='bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                保存为默认招呼语
              </button>
              <button
                onClick={handleRegenerateGreeting}
                disabled={loading}
                className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                重新生成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteResumeManager;
