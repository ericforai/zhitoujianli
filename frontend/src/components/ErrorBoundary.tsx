/**
 * 错误边界组件
 * 捕获JavaScript运行时错误并显示友好的错误信息
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
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
    // 更新state，下次渲染将显示错误UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary捕获到错误:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // 这里可以发送错误报告到监控服务
    // reportError(error, errorInfo);
  }

  handleReload = () => {
    // 重新加载页面
    window.location.reload();
  };

  handleReset = () => {
    // 重置错误状态
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // 自定义错误UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-6'>
            <div className='flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4'>
              <svg
                className='w-6 h-6 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>

            <h2 className='text-xl font-semibold text-gray-900 text-center mb-2'>
              页面出现错误
            </h2>

            <p className='text-gray-600 text-center mb-6'>
              很抱歉，页面遇到了一个意外错误。这可能是由于数据加载异常或网络问题导致的。
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className='mb-6 p-4 bg-gray-100 rounded-lg'>
                <h3 className='text-sm font-medium text-gray-900 mb-2'>
                  错误详情（开发模式）:
                </h3>
                <p className='text-xs text-red-600 mb-2'>
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className='text-xs text-gray-600 overflow-auto max-h-32'>
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className='flex space-x-3'>
              <button
                onClick={this.handleReset}
                className='flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors'
              >
                重试
              </button>
              <button
                onClick={this.handleReload}
                className='flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors'
              >
                刷新页面
              </button>
            </div>

            <div className='mt-4 text-center'>
              <p className='text-sm text-gray-500'>
                如果问题持续存在，请联系技术支持
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
