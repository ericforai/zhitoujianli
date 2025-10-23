import React from 'react';

/**
 * 通用容器组件
 *
 * 提供统一的布局容器：
 * - 最大宽度限制
 * - 响应式水平内边距
 * - 可选的垂直间距
 */

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  paddingY?: boolean;
}

const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  size = 'xl',
  paddingY = false,
}) => {
  // 最大宽度样式
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  // 垂直间距
  const paddingYClasses = paddingY ? 'py-8' : '';

  const combinedClasses = `${sizeClasses[size]} mx-auto px-4 sm:px-6 lg:px-8 ${paddingYClasses} ${className}`;

  return <div className={combinedClasses}>{children}</div>;
};

export default Container;
