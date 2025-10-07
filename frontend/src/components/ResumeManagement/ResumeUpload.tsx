/**
 * 简历上传组件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { resumeService } from '../../services/resumeService';
import { ResumeInfo } from '../../types/api';

interface ResumeUploadProps {
  onUploadSuccess: (resumeInfo: ResumeInfo) => void;
  onUploadError: (error: string) => void;
  disabled?: boolean;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  /**
   * 处理文件上传
   */
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (disabled) return;

      setIsUploading(true);
      setUploadProgress(0);

      try {
        // 验证文件格式
        const validation = resumeService.validateFileFormat(file);
        if (!validation.valid) {
          throw new Error(validation.message);
        }

        // 模拟上传进度
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);

        const response = await resumeService.uploadResume(file);

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (response.code === 200) {
          onUploadSuccess(response.data);
        } else {
          throw new Error(response.message);
        }
      } catch (error: any) {
        onUploadError(error.message || '上传失败');
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    [disabled, onUploadSuccess, onUploadError]
  );

  /**
   * 处理拖拽文件
   */
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: disabled || isUploading,
  });

  return (
    <div className='w-full'>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
          ${
            isDragActive || dragActive
              ? 'border-blue-500 bg-blue-50 scale-105'
              : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className='space-y-4'>
            <div className='flex items-center justify-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-700'>
                正在上传和解析简历...
              </p>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className='text-xs text-gray-500'>{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='flex justify-center'>
              <svg
                className='w-12 h-12 text-gray-400'
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

            <div className='space-y-2'>
              <h4 className='text-lg font-medium text-gray-900'>
                {isDragActive || dragActive
                  ? '松开以上传文件'
                  : '拖拽文件到此处或点击上传'}
              </h4>
              <p className='text-sm text-gray-500'>
                支持 PDF、DOC、DOCX、TXT 格式，最大 10MB
              </p>
            </div>

            <div className='flex justify-center'>
              <button
                type='button'
                className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={disabled}
              >
                <svg
                  className='w-4 h-4 mr-2'
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
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 支持的文件格式说明 */}
      <div className='mt-4 text-center'>
        <p className='text-xs text-gray-400'>
          支持格式：PDF、Word文档、纯文本文件
        </p>
      </div>
    </div>
  );
};

export default ResumeUpload;
