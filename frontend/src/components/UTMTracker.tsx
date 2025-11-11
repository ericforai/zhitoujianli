/**
 * UTM跟踪组件
 *
 * 功能：
 * 1. 在应用启动时捕获URL中的UTM参数
 * 2. 监听路由变化，发送页面浏览事件
 * 3. 将UTM参数发送到Google Analytics和百度统计
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analyticsService from '../services/analyticsService';
import utmTracker from '../utils/utmTracker';
import logger from '../utils/logger';

const utmLogger = logger.createChild('UTMTracker');

/**
 * UTM跟踪组件
 * 应该在App.tsx的Router内部使用，以便访问路由信息
 */
const UTMTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // 组件挂载时，捕获当前URL中的UTM参数
    const captureUTM = () => {
      const params = utmTracker.captureFromCurrentURL();
      if (utmTracker.isValid(params)) {
        utmLogger.info('✅ 捕获到UTM参数:', params);
        console.log('📊 [UTM跟踪] 捕获到UTM参数:', params);
        // 设置UTM参数到分析平台
        analyticsService.setUTMParams(params);
      } else {
        // 如果没有新的UTM参数，尝试使用存储的参数
        const storedParams = utmTracker.get();
        if (storedParams) {
          utmLogger.debug('使用存储的UTM参数:', storedParams);
          console.log('📊 [UTM跟踪] 使用存储的UTM参数:', storedParams);
          analyticsService.setUTMParams(storedParams);
        } else {
          console.log('📊 [UTM跟踪] 当前URL没有UTM参数，也没有存储的参数');
        }
      }
    };

    // 首次加载时捕获
    captureUTM();
  }, []); // 只在组件挂载时执行一次

  useEffect(() => {
    // 路由变化时，发送页面浏览事件
    const trackPageView = () => {
      const path = location.pathname + location.search;
      const title = document.title;

      utmLogger.debug(`页面浏览: ${path}`);

      // 发送页面浏览事件到分析平台
      analyticsService.trackPageView(path, title);
    };

    // 延迟一点时间，确保页面标题已更新
    const timer = setTimeout(trackPageView, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname, location.search]); // 路由变化时触发

  // 此组件不渲染任何内容
  return null;
};

export default UTMTracker;
