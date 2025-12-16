import React from 'react';
import PrivateRoute from '../../components/PrivateRoute';

/**
 * 简历模块的受保护路由薄封装
 * 复用现有 PrivateRoute（接入 AuthContext），避免引入新认证实现
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <PrivateRoute>{children}</PrivateRoute>;
};

export default ProtectedRoute;
