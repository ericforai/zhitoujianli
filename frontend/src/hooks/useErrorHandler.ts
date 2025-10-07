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

export interface UseErrorHandlerReturn {
  error: ErrorState;
  setError: (error: string) => void;
  clearError: () => void;
  handleError: (error: any) => void;
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

  const handleError = useCallback(
    (err: any) => {
      let errorMessage = '发生未知错误';

      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.response?.statusText) {
        errorMessage = err.response.statusText;
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
