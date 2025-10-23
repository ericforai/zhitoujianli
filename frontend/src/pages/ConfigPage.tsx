/**
 * 配置管理页面
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-03
 */

import React, { useEffect, useState } from 'react';
import BossConfig from '../components/DeliveryConfig/BossConfig';
import Navigation from '../components/Navigation';
import CompleteResumeManager from '../components/ResumeManagement/CompleteResumeManager';
import { useAuth } from '../contexts/AuthContext';
import { BossConfig as BossConfigType } from '../types/api';
import logger from '../utils/logger';

const ConfigPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'delivery' | 'resume'>('delivery');
  const [bossConfig, setBossConfig] = useState<BossConfigType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 创建认证日志记录器
  const authLogger = logger.createChild('ConfigPage:Auth');

  // 所有 useEffect 必须在这里，在任何 return 之前
  useEffect(() => {
    authLogger.debug('ConfigPage组件开始渲染', { isLoading, isAuthenticated });
  }, [isLoading, isAuthenticated, authLogger]);

  // 从 /api/config 加载配置
  useEffect(() => {
    // 只有在认证通过后才加载配置
    if (!isAuthenticated || isLoading) {
      return;
    }

    const loadConfig = async () => {
      try {
        authLogger.debug('开始加载用户配置');
        const token = localStorage.getItem('authToken') || 'test_token';
        const response = await fetch('/api/config', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (data.success) {
          setBossConfig(data.config.boss);
          setMessage({ type: 'success', text: '配置加载成功' });
          authLogger.info('配置加载成功');
        } else {
          setMessage({ type: 'error', text: '配置加载失败: ' + data.message });
          authLogger.error('配置加载失败', { message: data.message });
        }
      } catch (error) {
        console.error('加载配置失败:', error);
        setMessage({ type: 'error', text: '网络错误，请检查连接' });
        authLogger.error('配置加载网络错误', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [isAuthenticated, isLoading, authLogger]);

  // 自动清除消息
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000); // 3秒后自动消失

      return () => clearTimeout(timer);
    }
  }, [message]);

  // 现在可以安全地使用条件 return
  if (isLoading) {
    authLogger.debug('等待认证状态确认...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 双重保险：理论上PrivateRoute已拦截，但作为防御性编程
  if (!isAuthenticated) {
    authLogger.warn('未认证用户尝试访问ConfigPage页面');
    return null;
  }

  // 认证确认，记录日志
  authLogger.info('ConfigPage认证检查通过，渲染组件', {
    userId: user?.userId,
    email: user?.email
  });

  // 保存配置到后端
  const handleSaveConfig = async (newConfig: BossConfigType) => {
    setSaveLoading(true);
    setMessage(null);

    try {
      authLogger.debug('开始保存用户配置');
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || 'test_token'}`
        },
        body: JSON.stringify({ boss: newConfig })
      });

      const data = await response.json();

      if (data.success) {
        setBossConfig(newConfig);
        setMessage({ type: 'success', text: '配置保存成功' });
        authLogger.info('配置保存成功');
      } else {
        setMessage({ type: 'error', text: '保存失败: ' + data.message });
        authLogger.error('配置保存失败', { message: data.message });
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      setMessage({ type: 'error', text: '网络错误，保存失败' });
      authLogger.error('配置保存网络错误', error);
    } finally {
      setSaveLoading(false);
    }
  };

  // 清除消息
  const clearMessage = () => {
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Toast 通知 - 固定位置 */}
      {message && (
        <div className="fixed top-20 right-4 z-50 max-w-sm">
          <div className={`p-4 rounded-lg shadow-lg border flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <div className="flex items-center">
              <div className={`mr-3 text-lg ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {message.type === 'success' ? '✅' : '❌'}
              </div>
              <span className="font-medium">{message.text}</span>
            </div>
            <button
              onClick={clearMessage}
              className="ml-4 text-gray-400 hover:text-gray-600 text-lg"
              title="关闭"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ 配置管理</h1>
          <p className="text-gray-600">管理投递参数和简历内容，优化求职效果</p>
        </div>

        {/* Tab切换 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('delivery')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'delivery'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 投递参数配置
              </button>
              <button
                onClick={() => setActiveTab('resume')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'resume'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📄 简历内容管理
              </button>
            </nav>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">加载配置中...</p>
            </div>
          ) : (
            <>
              {activeTab === 'delivery' && bossConfig && (
                <BossConfig
                  config={bossConfig}
                  onConfigChange={handleSaveConfig}
                  loading={saveLoading}
                />
              )}
              {activeTab === 'resume' && (
                <div className="p-6">
                  <CompleteResumeManager />
                </div>
              )}
            </>
          )}
        </div>

        {/* 帮助信息 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>投递参数配置</strong>：设置搜索关键词、目标城市、薪资范围等，影响自动投递的岗位筛选</li>
            <li>• <strong>简历内容管理</strong>：上传和编辑简历，AI将基于简历内容生成个性化打招呼语</li>
            <li>• 配置修改后需要点击&ldquo;保存配置&rdquo;按钮才能生效</li>
            <li>• 建议定期更新简历内容以获得更好的匹配效果</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;
