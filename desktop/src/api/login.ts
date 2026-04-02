import { getApiBaseUrl } from '../config';

export interface UserInfo {
  userId?: string;
  email?: string;
  username?: string;
  name?: string;
}

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: UserInfo;
  message?: string;
}

/**
 * 邮箱密码登录（普通用户走 /auth/login/email，与网站一致）
 */
export async function loginByEmail(
  email: string,
  password: string
): Promise<LoginResult> {
  const base = getApiBaseUrl();
  const isAdmin = email === 'admin@zhitoujianli.com';
  const path = isAdmin ? '/admin/auth/login' : '/auth/login/email';
  const url = `${base}${path}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    const msg =
      typeof data.message === 'string'
        ? data.message
        : `HTTP ${res.status}`;
    return { success: false, message: msg };
  }

  const success = data.success === true;
  let token: string | undefined =
    typeof data.token === 'string' ? data.token : undefined;
  if (!token && data.data && typeof data.data === 'object') {
    const d = data.data as Record<string, unknown>;
    if (typeof d.accessToken === 'string') {
      token = d.accessToken;
    } else if (typeof d.token === 'string') {
      token = d.token;
    }
  }

  let user: UserInfo | undefined;
  if (data.user && typeof data.user === 'object') {
    user = data.user as UserInfo;
  } else if (data.data && typeof data.data === 'object') {
    const d = data.data as Record<string, unknown>;
    if (d.user && typeof d.user === 'object') {
      user = d.user as UserInfo;
    }
  }

  const message =
    typeof data.message === 'string' ? data.message : undefined;

  if (success && token) {
    return { success: true, token, user, message };
  }
  return {
    success: false,
    message: message || '登录失败',
  };
}
