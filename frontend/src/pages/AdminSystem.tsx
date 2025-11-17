/**
 * 管理员系统配置页面
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-31
 */

import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import config from '../config/environment';

interface ConfigItem {
  id: number;
  configKey: string;
  configValue: string;
  configType: string;
  description: string;
  updatedBy: string;
  updatedAt: string;
}

const AdminSystem: React.FC = () => {
  const [configList, setConfigList] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingConfig, setEditingConfig] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiBaseUrl}/admin/system/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      console.log('系统配置响应:', result);

      if (result.success && result.data) {
        // 后端返回的是数组格式
        if (Array.isArray(result.data)) {
          setConfigList(result.data);
        } else {
          // 如果是对象，转换为数组
          setConfigList([result.data]);
        }
      } else {
        setError(result.message || '获取系统配置失败');
      }
    } catch (err: any) {
      console.error('获取系统配置失败:', err);
      setError(err.message || '获取系统配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (configKey: string) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      const newValue = editingConfig[configKey];

      const response = await fetch(
        `${config.apiBaseUrl}/admin/system/configs/${configKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            configValue: newValue,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setError('');
        alert('配置保存成功！');
        fetchConfig(); // 重新加载配置
      } else {
        setError(result.message || '保存配置失败');
      }
    } catch (err: any) {
      console.error('保存配置失败:', err);
      setError(err.message || '保存配置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleConfigChange = (configKey: string, value: string) => {
    setEditingConfig({
      ...editingConfig,
      [configKey]: value,
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
            <p className='mt-4 text-gray-600'>加载中...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900'>系统配置</h1>
          <button
            onClick={fetchConfig}
            disabled={loading}
            className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? '加载中...' : '刷新配置'}
          </button>
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-700'>
            {error}
          </div>
        )}

        {/* 配置表单 */}
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h2 className='text-lg font-semibold text-gray-900'>系统设置</h2>
            <p className='text-sm text-gray-500 mt-1'>管理系统的全局配置参数</p>
          </div>

          <div className='divide-y divide-gray-200'>
            {configList.length === 0 ? (
              <div className='px-6 py-8 text-center text-gray-500'>
                暂无配置项
              </div>
            ) : (
              configList.map(item => (
                <div
                  key={item.configKey}
                  className='px-6 py-4 hover:bg-gray-50'
                >
                  <div className='flex items-start gap-4'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <label className='text-sm font-medium text-gray-900'>
                          {item.configKey}
                        </label>
                        <span className='px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded'>
                          {item.configType}
                        </span>
                      </div>
                      {item.description && (
                        <p className='text-xs text-gray-500 mb-2'>
                          {item.description}
                        </p>
                      )}
                      <div className='flex items-center gap-2'>
                        <input
                          type={
                            item.configType === 'NUMBER'
                              ? 'number'
                              : item.configType === 'BOOLEAN'
                                ? 'checkbox'
                                : 'text'
                          }
                          value={
                            editingConfig[item.configKey] !== undefined
                              ? editingConfig[item.configKey]
                              : item.configValue
                          }
                          checked={
                            item.configType === 'BOOLEAN'
                              ? editingConfig[item.configKey] !== undefined
                                ? editingConfig[item.configKey] === 'true'
                                : item.configValue === 'true'
                              : undefined
                          }
                          onChange={e => {
                            const value =
                              item.configType === 'BOOLEAN'
                                ? String(e.target.checked)
                                : e.target.value;
                            handleConfigChange(item.configKey, value);
                          }}
                          className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                          placeholder={`输入${item.description || item.configKey}`}
                        />
                        <button
                          onClick={() => handleSaveConfig(item.configKey)}
                          disabled={
                            saving ||
                            editingConfig[item.configKey] === undefined
                          }
                          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm'
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSystem;
