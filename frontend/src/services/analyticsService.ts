/**
 * 分析服务 - 集成Google Analytics和百度统计
 *
 * 功能：
 * 1. 发送页面浏览事件到GA4和百度统计
 * 2. 发送UTM参数到分析平台
 * 3. 统一的分析事件接口
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */

import utmTracker, { type UTMParams } from '../utils/utmTracker';

/**
 * Google Analytics配置
 */
const GA4_ID = 'G-S6YNCB5EDV';

/**
 * 百度统计配置
 * 注意：百度统计ID已在index.html中配置，此处仅作为配置记录
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BAIDU_ID = '2c9f06c803ae303bff22ada442c6c271';

/**
 * 检查Google Analytics是否已加载
 */
function isGA4Loaded(): boolean {
  return (
    typeof window !== 'undefined' && typeof (window as any).gtag === 'function'
  );
}

/**
 * 检查百度统计是否已加载
 */
function isBaiduLoaded(): boolean {
  return (
    typeof window !== 'undefined' && typeof (window as any)._hmt !== 'undefined'
  );
}

/**
 * 分析服务类
 */
class AnalyticsService {
  /**
   * 发送页面浏览事件到Google Analytics
   * @param path 页面路径
   * @param title 页面标题
   * @param utmParams UTM参数（可选）
   */
  trackPageViewGA4(path: string, title?: string, utmParams?: UTMParams): void {
    if (!isGA4Loaded()) {
      console.warn('Google Analytics未加载');
      return;
    }

    try {
      const gtag = (window as any).gtag;

      // 构建事件参数
      const eventParams: Record<string, any> = {
        page_path: path,
        page_title: title || document.title,
        page_location: window.location.href,
      };

      // 添加UTM参数
      if (utmParams) {
        Object.entries(utmParams).forEach(([key, value]) => {
          if (value) {
            // GA4使用自定义维度存储UTM参数
            eventParams[key] = value;
          }
        });
      }

      // 发送页面浏览事件
      gtag('event', 'page_view', eventParams);

      // 如果有UTM参数，也设置到config中
      if (utmParams && Object.keys(utmParams).length > 0) {
        gtag('config', GA4_ID, {
          custom_map: {
            dimension1: 'utm_source',
            dimension2: 'utm_medium',
            dimension3: 'utm_campaign',
            dimension4: 'utm_term',
            dimension5: 'utm_content',
          },
          ...utmParams,
        });
      }
    } catch (error) {
      console.error('发送GA4页面浏览事件失败:', error);
    }
  }

  /**
   * 发送页面浏览事件到百度统计
   * @param path 页面路径
   * @param title 页面标题
   * @param utmParams UTM参数（可选）
   */
  trackPageViewBaidu(
    path: string,
    title?: string,
    utmParams?: UTMParams
  ): void {
    if (!isBaiduLoaded()) {
      console.warn('百度统计未加载');
      return;
    }

    try {
      const _hmt = (window as any)._hmt;

      // 百度统计的页面浏览跟踪（包含UTM参数的完整路径）
      // 百度统计会自动识别URL中的UTM参数，所以我们将UTM参数附加到路径中
      let trackPath = path;
      if (utmParams && Object.keys(utmParams).length > 0) {
        const utmQuery = utmTracker.toQueryString(utmParams);
        trackPath = `${path}?${utmQuery}`;
      }
      _hmt.push(['_trackPageview', trackPath]);

      // 方法1：使用自定义变量（需要在百度统计后台配置）
      // 注意：自定义变量需要在百度统计后台先设置才能使用
      if (utmParams) {
        Object.entries(utmParams).forEach(([key, value], index) => {
          if (value && index < 5) {
            // 百度统计使用_setCustomVar设置自定义变量
            // 格式：_hmt.push(['_setCustomVar', slot, name, value, scope]);
            // slot: 1-5, name: 变量名, value: 变量值, scope: 1(访问级)或2(页面级)
            // 注意：slot从1开始，不是0
            _hmt.push(['_setCustomVar', index + 1, key, value, 1]);
          }
        });
      }

      // 方法2：使用事件跟踪（不需要后台配置，推荐）
      // 将UTM参数作为事件参数发送
      if (utmParams && Object.keys(utmParams).length > 0) {
        Object.entries(utmParams).forEach(([key, value]) => {
          if (value) {
            // 百度统计事件跟踪
            // 格式：_hmt.push(['_trackEvent', category, action, opt_label, opt_value]);
            _hmt.push(['_trackEvent', 'utm_params', key, value]);
            console.log(`📊 百度统计UTM事件已发送: ${key} = ${value}`);
          }
        });
        console.log('✅ 百度统计UTM参数已发送:', utmParams);
      }
    } catch (error) {
      console.error('发送百度统计页面浏览事件失败:', error);
    }
  }

  /**
   * 发送页面浏览事件（同时发送到GA4和百度统计）
   * @param path 页面路径
   * @param title 页面标题
   */
  trackPageView(path: string, title?: string): void {
    // 获取UTM参数
    const utmParams = utmTracker.getAll();

    // 发送到Google Analytics
    this.trackPageViewGA4(path, title, utmParams);

    // 发送到百度统计
    this.trackPageViewBaidu(path, title, utmParams);
  }

  /**
   * 设置UTM参数到分析平台
   * @param utmParams UTM参数
   */
  setUTMParams(utmParams: UTMParams): void {
    if (!utmTracker.isValid(utmParams)) {
      return;
    }

    // 设置到GA4
    if (isGA4Loaded()) {
      try {
        const gtag = (window as any).gtag;
        gtag('config', GA4_ID, {
          ...utmParams,
        });
      } catch (error) {
        console.error('设置GA4 UTM参数失败:', error);
      }
    }

    // 设置到百度统计
    if (isBaiduLoaded()) {
      try {
        const _hmt = (window as any)._hmt;

        // 方法1：使用自定义变量（需要在百度统计后台配置）
        Object.entries(utmParams).forEach(([key, value], index) => {
          if (value && index < 5) {
            _hmt.push(['_setCustomVar', index + 1, key, value, 1]);
          }
        });

        // 方法2：使用事件跟踪（推荐，不需要后台配置）
        Object.entries(utmParams).forEach(([key, value]) => {
          if (value) {
            _hmt.push(['_trackEvent', 'utm_params', key, value]);
          }
        });
      } catch (error) {
        console.error('设置百度统计UTM参数失败:', error);
      }
    }
  }

  /**
   * 跟踪转化事件（如注册、登录等）
   * @param eventName 事件名称（如：sign_up, login）
   * @param eventParams 事件参数
   */
  trackConversion(eventName: string, eventParams?: Record<string, any>): void {
    // 获取UTM参数
    const utmParams = utmTracker.getAll();

    // 构建完整的事件参数
    const fullParams: Record<string, any> = {
      ...eventParams,
      ...utmParams,
    };

    // 发送到Google Analytics
    if (isGA4Loaded()) {
      try {
        const gtag = (window as any).gtag;
        gtag('event', eventName, fullParams);
        console.log(`✅ GA4转化事件已发送: ${eventName}`, fullParams);
      } catch (error) {
        console.error('发送GA4转化事件失败:', error);
      }
    }

    // 发送到百度统计（使用自定义事件）
    if (isBaiduLoaded()) {
      try {
        const _hmt = (window as any)._hmt;
        // 百度统计使用_trackEvent跟踪自定义事件
        // 格式：_hmt.push(['_trackEvent', category, action, opt_label, opt_value]);
        _hmt.push([
          '_trackEvent',
          'conversion',
          eventName,
          JSON.stringify(fullParams),
        ]);
        console.log(`✅ 百度统计转化事件已发送: ${eventName}`, fullParams);
      } catch (error) {
        console.error('发送百度统计转化事件失败:', error);
      }
    }
  }
}

/**
 * 导出单例
 */
const analyticsService = new AnalyticsService();

export default analyticsService;
