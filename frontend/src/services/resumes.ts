/**
 * 历史记录服务（devMock 使用 localStorage，预留后端接口）
 * ✅ 修复：使用用户ID作为localStorage key的一部分，实现数据隔离
 */
import type { GenerateResponse } from '../types/resume';
import { authService } from './authService';
import config from '../config/environment';

export interface HistoryItem {
  id: string;
  createdAt: string;
  type: '模板' | '优化';
  score?: number;
  exportCount?: number;
  downloadUrl?: string;
  meta?: Record<string, unknown>;
}

// ✅ 修复：根据用户ID生成存储key，实现数据隔离
function getStorageKey(): string {
  const user = authService.getCachedUser();
  const userId = user?.userId || 'anonymous';
  return `resume_history_records_${userId}`;
}

// ✅ 修复：清理旧的全局存储key（兼容性处理）
function cleanupOldStorage(): void {
  try {
    const oldKey = 'resume_history_records';
    const oldData = localStorage.getItem(oldKey);
    if (oldData) {
      console.warn('⚠️ 检测到旧的全局存储数据，已清理');
      localStorage.removeItem(oldKey);
    }
  } catch {
    // ignore
  }
}

function load(): HistoryItem[] {
  // ✅ 修复：清理旧的全局存储
  cleanupOldStorage();

  try {
    const storageKey = getStorageKey();
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

function save(list: HistoryItem[]) {
  try {
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(list));
  } catch (error) {
    console.error('保存简历历史记录失败:', error);
  }
}

async function listRemote(): Promise<HistoryItem[] | null> {
  try {
    // ✅ 修复：使用统一的API客户端，自动添加认证头
    // 🔧 修复：apiClient的baseURL已经包含/api，所以路径不需要再加/api前缀
    const apiClient = (await import('./apiService')).default;
    const response = await apiClient.get('/resume/history?page=1&pageSize=20');

    const items: any[] = (response?.data as any)?.items || response?.data || [];
    if (Array.isArray(items)) {
      // 转换后端数据格式到前端格式
      return items.map((item: any) => ({
        id: item.id?.toString() || `h_${Date.now()}`,
        createdAt: item.createdAt || item.created_at || new Date().toISOString(),
        type: item.type || '优化',
        score: item.score,
        exportCount: item.exportCount || item.export_count || 0,
        downloadUrl: item.downloadUrl || item.download_url,
        meta: typeof item.meta === 'string' ? JSON.parse(item.meta) : item.meta
      })) as HistoryItem[];
    }
    return null;
  } catch (error) {
    console.warn('获取远程简历历史记录失败，使用本地存储:', error);
    return null;
  }
}

export async function list(): Promise<HistoryItem[]> {
  const remote = await listRemote();
  if (remote && Array.isArray(remote) && remote.length >= 0) {
    return remote.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  return load().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createVersion(params: {
  type: '模板' | '优化';
  score?: number;
  result?: GenerateResponse;
  downloadUrl?: string;
  meta?: Record<string, unknown>;
}): Promise<HistoryItem> {
  // ✅ 修复：尝试后端优先，使用统一的API客户端
  // 🔧 修复：apiClient的baseURL已经包含/api，所以路径不需要再加/api前缀
  try {
    const apiClient = (await import('./apiService')).default;
    const response = await apiClient.post('/resume/history', params);

    if (response.data?.success !== false && response.data?.data) {
      const item = response.data.data;
      return {
        id: item.id?.toString() || `h_${Date.now()}`,
        createdAt: item.createdAt || item.created_at || new Date().toISOString(),
        type: item.type || params.type,
        score: item.score,
        exportCount: item.exportCount || item.export_count || 0,
        downloadUrl: item.downloadUrl || item.download_url,
        meta: typeof item.meta === 'string' ? JSON.parse(item.meta) : item.meta
      } as HistoryItem;
    }
  } catch (error) {
    console.warn('创建远程简历历史记录失败，使用本地存储:', error);
  }
  const now = new Date().toISOString();
  const item: HistoryItem = {
    id: `h_${Date.now()}`,
    createdAt: now,
    type: params.type,
    score: params.score,
    exportCount: 0,
    downloadUrl: params.downloadUrl,
    meta: params.meta
  };
  const listData = load();
  listData.unshift(item);
  save(listData);
  return item;
}

export async function incrementExport(id: string, downloadUrl?: string) {
  // 尝试后端优先
  try {
    const res = await fetch(`${config.apiBaseUrl}/resume/history/${encodeURIComponent(id)}/export`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/json' },
      body: JSON.stringify({ downloadUrl })
    });
    if (res.ok) return;
  } catch {
    // ignore
  }
  const listData = load();
  const idx = listData.findIndex(i => i.id === id);
  if (idx >= 0) {
    listData[idx].exportCount = (listData[idx].exportCount || 0) + 1;
    if (downloadUrl) listData[idx].downloadUrl = downloadUrl;
    save(listData);
  }
}

export async function get(id: string): Promise<HistoryItem | null> {
  // 可扩展后端 GET /api/resume/history/{id}
  const listData = load();
  return listData.find(i => i.id === id) || null;
}

export async function replaceMeta(id: string, metaPatch: Record<string, unknown>): Promise<void> {
  const listData = load();
  const idx = listData.findIndex(i => i.id === id);
  if (idx >= 0) {
    const prev = listData[idx].meta || {};
    listData[idx].meta = { ...prev, ...metaPatch };
    save(listData);
  }
  // 后端存在时可同时 PATCH /api/resume/history/{id}
  try {
    await fetch(`${config.apiBaseUrl}/resume/history/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ meta: metaPatch })
    });
  } catch {
    // ignore
  }
}

/**
 * ✅ 修复：清理当前用户的简历历史记录（用于登出时）
 */
export function clearUserHistory(): void {
  try {
    const storageKey = getStorageKey();
    localStorage.removeItem(storageKey);
    console.log('✅ 已清理用户简历历史记录');
  } catch (error) {
    console.error('清理简历历史记录失败:', error);
  }
}

/**
 * ✅ 修复：清理所有旧的全局存储数据（用于登录时）
 */
export function cleanupAllOldStorage(): void {
  try {
    // 清理旧的全局key
    cleanupOldStorage();

    // 清理所有可能的旧格式key（兼容性处理）
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('resume_history_records') && !key.includes('_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`✅ 已清理旧的存储key: ${key}`);
    });
  } catch (error) {
    console.error('清理旧存储失败:', error);
  }
}


