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

export async function list(): Promise<HistoryItem[]> {
  return load().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createVersion(params: {
  type: '模板' | '优化';
  score?: number;
  result?: GenerateResponse;
  downloadUrl?: string;
  meta?: Record<string, unknown>;
}): Promise<HistoryItem> {
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
  const listData = load();
  const idx = listData.findIndex(i => i.id === id);
  if (idx >= 0) {
    listData[idx].exportCount = (listData[idx].exportCount || 0) + 1;
    if (downloadUrl) listData[idx].downloadUrl = downloadUrl;
    save(listData);
  }
}


