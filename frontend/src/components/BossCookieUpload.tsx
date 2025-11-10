/**
 * Boss登录组件 - 服务器端扫码登录
 *
 * 使用服务器端扫码登录，无需手动提取Cookie
 * 扫码后Cookie自动保存
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-06
 * @updated 2025-11-06 - 移除手动Cookie提取，改为服务器端扫码登录
 */

import React from 'react';
import BossServerLogin from './BossServerLogin';

interface BossCookieUploadProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BossCookieUpload: React.FC<BossCookieUploadProps> = ({
  onSuccess,
  onCancel,
}) => {
  // 直接使用服务器端扫码登录组件
  return <BossServerLogin onSuccess={onSuccess} onCancel={onCancel} />;
};

export default BossCookieUpload;
