/**
 * 全局错误处理Hook
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import { useCallback, useState } from 'react';

export interface ErrorState {
  hasError: boolean;
  error: string | null;
  timestamp: number | null;
}

/**
 * API错误接口
 */
export interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    statusText?: string;
  };
  message?: string;
}

export interface UseErrorHandlerReturn {
  error: ErrorState;
  setError: (error: string) => void;
  clearError: () => void;
  handleError: (error: unknown) => void;
}

/**
 * 全局错误处理Hook
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    timestamp: null,
  });

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      timestamp: null,
    });
  }, []);

  const setError = useCallback(
    (errorMessage: string) => {
      setErrorState({
        hasError: true,
        error: errorMessage,
        timestamp: Date.now(),
      });

      setTimeout(() => {
        clearError();
      }, 5000);
    },
    [clearError]
  );

  /**
   * 处理错误
   * ✅ 修复：使用unknown类型替代any，提升类型安全
   */
  const handleError = useCallback(
    (err: unknown) => {
      let errorMessage = '发生未知错误';

      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        // 处理API错误格式
        const apiError = err as ApiError;
        if (apiError?.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        } else if (apiError?.response?.data?.error) {
          errorMessage = apiError.response.data.error;
        } else if (apiError?.response?.statusText) {
          errorMessage = apiError.response.statusText;
        } else if (apiError?.message) {
          errorMessage = apiError.message;
        }
      }

      setError(errorMessage);
      console.error('Error handled by useErrorHandler:', err);
    },
    [setError]
  );

  return {
    error,
    setError,
    clearError,
    handleError,
  };
};
