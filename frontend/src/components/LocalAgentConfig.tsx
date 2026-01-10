/**
 * 本地Agent配置组件
 * 用于管理本地投递Agent的Token和连接状态
 *
 * @author ZhiTouJianLi Team
 * @since 2025-12-18
 */

import React, { useState, useEffect, useCallback } from 'react';
import { localAgentService, AgentStatus } from '../services/localAgentService';

interface TokenInfo {
  token: string;
  expiresIn: number;
  serverUrl: string;
  usage: string;
  generatedAt: number;
}

// 检测操作系统
const getOS = (): 'windows' | 'mac' | 'linux' => {
  const platform = navigator.platform.toLowerCase();
  if (platform.includes('win')) return 'windows';
  if (platform.includes('mac')) return 'mac';
  return 'linux';
};

const LocalAgentConfig: React.FC = () => {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const os = getOS();

  // 生成一键复制的完整启动命令
  const getFullCommand = (token: string) => {
    // 通用命令：进入目录 -> 安装依赖 -> 运行（使用 --token 参数）
    return `cd ~/Downloads/local-agent && pip3 install -r requirements.txt && python3 boss_local_agent.py --token ${token}`;
  };

  // 加载Agent状态
  const loadAgentStatus = useCallback(async () => {
    try {
      const status = await localAgentService.getAgentStatus();
      setAgentStatus(status);
    } catch (err) {
      console.error('获取Agent状态失败:', err);
    }
  }, []);

  // 定时刷新状态
  useEffect(() => {
    loadAgentStatus();
    const interval = setInterval(() => {
      loadAgentStatus();
    }, 10000); // 每10秒刷新
    return () => clearInterval(interval);
    // ✅ 修复：loadAgentStatus是稳定的useCallback，但为了安全，只在挂载时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 生成Token
  const handleGenerateToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await localAgentService.generateToken();
      setTokenInfo({
        ...result,
        generatedAt: Date.now(),
      });
      // 刷新状态
      loadAgentStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成Token失败');
    } finally {
      setLoading(false);
    }
  };

  // 撤销Token
  const handleRevokeToken = async () => {
    if (!tokenInfo?.token) return;

    if (!window.confirm('确定要撤销当前Token吗？撤销后本地Agent将无法连接。')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await localAgentService.revokeToken(tokenInfo.token);
      setTokenInfo(null);
      loadAgentStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : '撤销Token失败');
    } finally {
      setLoading(false);
    }
  };

  // 复制Token
  const handleCopyToken = async () => {
    if (!tokenInfo?.token) return;

    try {
      await navigator.clipboard.writeText(tokenInfo.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = tokenInfo.token;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 复制启动命令
  const handleCopyCommand = async () => {
    if (!tokenInfo?.token) return;

    const fullCommand = getFullCommand(tokenInfo.token);
    try {
      await navigator.clipboard.writeText(fullCommand);
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 2000);
    } catch (err) {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = fullCommand;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 2000);
    }
  };

  // 获取状态显示
  const getStatusDisplay = () => {
    if (!agentStatus) {
      return { text: '未知', color: 'gray', icon: '❓' };
    }

    if (agentStatus.online) {
      switch (agentStatus.status) {
        case 'ONLINE':
          return { text: '在线', color: 'green', icon: '🟢' };
        case 'BUSY':
          return { text: '忙碌', color: 'yellow', icon: '🟡' };
        default:
          return { text: '在线', color: 'green', icon: '🟢' };
      }
    }
    return { text: '离线', color: 'gray', icon: '⚫' };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 标题 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          🖥️ 本地Agent配置
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          在本地电脑运行Agent，使用本地IP和浏览器投递，有效避免风控
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <span>❌</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Agent状态卡片 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Agent状态</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{statusDisplay.icon}</span>
                <span className={`text-lg font-medium text-${statusDisplay.color}-600`}>
                  {statusDisplay.text}
                </span>
              </div>
            </div>
            {agentStatus && agentStatus.online && (
              <div className="text-right">
                <div className="text-sm text-gray-500">任务队列</div>
                <div className="text-lg font-medium">
                  {agentStatus.pendingTasks} 待处理 / {agentStatus.activeTasks} 执行中
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Token管理 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium text-gray-900">认证Token</h3>
            {tokenInfo ? (
              <button
                onClick={handleRevokeToken}
                disabled={loading}
                className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                撤销Token
              </button>
            ) : null}
          </div>

          {tokenInfo ? (
            <div className="space-y-4">
              {/* 一键启动命令 - 最重要的部分 */}
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-green-900">🚀 一键启动命令（复制后粘贴到终端运行）</span>
                </div>
                <div className="bg-white border border-green-200 rounded-lg p-3 mb-3">
                  <code className="block text-sm font-mono text-gray-800 break-all whitespace-pre-wrap">
                    {getFullCommand(tokenInfo.token)}
                  </code>
                </div>
                <button
                  onClick={handleCopyCommand}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg"
                >
                  {copiedCommand ? '✓ 已复制，去终端粘贴运行吧！' : '📋 复制启动命令'}
                </button>
                <div className="mt-3 text-sm text-green-700">
                  <p className="font-medium mb-1">使用方法（3步）：</p>
                  <ol className="list-decimal list-inside space-y-1 text-green-600">
                    <li>下载并解压 local-agent.zip 到「下载」文件夹</li>
                    <li>打开终端（Mac按 ⌘+空格 搜&quot;终端&quot;，Windows按 Win+R 输入 cmd）</li>
                    <li>粘贴上面的命令，按回车运行</li>
                  </ol>
                </div>
              </div>

              {/* Token显示（折叠） */}
              <details className="bg-gray-50 rounded-lg">
                <summary className="px-4 py-3 cursor-pointer text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  查看Token详情（高级用户）
                </summary>
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Token</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowToken(!showToken)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {showToken ? '隐藏' : '显示'}
                      </button>
                      <button
                        onClick={handleCopyToken}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {copied ? '✓ 已复制' : '复制'}
                      </button>
                    </div>
                  </div>
                  <code className="block bg-white border border-gray-200 rounded px-3 py-2 text-sm font-mono break-all">
                    {showToken ? tokenInfo.token : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <div className="mt-2 text-xs text-gray-400">
                    生成时间: {new Date(tokenInfo.generatedAt).toLocaleString()}
                    {' | '}
                    有效期: 24小时
                  </div>
                </div>
              </details>

              {/* 服务器地址 */}
              <div className="text-sm text-gray-500">
                服务器地址: <code className="bg-gray-100 px-2 py-1 rounded">{tokenInfo.serverUrl}</code>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">🔑</div>
              <p className="text-gray-500 mb-4">
                生成Token后，在本地电脑运行Agent即可开始投递
              </p>
              <button
                onClick={handleGenerateToken}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    生成中...
                  </span>
                ) : (
                  '生成Token'
                )}
              </button>
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-md font-medium text-gray-900 mb-3">📖 使用说明</h3>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>点击「生成Token」获取认证凭证</li>
            <li>
              <a
                href="/api/local-agent/download"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                下载 local-agent.zip
              </a>
              ，解压到「下载」文件夹
            </li>
            <li>点击上方绿色按钮复制命令</li>
            <li>打开终端，粘贴命令，按回车</li>
            <li>首次运行会自动安装依赖，等待「认证成功」提示</li>
            <li><strong className="text-orange-600">在弹出的浏览器中扫码登录Boss直聘</strong>（首次需要）</li>
            <li>登录成功后，在Dashboard点击「开始投递」</li>
          </ol>
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-3">
            <p className="text-sm text-amber-800">
              <strong>💡 提示：</strong>Agent启动后会自动打开Boss直聘页面，如果未登录请先扫码登录。登录状态会被保存，下次启动无需重复登录。
            </p>
          </div>
        </div>

        {/* 优势说明 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🏠</div>
            <div className="font-medium text-green-800">本地IP</div>
            <div className="text-sm text-green-600">使用家庭/办公网络IP</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🌐</div>
            <div className="font-medium text-blue-800">真实浏览器</div>
            <div className="text-sm text-blue-600">复用本地Chrome指纹</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🛡️</div>
            <div className="font-medium text-purple-800">防风控</div>
            <div className="text-sm text-purple-600">有效避免IP封禁</div>
          </div>
        </div>

        {/* 常见问题 */}
        <details className="bg-gray-50 rounded-lg">
          <summary className="px-4 py-3 cursor-pointer text-md font-medium text-gray-900 hover:bg-gray-100 rounded-lg">
            ❓ 常见问题
          </summary>
          <div className="px-4 pb-4 text-sm text-gray-600 space-y-3">
            <div>
              <strong>Q: 需要一直开着电脑吗？</strong>
              <p className="mt-1">A: 是的，本地Agent运行时需要电脑保持开机。可以设置定时任务自动启动。</p>
            </div>
            <div>
              <strong>Q: 可以在多台电脑运行吗？</strong>
              <p className="mt-1">A: 同一账号同时只能有一个Agent在线，新连接会踢掉旧连接。</p>
            </div>
            <div>
              <strong>Q: Token过期了怎么办？</strong>
              <p className="mt-1">A: Token有效期24小时，过期后重新生成即可。</p>
            </div>
            <div>
              <strong>Q: 和服务器投递有什么区别？</strong>
              <p className="mt-1">A: 服务器投递使用云服务器IP，可能被风控；本地Agent使用你的家庭IP，更安全。</p>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default LocalAgentConfig;
