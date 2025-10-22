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
import { BossConfig as BossConfigType } from '../types/api';

const ConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'delivery' | 'resume'>('delivery');
  const [bossConfig, setBossConfig] = useState<BossConfigType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userInfo, setUserInfo] = useState<{userId: string; email: string} | null>(null);

  // 加载用户信息（多用户支持）
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token && token !== 'test_token') {
          const response = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.success) {
            setUserInfo(data.user);
            console.log('当前登录用户:', data.user);
          }
        }
      } catch (error) {
        console.log('未登录或使用默认用户');
      }
    };
    loadUserInfo();
  }, []);

  // 从 /api/config 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
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
        } else {
          setMessage({ type: 'error', text: '配置加载失败: ' + data.message });
        }
      } catch (error) {
        console.error('加载配置失败:', error);
        setMessage({ type: 'error', text: '网络错误，请检查连接' });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  // 保存配置到后端
  const handleSaveConfig = async (newConfig: BossConfigType) => {
    setSaveLoading(true);
    setMessage(null);

    try {
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
      } else {
        setMessage({ type: 'error', text: '保存失败: ' + data.message });
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      setMessage({ type: 'error', text: '网络错误，保存失败' });
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ 配置管理</h1>
          <p className="text-gray-600">管理投递参数和简历内容，优化求职效果</p>
        </div>

        {/* 用户信息显示（多用户模式） */}
        {userInfo && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">当前用户：</span>
                  {userInfo.email} <span className="text-blue-600">({userInfo.userId})</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 消息提示 */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <span>{message.text}</span>
            <button
              onClick={clearMessage}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        )}

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
