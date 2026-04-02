/**
 * 桌面端 API 配置（与网站后端打通，默认生产环境）
 */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (raw && typeof raw === 'string' && raw.length > 0) {
    return raw.replace(/\/$/, '');
  }
  return 'https://www.zhitoujianli.com/api';
}

/** 从 /api 基址推导站点根（供本地 Agent --api 使用） */
export function apiOriginFromBase(apiBase: string): string {
  const u = apiBase.replace(/\/$/, '');
  if (u.endsWith('/api')) {
    return u.slice(0, -4);
  }
  return u;
}
