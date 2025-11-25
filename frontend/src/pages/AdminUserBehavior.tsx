/**
 * 管理员用户行为追踪页面
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */

import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import config from '../config/environment';

interface BehaviorLog {
  id: number;
  userId: string;
  behaviorType: string;
  status: string;
  description: string;
  platform?: string;
  extraData?: string;
  createdAt: string;
}

interface BehaviorStats {
  [key: string]: {
    total: number;
    success: number;
    failed: number;
    successRate?: number;
  };
}

const AdminUserBehavior: React.FC = () => {
  const [logs, setLogs] = useState<BehaviorLog[]>([]);
  const [globalStats, setGlobalStats] = useState<BehaviorStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userStats, setUserStats] = useState<BehaviorStats>({});
  const pageSize = 20;

  useEffect(() => {
    fetchGlobalStats();
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserStats(selectedUserId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const url = selectedUserId
        ? `${config.apiBaseUrl}/admin/behavior/logs/user/${selectedUserId}?page=${page}&size=${pageSize}`
        : `${config.apiBaseUrl}/admin/behavior/logs?page=${page}&size=${pageSize}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        setLogs(result.data.logs || []);
        setTotal(result.data.total || 0);
      } else {
        setError(result.message || '获取行为日志失败');
      }
    } catch (err: any) {
      console.error('获取行为日志失败:', err);
      setError(err.message || '获取行为日志失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiBaseUrl}/admin/behavior/stats/global`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        setGlobalStats(result.data);
      }
    } catch (err: any) {
      console.error('获取全局统计失败:', err);
    }
  };

  const fetchUserStats = async (userId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiBaseUrl}/admin/behavior/stats/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        setUserStats(result.data);
      }
    } catch (err: any) {
      console.error('获取用户统计失败:', err);
    }
  };

  const getBehaviorTypeName = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      QRCODE_SCAN_SUCCESS: '二维码扫码成功',
      QRCODE_SCAN_FAILED: '二维码扫码失败',
      JOB_DELIVERY_START: '启动投递',
      JOB_DELIVERY_SUCCESS: '投递成功',
      JOB_DELIVERY_FAILED: '投递失败',
      RESUME_UPLOAD: '上传简历',
      RESUME_PARSE: '解析简历',
      GREETING_GENERATE: '生成打招呼语',
      GREETING_USE: '使用打招呼语',
    };
    return typeMap[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string; text: string } } = {
      SUCCESS: { color: 'bg-green-100 text-green-800', text: '成功' },
      FAILED: { color: 'bg-red-100 text-red-800', text: '失败' },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: '进行中' },
    };
    const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const parseExtraData = (extraData?: string) => {
    if (!extraData) return null;
    try {
      return JSON.parse(extraData);
    } catch {
      return null;
    }
  };

  if (loading && logs.length === 0) {
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

  if (error) {
    return (
      <AdminLayout>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-700'>
          {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900'>用户行为追踪</h1>
          <div className='flex items-center gap-4'>
            <input
              type='text'
              placeholder='输入用户ID筛选'
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <button
              onClick={() => {
                setSelectedUserId('');
                setPage(0);
                fetchLogs();
              }}
              className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200'
            >
              清除筛选
            </button>
          </div>
        </div>

        {/* 全局统计卡片 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {Object.entries(globalStats).map(([type, stats]) => (
            <div key={type} className='bg-white rounded-lg shadow p-4'>
              <h3 className='text-sm font-medium text-gray-600 mb-2'>
                {getBehaviorTypeName(type)}
              </h3>
              <div className='space-y-1'>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>总数:</span>
                  <span className='font-semibold'>{stats.total}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-green-600'>成功:</span>
                  <span className='font-semibold text-green-600'>{stats.success}</span>
                </div>
                {stats.successRate !== undefined && (
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>成功率:</span>
                    <span className='font-semibold'>
                      {stats.successRate.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 用户统计（如果选择了用户） */}
        {selectedUserId && Object.keys(userStats).length > 0 && (
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>
              用户统计 (ID: {selectedUserId})
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {Object.entries(userStats).map(([type, stats]) => (
                <div key={type} className='bg-gray-50 rounded-lg p-4'>
                  <h3 className='text-sm font-medium text-gray-600 mb-2'>
                    {getBehaviorTypeName(type)}
                  </h3>
                  <div className='space-y-1'>
                    <div className='flex justify-between'>
                      <span className='text-gray-500'>总数:</span>
                      <span className='font-semibold'>{stats.total}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-green-600'>成功:</span>
                      <span className='font-semibold text-green-600'>{stats.success}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-red-600'>失败:</span>
                      <span className='font-semibold text-red-600'>{stats.failed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 行为日志列表 */}
        <div className='bg-white rounded-lg shadow'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-lg font-semibold text-gray-900'>行为日志</h2>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    时间
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    用户ID
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    行为类型
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    状态
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    描述
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    平台
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {logs.map((log) => {
                  const extraData = parseExtraData(log.extraData);
                  return (
                    <tr key={log.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {new Date(log.createdAt).toLocaleString('zh-CN')}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {log.userId}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {getBehaviorTypeName(log.behaviorType)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        {getStatusBadge(log.status)}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-500'>
                        <div className='max-w-md'>
                          {log.description}
                          {extraData && (
                            <details className='mt-1'>
                              <summary className='text-xs text-blue-600 cursor-pointer'>
                                查看详情
                              </summary>
                              <pre className='mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto'>
                                {JSON.stringify(extraData, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {log.platform || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
            <div className='text-sm text-gray-700'>
              共 {total} 条记录，第 {page + 1} 页，共 {Math.ceil(total / pageSize)} 页
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                上一页
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(total / pageSize) - 1}
                className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUserBehavior;

