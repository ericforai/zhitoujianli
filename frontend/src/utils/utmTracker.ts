/**
 * UTM参数跟踪工具类
 *
 * 功能：
 * 1. 解析URL中的UTM参数
 * 2. 存储UTM参数到localStorage（会话期间保持）
 * 3. 提供UTM参数获取接口
 * 4. 支持UTM参数清理
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */

/**
 * UTM参数接口定义
 */
export interface UTMParams {
  utm_source?: string; // 来源（如：wechat, zhihu, douyin）
  utm_medium?: string; // 媒介（如：social, email, cpc）
  utm_campaign?: string; // 活动名称（如：spring_promotion）
  utm_term?: string; // 关键词（可选）
  utm_content?: string; // 内容标识（可选）
}

/**
 * UTM参数存储键名
 */
const UTM_STORAGE_KEY = 'zhitoujianli_utm_params';
const UTM_TIMESTAMP_KEY = 'zhitoujianli_utm_timestamp';

/**
 * UTM参数有效期（毫秒）
 * 默认30天，可根据需求调整
 */
const UTM_EXPIRY_DAYS = 30;
const UTM_EXPIRY_MS = UTM_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

/**
 * UTM跟踪工具类
 */
class UTMTracker {
  /**
   * 从URL查询参数中解析UTM参数
   * @param searchParams URL查询参数字符串或URLSearchParams对象
   * @returns UTM参数对象
   */
  parseFromURL(searchParams?: string | URLSearchParams): UTMParams {
    const params: UTMParams = {};

    let urlParams: URLSearchParams;
    if (typeof searchParams === 'string') {
      urlParams = new URLSearchParams(searchParams);
    } else if (searchParams instanceof URLSearchParams) {
      urlParams = searchParams;
    } else {
      // 如果没有提供参数，从当前URL解析
      urlParams = new URLSearchParams(window.location.search);
    }

    // 提取所有UTM参数
    const utmKeys: (keyof UTMParams)[] = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
    ];

    utmKeys.forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        params[key] = value;
      }
    });

    return params;
  }

  /**
   * 检查UTM参数是否有效（非空）
   * @param params UTM参数对象
   * @returns 是否有效
   */
  isValid(params: UTMParams): boolean {
    return Object.keys(params).length > 0;
  }

  /**
   * 保存UTM参数到localStorage
   * @param params UTM参数对象
   */
  save(params: UTMParams): void {
    if (!this.isValid(params)) {
      return;
    }

    try {
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params));
      localStorage.setItem(UTM_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.warn('保存UTM参数失败:', error);
    }
  }

  /**
   * 从localStorage获取UTM参数
   * @returns UTM参数对象或null
   */
  get(): UTMParams | null {
    try {
      const stored = localStorage.getItem(UTM_STORAGE_KEY);
      const timestamp = localStorage.getItem(UTM_TIMESTAMP_KEY);

      if (!stored || !timestamp) {
        return null;
      }

      // 检查是否过期
      const storedTime = parseInt(timestamp, 10);
      const now = Date.now();
      if (now - storedTime > UTM_EXPIRY_MS) {
        // 已过期，清除
        this.clear();
        return null;
      }

      return JSON.parse(stored) as UTMParams;
    } catch (error) {
      console.warn('获取UTM参数失败:', error);
      return null;
    }
  }

  /**
   * 清除UTM参数
   */
  clear(): void {
    try {
      localStorage.removeItem(UTM_STORAGE_KEY);
      localStorage.removeItem(UTM_TIMESTAMP_KEY);
    } catch (error) {
      console.warn('清除UTM参数失败:', error);
    }
  }

  /**
   * 获取当前URL中的UTM参数并保存
   * 如果URL中有新的UTM参数，会覆盖旧的
   */
  captureFromCurrentURL(): UTMParams {
    const params = this.parseFromURL();
    if (this.isValid(params)) {
      this.save(params);
    }
    return params;
  }

  /**
   * 获取所有UTM参数（优先使用URL中的，如果没有则使用存储的）
   * @returns UTM参数对象
   */
  getAll(): UTMParams {
    // 先尝试从当前URL获取
    const urlParams = this.parseFromURL();
    if (this.isValid(urlParams)) {
      return urlParams;
    }

    // 如果URL中没有，尝试从存储中获取
    const storedParams = this.get();
    return storedParams || {};
  }

  /**
   * 将UTM参数转换为查询字符串
   * @param params UTM参数对象
   * @returns 查询字符串（不含?）
   */
  toQueryString(params: UTMParams): string {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        urlParams.append(key, value);
      }
    });
    return urlParams.toString();
  }
}

/**
 * 导出单例
 */
const utmTracker = new UTMTracker();

export default utmTracker;
