/**
 * 上传与解析服务（带 devMock）
 * - /api/upload 直传/预签名（此处前端模拟解析文本）
 */

const DEV_MOCK = String(process.env.REACT_APP_RESUME_DEV_MOCK || '').toLowerCase() === 'true';

export interface ParseResult {
  text: string;
  meta?: Record<string, unknown>;
}

const TEXT_MIME = ['text/plain', 'text/markdown', 'text/md', 'application/json'];
const ALLOWED = ['text/plain', 'text/markdown', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/md', 'application/json'];
const MAX_SIZE = 5 * 1024 * 1024;

export function validateFile(file: File): { ok: boolean; reason?: string } {
  if (!ALLOWED.includes(file.type)) return { ok: false, reason: '不支持的文件类型' };
  if (file.size > MAX_SIZE) return { ok: false, reason: '文件超过 5MB 限制' };
  return { ok: true };
}

export async function parse(file: File): Promise<ParseResult> {
  const valid = validateFile(file);
  if (!valid.ok) throw new Error(valid.reason || '文件无效');

  // 本地纯文本解析（仅 devMock）
  if (DEV_MOCK) {
    if (TEXT_MIME.includes(file.type)) {
      const text = await file.text();
      return { text, meta: { name: file.name, size: file.size, type: file.type } };
    }
    // 其他类型返回占位
    return {
      text: '示例解析文本：经历1：……；经历2：……',
      meta: { name: file.name, size: file.size, type: file.type, mock: true }
    };
  }

  // 真实后端
  const form = new FormData();
  form.append('file', file);
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: form, credentials: 'include' });
    if (!res.ok) {
      // 兜底：后端异常时，对文本类型在前端直接读取，避免流程卡死
      if (TEXT_MIME.includes(file.type)) {
        const text = await file.text();
        return { text, meta: { name: file.name, size: file.size, type: file.type, fallback: 'client' } };
      }
      throw new Error(`Upload failed: ${res.status}`);
    }
    return (await res.json()) as ParseResult;
  } catch (err) {
    // 网络错误或其它异常，也尝试文本兜底
    if (TEXT_MIME.includes(file.type)) {
      const text = await file.text();
      return { text, meta: { name: file.name, size: file.size, type: file.type, fallback: 'client-error' } };
    }
    throw err;
  }
}


