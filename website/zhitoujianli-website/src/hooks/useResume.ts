/**
 * 简历管理Hook
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import { useCallback, useEffect, useState } from 'react';
import { resumeService } from '../services/resumeService';
import { ResumeInfo } from '../types/api';

export interface UseResumeReturn {
  resumeInfo: ResumeInfo | null;
  loading: boolean;
  error: string | null;
  hasResume: boolean;
  uploadResume: (file: File) => Promise<void>;
  parseResume: (text: string) => Promise<void>;
  updateResumeInfo: (info: ResumeInfo) => Promise<void>;
  updateResumeContent: (content: string) => Promise<void>;
  deleteResume: () => Promise<void>;
  refreshResume: () => Promise<void>;
}

/**
 * 简历管理Hook
 */
export const useResume = (): UseResumeReturn => {
  const [resumeInfo, setResumeInfo] = useState<ResumeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasResume, setHasResume] = useState(false);

  /**
   * 加载简历信息
   */
  const loadResumeInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 先检查是否有简历
      const checkResponse = await resumeService.checkResume();
      if (!checkResponse.data.hasResume) {
        setHasResume(false);
        setResumeInfo(null);
        return;
      }

      // 获取简历信息
      const response = await resumeService.getResumeInfo();
      if (response.code === 200) {
        setResumeInfo(response.data);
        setHasResume(true);
      } else {
        setError(response.message);
        setHasResume(false);
      }
    } catch (err: any) {
      setError(err.message || '加载简历信息失败');
      setHasResume(false);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 上传简历文件
   */
  const uploadResume = useCallback(async (file: File) => {
    try {
      setLoading(true);
      setError(null);

      // 验证文件格式
      const validation = resumeService.validateFileFormat(file);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      const response = await resumeService.uploadResume(file);
      if (response.code === 200) {
        setResumeInfo(response.data);
        setHasResume(true);
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err.message || '简历上传失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 解析简历文本
   */
  const parseResume = useCallback(async (text: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!text.trim()) {
        throw new Error('简历文本不能为空');
      }

      const response = await resumeService.parseResume(text);
      if (response.code === 200) {
        setResumeInfo(response.data);
        setHasResume(true);
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err.message || '简历解析失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 更新简历信息
   */
  const updateResumeInfo = useCallback(async (info: ResumeInfo) => {
    try {
      setLoading(true);
      setError(null);

      const response = await resumeService.updateResumeInfo(info);
      if (response.code === 200) {
        setResumeInfo(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err.message || '更新简历信息失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 更新简历内容
   */
  const updateResumeContent = useCallback(
    async (content: string) => {
      try {
        setLoading(true);
        setError(null);

        if (!content.trim()) {
          throw new Error('简历内容不能为空');
        }

        const response = await resumeService.updateResumeContent(content);
        if (response.code === 200) {
          // 重新加载简历信息
          await loadResumeInfo();
        } else {
          throw new Error(response.message);
        }
      } catch (err: any) {
        setError(err.message || '更新简历内容失败');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadResumeInfo]
  );

  /**
   * 删除简历
   */
  const deleteResume = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await resumeService.deleteResume();
      if (response.code === 200) {
        setResumeInfo(null);
        setHasResume(false);
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err.message || '删除简历失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新简历信息
   */
  const refreshResume = useCallback(async () => {
    await loadResumeInfo();
  }, [loadResumeInfo]);

  // 组件挂载时加载简历信息
  useEffect(() => {
    loadResumeInfo();
  }, [loadResumeInfo]);

  return {
    resumeInfo,
    loading,
    error,
    hasResume,
    uploadResume,
    parseResume,
    updateResumeInfo,
    updateResumeContent,
    deleteResume,
    refreshResume,
  };
};
