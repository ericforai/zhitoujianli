/**
 * Boss登录组件 - 手动Cookie上传方案
 *
 * 由于服务器无图形界面，无法生成二维码
 * 改为用户本地登录后手动上传Cookie的方案
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-06
 * @updated 2025-12-12 - 修复：服务器无法生成二维码，改为手动Cookie上传
 */

import React from 'react';
import BossCookieUploadManual from './BossCookieUploadManual';

interface BossCookieUploadProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BossCookieUpload: React.FC<BossCookieUploadProps> = ({
  onSuccess,
  onCancel,
}) => {
  // 使用手动Cookie上传组件（服务器无法生成二维码）
  return <BossCookieUploadManual onSuccess={onSuccess} onCancel={onCancel} />;
};

export default BossCookieUpload;
