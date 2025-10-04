import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface BossCookieConfigProps {
  onClose?: () => void;
}

interface CookieStatus {
  success: boolean;
  has_cookie: boolean;
  message: string;
  cookie_content?: string;
}

const BossCookieConfig: React.FC<BossCookieConfigProps> = ({ onClose }) => {
  const [zpToken, setZpToken] = useState('');
  const [session, setSession] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [cookieStatus, setCookieStatus] = useState<CookieStatus | null>(null);

  // 获取当前Cookie状态
  const fetchCookieStatus = async () => {
    try {
      const response = await axios.get('http://115.190.182.95:8080/api/boss/cookie');
      setCookieStatus(response.data);

      if (response.data.has_cookie && response.data.cookie_content) {
        try {
          const cookies = JSON.parse(response.data.cookie_content);
          const zpTokenCookie = cookies.find((c: any) => c.name === 'zp_token');
          const sessionCookie = cookies.find((c: any) => c.name === 'session');

          if (zpTokenCookie) setZpToken(zpTokenCookie.value);
          if (sessionCookie) setSession(sessionCookie.value);
        } catch (e) {
          console.warn('解析现有Cookie失败', e);
        }
      }
    } catch (error) {
      console.error('获取Cookie状态失败', error);
      setMessage('获取Cookie状态失败');
    }
  };

  useEffect(() => {
    fetchCookieStatus();
  }, []);

  const handleSave = async () => {
    if (!zpToken.trim() || !session.trim()) {
      setMessage('请填写完整的Cookie信息');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://115.190.182.95:8080/api/boss/cookie', {
        zp_token: zpToken.trim(),
        session: session.trim()
      });

      if (response.data.success) {
        setMessage('✅ Cookie保存成功！现在可以启动Boss程序了');
        await fetchCookieStatus();
      } else {
        setMessage('❌ 保存失败: ' + response.data.message);
      }
    } catch (error) {
      console.error('保存Cookie失败', error);
      setMessage('❌ 保存失败，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    setIsLoading(true);
    try {
      const response = await axios.delete('http://115.190.182.95:8080/api/boss/cookie');
      if (response.data.success) {
        setMessage('✅ Cookie已清除');
        setZpToken('');
        setSession('');
        await fetchCookieStatus();
      } else {
        setMessage('❌ 清除失败: ' + response.data.message);
      }
    } catch (error) {
      console.error('清除Cookie失败', error);
      setMessage('❌ 清除失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartBoss = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://115.190.182.95:8080/start-boss-task', {});
      if (response.data.success) {
        setMessage('✅ Boss程序启动成功！');
      } else {
        setMessage('⚠️ ' + response.data.message);
      }
    } catch (error) {
      console.error('启动Boss程序失败', error);
      setMessage('❌ 启动失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartBossWithUI = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://115.190.182.95:8080/start-boss-task-with-ui', {});
      if (response.data.success) {
        setMessage('✅ 有头模式登录已启动！请在弹出的浏览器窗口中完成登录，登录成功后会自动切换到无头模式。');
      } else {
        setMessage('⚠️ ' + response.data.message);
      }
    } catch (error) {
      console.error('启动有头模式登录失败', error);
      setMessage('❌ 有头模式启动失败：当前服务器环境不支持图形界面。请使用手动配置Cookie的方式。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Boss直聘Cookie配置</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          )}
        </div>

        {/* 当前状态 */}
        {cookieStatus && (
          <div className="mb-4 p-3 rounded-lg bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-2">当前状态:</h3>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-sm ${
                cookieStatus.has_cookie
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {cookieStatus.has_cookie ? '✅ 已配置Cookie' : '⚠️ 未配置Cookie'}
              </span>
              <span className="text-sm text-gray-600">{cookieStatus.message}</span>
            </div>
          </div>
        )}

        {/* 说明文字 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">📋 如何获取Cookie:</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>打开浏览器，访问 <a href="https://www.zhipin.com" target="_blank" rel="noopener noreferrer" className="underline">Boss直聘官网</a></li>
            <li>登录你的Boss直聘账号</li>
            <li>按F12打开开发者工具，切换到&quot;Application&quot;或&quot;应用程序&quot;标签</li>
            <li>在左侧找到&quot;Cookies&quot; → &quot;https://www.zhipin.com&quot;</li>
            <li>找到 <code className="bg-blue-100 px-1 rounded">zp_token</code> 和 <code className="bg-blue-100 px-1 rounded">session</code> 两个Cookie</li>
            <li>复制它们的&quot;Value&quot;值，粘贴到下面的输入框中</li>
          </ol>
        </div>

        {/* Cookie输入表单 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              zp_token (必填)
            </label>
            <input
              type="text"
              value={zpToken}
              onChange={(e) => setZpToken(e.target.value)}
              placeholder="请输入zp_token的值"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              session (必填)
            </label>
            <input
              type="text"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              placeholder="请输入session的值"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 消息显示 */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('✅') ? 'bg-green-50 text-green-700' :
            message.includes('❌') ? 'bg-red-50 text-red-700' :
            message.includes('⚠️') ? 'bg-yellow-50 text-yellow-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="space-y-3 mt-6">
          {/* 第一行：保存和清除按钮 */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isLoading || !zpToken.trim() || !session.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '保存中...' : '保存Cookie'}
            </button>

            <button
              onClick={handleClear}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              清除
            </button>
          </div>

          {/* 第二行：启动按钮 */}
          <div className="flex gap-3">
            <button
              onClick={handleStartBossWithUI}
              disabled={isLoading}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '启动中...' : '🎯 有头模式登录（推荐）'}
            </button>

            <button
              onClick={handleStartBoss}
              disabled={isLoading || !cookieStatus?.has_cookie}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '启动中...' : '启动Boss程序'}
            </button>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p><strong>使用说明:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li><strong>🎯 有头模式登录（推荐）</strong>：首次使用或Cookie失效时，会弹出浏览器窗口进行扫码登录，登录成功后自动切换到无头模式</li>
            <li><strong>启动Boss程序</strong>：使用已保存的Cookie直接启动，无需登录</li>
            <li><strong>手动配置Cookie</strong>：如果服务器环境不支持图形界面，可以手动获取Cookie并配置</li>
          </ul>
        </div>

        {/* 环境提示 */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
          <p><strong>⚠️ 环境提示:</strong></p>
          <p>当前服务器环境可能不支持图形界面，如果&quot;有头模式登录&quot;启动失败，请使用&quot;手动配置Cookie&quot;的方式。</p>
        </div>
      </div>
    </div>
  );
};

export default BossCookieConfig;
