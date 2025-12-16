/**
 * 上传与解析服务（带 devMock）
 * - /api/upload 直传/预签名（此处前端模拟解析文本）
 */

const DEV_MOCK =
  String(process.env.REACT_APP_RESUME_DEV_MOCK || '').toLowerCase() === 'true';

/**
 * 获取认证Token（从localStorage）
 */
function getAuthToken(): string | null {
  try {
    // 尝试从localStorage获取token（支持多种key名称）
    const token =
      localStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('AUTH_TOKEN');
    return token;
  } catch {
    return null;
  }
}

export interface ParseResult {
  text: string;
  meta?: Record<string, unknown>;
}

const TEXT_MIME = [
  'text/plain',
  'text/markdown',
  'text/md',
  'application/json',
];
// 支持的文件类型：PDF、Word文档（.doc和.docx）、文本文件
const ALLOWED_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'text/md',
  'application/json',
  'application/pdf',
  'application/msword', // .doc 文件
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx 文件
];
// 支持的文件扩展名（作为MIME类型的补充验证）
const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
  '.md',
  '.markdown',
  '.json',
];
const MAX_SIZE = 5 * 1024 * 1024;

export function validateFile(file: File): { ok: boolean; reason?: string } {
  // 检查文件大小
  if (file.size > MAX_SIZE) {
    return { ok: false, reason: '文件超过 5MB 限制' };
  }

  // 检查文件扩展名
  const fileName = file.name || '';
  const nameLower = fileName.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext =>
    nameLower.endsWith(ext)
  );

  // 检查MIME类型（某些浏览器可能不返回正确的MIME类型，所以也要检查扩展名）
  const hasValidMimeType = !file.type || ALLOWED_MIME_TYPES.includes(file.type);

  // 如果MIME类型或扩展名任一匹配，就允许
  if (!hasValidMimeType && !hasValidExtension) {
    return {
      ok: false,
      reason: `不支持的文件类型。支持格式：PDF、Word文档（.doc/.docx）、文本文件（.txt/.md）`,
    };
  }

  return { ok: true };
}

export async function parse(file: File): Promise<ParseResult> {
  const valid = validateFile(file);
  if (!valid.ok) throw new Error(valid.reason || '文件无效');

  const nameLower = (file.name || '').toLowerCase();
  const isTextByExt = ['.txt', '.md', '.markdown', '.json'].some(ext =>
    nameLower.endsWith(ext)
  );
  const isTextByMime = TEXT_MIME.includes(file.type);

  // 本地纯文本解析（仅 devMock）
  if (DEV_MOCK) {
    if (TEXT_MIME.includes(file.type)) {
      const text = await file.text();
      return {
        text,
        meta: { name: file.name, size: file.size, type: file.type },
      };
    }
    // 其他类型返回占位
    return {
      text: '示例解析文本：经历1：……；经历2：……',
      meta: { name: file.name, size: file.size, type: file.type, mock: true },
    };
  }

  // 生产环境优化：对文本类型（按MIME或扩展名识别）直接前端读取，避免依赖后端
  if (isTextByMime || isTextByExt) {
    const text = await file.text();
    return {
      text,
      meta: {
        name: file.name,
        size: file.size,
        type: file.type || 'text/unknown',
        fallback: 'client-text',
      },
    };
  }

  // 真实后端
  const form = new FormData();
  form.append('file', file);
  try {
    // 获取认证Token
    const token = getAuthToken();
    const headers: HeadersInit = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    // 如果有token，添加到请求头
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 后端实际可用端点：/api/resume/upload
    // 🔧 修复：默认走前端代理 /api，必要时可通过 REACT_APP_DEV_API_URL 覆盖
    const apiBaseUrl =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1')
        ? process.env.REACT_APP_DEV_API_URL || '/api'
        : '/api';
    const res = await fetch(`${apiBaseUrl}/resume/upload`, {
      method: 'POST',
      body: form,
      credentials: 'include',
      headers,
    });
    if (!res.ok) {
      // 如果是401错误，提示用户登录
      if (res.status === 401) {
        throw new Error('需要登录后才能上传文件，请先登录');
      }

      // 尝试解析错误信息
      let errorMessage = `上传失败 (${res.status})`;
      try {
        const errorJson = await res.json();
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        // 如果无法解析JSON，使用状态码
      }

      // 兜底：后端异常时，对文本类型在前端直接读取，避免流程卡死
      if (isTextByMime || isTextByExt) {
        const text = await file.text();
        return {
          text,
          meta: {
            name: file.name,
            size: file.size,
            type: file.type || 'text/unknown',
            fallback: 'client',
          },
        };
      }
      throw new Error(errorMessage);
    }
    // 后端返回 ApiResponse 格式，data 为解析出的 candidateInfo
    const apiJson = await res.json();
    const data = apiJson?.data || apiJson?.result || apiJson;
    const textFromCandidate = JSON.stringify(data);
    return {
      text: textFromCandidate,
      meta: {
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        backend: true,
      },
    };
  } catch (err: unknown) {
    // 网络错误或其它异常，也尝试文本兜底
    if (isTextByMime || isTextByExt) {
      const text = await file.text();
      return {
        text,
        meta: {
          name: file.name,
          size: file.size,
          type: file.type || 'text/unknown',
          fallback: 'client-error',
        },
      };
    }
    // 改进错误信息，提供更友好的提示
    const error = err instanceof Error ? err : new Error('上传失败');

    // 检查是否是认证相关错误
    if (error.message.includes('需要登录') || error.message.includes('401')) {
      throw new Error('需要登录后才能上传文件，请先登录');
    }

    // 检查是否是网络连接错误
    if (
      error.message.includes('Failed to fetch') ||
      error.message.includes('ERR_CONNECTION_CLOSED') ||
      error.message.includes('NetworkError')
    ) {
      // 检查是否有token，如果没有，提示登录
      const token = getAuthToken();
      if (!token) {
        throw new Error('需要登录后才能上传文件，请先登录');
      }
      throw new Error(
        '无法连接到服务器，请检查网络连接或稍后重试。如果是PDF或Word文件，请尝试转换为文本文件后上传。'
      );
    }
    throw error;
  }
}
