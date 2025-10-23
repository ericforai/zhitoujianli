import React from 'react';

/**
 * 通用卡片组件
 *
 * 提供统一的卡片样式：
 * - 白色背景
 * - 圆角
 * - 阴影效果
 * - 可选的 hover 效果
 */

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  onClick,
}) => {
  // 基础样式
  const baseClasses = 'bg-white rounded-lg border border-gray-200';

  // Hover 效果
  const hoverClasses = hover
    ? 'hover:shadow-md transition-shadow duration-200 cursor-pointer'
    : 'shadow-sm';

  // 内边距样式
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-10',
  };

  const combinedClasses = `${baseClasses} ${hoverClasses} ${paddingClasses[padding]} ${className}`;

  return (
    <div className={combinedClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;

