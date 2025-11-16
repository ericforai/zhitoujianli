/**
 * 历史记录服务（devMock 使用 localStorage，预留后端接口）
 */
import type { GenerateResponse } from '../types/resume';

export interface HistoryItem {
  id: string;
  createdAt: string;
  type: '模板' | '优化';
  score?: number;
  exportCount?: number;
  downloadUrl?: string;
  meta?: Record<string, unknown>;
}

const STORAGE_KEY = 'resume_history_records';

function load(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

function save(list: HistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

async function listRemote(): Promise<HistoryItem[] | null> {
  try {
    const res = await fetch('/api/resume/history?page=1&pageSize=20', {
      credentials: 'include',
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
    });
    if (!res.ok) return null;
    const body: any = await res.json();
    const items: any[] = body?.data?.items || body?.data || [];
    if (!Array.isArray(items)) return null;
    return items as HistoryItem[];
  } catch {
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
  // 尝试后端优先
  try {
    const res = await fetch('/api/resume/history', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      const body: any = await res.json();
      if (body?.data) return body.data as HistoryItem;
    }
  } catch {
    // ignore
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
    const res = await fetch(`/api/resume/history/${encodeURIComponent(id)}/export`, {
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
    await fetch(`/api/resume/history/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ meta: metaPatch })
    });
  } catch {
    // ignore
  }
}


