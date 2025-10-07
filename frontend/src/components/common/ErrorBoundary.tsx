/**
 * 全局错误边界组件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // 可以在这里添加错误上报逻辑
    this.reportError(error, errorInfo);
  }

  /**
   * 上报错误信息
   */
  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // TODO: 实现错误上报逻辑
    // 可以发送到错误监控服务，如 Sentry、Bugsnag 等
    console.log('Error reported:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  /**
   * 重置错误状态
   */
  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  /**
   * 刷新页面
   */
  private handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 自定义降级 UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-6'>
            <div className='text-center'>
              <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4'>
                <svg
                  className='h-6 w-6 text-red-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
              </div>

              <h2 className='text-lg font-medium text-gray-900 mb-2'>
                出现了一些问题
              </h2>

              <p className='text-sm text-gray-600 mb-6'>
                很抱歉，页面遇到了一个错误。我们已经记录了这个问题，并会尽快修复。
              </p>

              {/* 开发环境下显示详细错误信息 */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-left'>
                  <h3 className='text-sm font-medium text-red-800 mb-2'>
                    错误详情：
                  </h3>
                  <pre className='text-xs text-red-700 whitespace-pre-wrap overflow-auto max-h-32'>
                    {this.state.error.message}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </pre>
                </div>
              )}

              <div className='flex space-x-3'>
                <button
                  onClick={this.handleReset}
                  className='flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  重试
                </button>
                <button
                  onClick={this.handleRefresh}
                  className='flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  刷新页面
                </button>
              </div>

              <div className='mt-4 text-xs text-gray-500'>
                如果问题持续存在，请联系技术支持
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
