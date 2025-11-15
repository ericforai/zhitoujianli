/**
 * 管理员功能开关页面
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-31
 */

import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import config from '../config/environment';

interface FeatureFlag {
  id: number;
  featureKey: string;
  featureName: string;
  isEnabled: boolean;
  allowedPlanTypes: string[];
  description?: string;
}

const AdminFeatures: React.FC = () => {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiBaseUrl}/admin/features`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        setFeatures(result.data.features || result.data || []);
      } else {
        setError(result.message || '获取功能列表失败');
      }
    } catch (err: any) {
      console.error('获取功能列表失败:', err);
      setError(err.message || '获取功能列表失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (featureKey: string, enabled: boolean) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${config.apiBaseUrl}/admin/features/${featureKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ enabled: enabled }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // 更新本地状态
        setFeatures(prev =>
          prev.map(f => (f.featureKey === featureKey ? { ...f, isEnabled: enabled } : f))
        );
      } else {
        setError(result.message || '更新功能状态失败');
      }
    } catch (err: any) {
      console.error('更新功能状态失败:', err);
      setError(err.message || '更新功能状态失败');
    }
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
        <h1 className='text-2xl font-bold text-gray-900'>功能开关</h1>

        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-700'>
            {error}
          </div>
        )}

        {/* 功能列表 */}
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  功能名称
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  功能键
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  状态
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  可用套餐
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  操作
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {features.map(feature => (
                <tr key={feature.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {feature.featureName || feature.featureKey}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {feature.featureKey}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        feature.isEnabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {feature.isEnabled ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {feature.allowedPlanTypes?.join(', ') || 'ALL'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <button
                      onClick={() =>
                        toggleFeature(feature.featureKey, !feature.isEnabled)
                      }
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        feature.isEnabled
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {feature.isEnabled ? '禁用' : '启用'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFeatures;
