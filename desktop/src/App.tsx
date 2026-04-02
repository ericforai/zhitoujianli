import { useCallback, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import { loginByEmail } from './api/login';
import { apiOriginFromBase, getApiBaseUrl } from './config';
import type { AgentDiagnose } from './types';

const TOKEN_KEY = 'ztjl_desktop_token';

function formatInvokeError(err: unknown): string {
  if (typeof err === 'string') {
    return err;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
}

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [agentRunning, setAgentRunning] = useState(false);
  const [diagnose, setDiagnose] = useState<AgentDiagnose | null>(null);
  const [installLog, setInstallLog] = useState<string | null>(null);

  const apiBase = getApiBaseUrl();
  const apiOrigin = apiOriginFromBase(apiBase);

  const refreshAgentStatus = useCallback(async () => {
    try {
      const running = await invoke<boolean>('agent_status');
      setAgentRunning(running);
    } catch {
      setAgentRunning(false);
    }
  }, []);

  const runDiagnose = useCallback(async () => {
    try {
      const d = await invoke<AgentDiagnose>('agent_diagnose');
      setDiagnose(d);
    } catch (e) {
      setDiagnose(null);
      setMsg({ type: 'err', text: formatInvokeError(e) });
    }
  }, []);

  useEffect(() => {
    void refreshAgentStatus();
    const t = setInterval(() => void refreshAgentStatus(), 5000);
    return () => clearInterval(t);
  }, [refreshAgentStatus]);

  useEffect(() => {
    if (token) {
      void runDiagnose();
    }
  }, [token, runDiagnose]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const r = await loginByEmail(email.trim(), password);
      if (r.success && r.token) {
        localStorage.setItem(TOKEN_KEY, r.token);
        setToken(r.token);
        setPassword('');
        setMsg({
          type: 'ok',
          text: r.user?.username
            ? `已登录：${r.user.username}`
            : '登录成功，可与网站账号体系共用 JWT。',
        });
      } else {
        setMsg({ type: 'err', text: r.message || '登录失败' });
      }
    } catch (err) {
      const text =
        err instanceof Error ? err.message : '网络异常（含证书/代理问题）';
      setMsg({ type: 'err', text });
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setDiagnose(null);
    setInstallLog(null);
    setMsg({ type: 'ok', text: '已退出登录' });
  }

  async function handleInstallDeps() {
    setInstallLog(null);
    setMsg(null);
    setBusy(true);
    try {
      const log = await invoke<string>('agent_install_deps');
      setInstallLog(log);
      setMsg({ type: 'ok', text: '依赖安装完成，请查看下方日志。' });
      await runDiagnose();
    } catch (e) {
      const text = formatInvokeError(e);
      setInstallLog(text);
      setMsg({ type: 'err', text: '依赖安装失败，见下方日志。' });
    } finally {
      setBusy(false);
    }
  }

  async function handleStartAgent() {
    if (!token) return;
    setMsg(null);
    setBusy(true);
    try {
      await invoke('agent_start', {
        token,
        apiOrigin,
      });
      setMsg({
        type: 'ok',
        text: '本地投递引擎已启动（Token 模式）。请在弹出的浏览器中完成 Boss 登录。',
      });
      await refreshAgentStatus();
    } catch (e) {
      setMsg({ type: 'err', text: formatInvokeError(e) });
    } finally {
      setBusy(false);
    }
  }

  async function handleStopAgent() {
    setBusy(true);
    try {
      await invoke('agent_stop');
      setMsg({ type: 'ok', text: '已停止本地引擎' });
      await refreshAgentStatus();
    } catch (e) {
      setMsg({ type: 'err', text: formatInvokeError(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app">
      <div className="card">
        <h1>智投简历 · 本地桌面端</h1>
        <p className="sub">
          与网站共用账号与 JWT；本地启动 Boss 投递引擎（Playwright）。
        </p>
        <p className="sub tight">
          API：<code>{apiBase}</code>
        </p>

        {!token ? (
          <form onSubmit={handleLogin}>
            <label htmlFor="email">邮箱</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <label htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <div className="row">
              <button className="btn-primary" type="submit" disabled={busy}>
                {busy ? '登录中…' : '登录'}
              </button>
              <button
                className="btn-secondary"
                type="button"
                onClick={() =>
                  void openUrl('https://www.zhitoujianli.com/register')
                }
              >
                去网站注册
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="sub">已登录，Token 保存在本机 localStorage。</p>

            {diagnose && (
              <div className="diagnose">
                <div className="diagnose-title">环境检测</div>
                <ul className="diagnose-list">
                  <li>
                    Python：{diagnose.python_exe || '未检测到'}
                    {diagnose.python_version && (
                      <span className="muted"> ({diagnose.python_version})</span>
                    )}
                  </li>
                  <li>
                    Agent 脚本：{diagnose.script_ok ? '✓' : '✗'}{' '}
                    {diagnose.script_path || '—'}
                  </li>
                  <li>
                    requirements.txt：{diagnose.requirements_ok ? '✓' : '✗'}{' '}
                    {diagnose.requirements_path || '—'}
                  </li>
                </ul>
                <p className="diagnose-summary">{diagnose.summary}</p>
              </div>
            )}

            <div className="row">
              <button
                className="btn-secondary"
                type="button"
                disabled={busy}
                onClick={() => void runDiagnose()}
              >
                重新检测环境
              </button>
              <button
                className="btn-secondary"
                type="button"
                disabled={busy}
                onClick={() => void handleInstallDeps()}
              >
                安装 Python 依赖
              </button>
            </div>

            <div className="row">
              <button className="btn-secondary" type="button" onClick={handleLogout}>
                退出登录
              </button>
              <button
                className="btn-secondary"
                type="button"
                onClick={() => void openUrl('https://www.zhitoujianli.com')}
              >
                打开网站
              </button>
            </div>

            <div className="row" style={{ marginTop: '1rem' }}>
              {!agentRunning ? (
                <button
                  className="btn-primary"
                  type="button"
                  disabled={busy}
                  onClick={() => void handleStartAgent()}
                >
                  启动本地投递引擎
                </button>
              ) : (
                <button
                  className="btn-danger"
                  type="button"
                  disabled={busy}
                  onClick={() => void handleStopAgent()}
                >
                  停止本地引擎
                </button>
              )}
            </div>

            {installLog && (
              <pre className="install-log">{installLog}</pre>
            )}

            <p className="hint">
              首次使用请先点「安装 Python 依赖」（pip + Playwright
              Chromium）。登录走系统 WebView，引擎启动使用 JWT，无需在终端里配证书。
            </p>
          </>
        )}

        {msg && (
          <div
            className={`msg ${msg.type === 'ok' ? 'msg-ok' : 'msg-error'}`}
            role="alert"
          >
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}
