import React, { useCallback, useState } from 'react';
import { parse, validateFile } from '../../services/uploads';

interface Props {
  onParsed: (text: string) => void;
}

/**
 * 简历上传组件 - 增强版
 * 包含产品价值展示、优化原则说明和客户利益点
 */
const UploadBox: React.FC<Props> = ({ onParsed }) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || !files.length) return;
      const file = files[0];
      const valid = validateFile(file);
      if (!valid.ok) {
        setError(valid.reason || '文件无效');
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const res = await parse(file);
        onParsed(res.text);
      } catch (e: unknown) {
        const errorMessage =
          e instanceof Error ? e.message : '文件解析失败，请稍后重试';
        setError(errorMessage);
        console.error('文件解析失败:', e);
      } finally {
        setLoading(false);
      }
    },
    [onParsed]
  );

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
        dragOver
          ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      } ${loading ? 'opacity-75 cursor-wait' : 'cursor-pointer'}`}
      onDragOver={e => {
        e.preventDefault();
        if (!loading) setDragOver(true);
      }}
      onDragLeave={e => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={e => {
        e.preventDefault();
        setDragOver(false);
        if (!loading) handleFiles(e.dataTransfer.files);
      }}
    >
      {/* 上传图标 */}
      <div className='mb-4'>
        {loading ? (
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100'>
            <svg
              className='animate-spin h-8 w-8 text-blue-600'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
          </div>
        ) : (
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100'>
            <svg
              className='w-8 h-8 text-blue-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
              />
            </svg>
          </div>
        )}
      </div>

      {/* 提示文字 */}
      <div className='space-y-2 mb-4'>
        <div className='text-lg font-medium text-gray-900'>
          {loading
            ? '正在解析简历，请稍候...'
            : dragOver
              ? '松开鼠标以上传文件'
              : '拖拽文件到此处，或点击选择'}
        </div>
        <div className='text-sm text-gray-500'>
          支持格式：PDF、Word文档（.doc/.docx）、TXT、MD | 文件大小：≤5MB
        </div>
      </div>

      {/* 上传按钮 */}
      {!loading && (
        <div className='flex justify-center'>
          <label
            className='inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg'
            onClick={e => {
              // 阻止事件冒泡，避免触发外层div的onClick
              e.stopPropagation();
            }}
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
                d='M12 6v6m0 0v6m0-6h6m-6 0H6'
              />
            </svg>
            选择文件
            <input
              id='resume-file-input'
              type='file'
              className='hidden'
              accept='.pdf,.doc,.docx,.txt,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown'
              onChange={e => {
                // 修复：确保每次选择文件后都能触发
                if (e.target.files && e.target.files.length > 0) {
                  handleFiles(e.target.files);
                  // 重置input值，允许重复选择同一文件
                  e.target.value = '';
                }
              }}
              onClick={e => {
                // 阻止事件冒泡，避免触发外层div的onClick
                e.stopPropagation();
              }}
              disabled={loading}
            />
          </label>
        </div>
      )}

      {/* 状态提示 */}
      {loading && (
        <div className='mt-4'>
          <div className='inline-flex items-center space-x-2 text-blue-600'>
            <svg
              className='animate-spin h-4 w-4'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
            <span className='text-sm font-medium'>
              AI正在智能解析您的简历...
            </span>
          </div>
        </div>
      )}
      {error && (
        <div className='mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm'>
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default UploadBox;
