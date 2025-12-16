/**
 * 管理员登录日志页面
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-31
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import config from '../config/environment';

interface LoginLog {
  id: number;
  email: string;
  loginType: string;
  loginStatus: string;
  ipAddress: string;
  createdAt: string;
  failureReason?: string;
}

const AdminLoginLogs: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [filterDate, setFilterDate] = useState<string>('');
  const pageSize = 20;

  // 从URL参数获取日期过滤
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      setFilterDate(dateParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterDate]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      // 构建URL，添加日期过滤参数
      let url = `${config.apiBaseUrl}/admin/login-logs?page=${page}&size=${pageSize}`;
      if (filterDate) {
        url += `&date=${filterDate}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        // 后端已经处理了日期过滤，直接使用返回的数据
        const logsList = result.data.logs || [];
        setLogs(logsList);
        // 使用后端返回的总数，确保分页正确
        setTotal(result.data.total || 0);
      } else {
        setError(result.message || '获取登录日志失败');
      }
    } catch (err: any) {
      console.error('获取登录日志失败:', err);
      setError(err.message || '获取登录日志失败');
    } finally {
      setLoading(false);
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

  return (
    <AdminLayout>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900'>登录日志</h1>

          {/* 日期过滤提示 */}
          {filterDate && (
            <div className='flex items-center gap-2'>
              <span className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm'>
                📅 筛选日期: {filterDate}
              </span>
              <button
                onClick={() => {
                  setFilterDate('');
                  window.history.replaceState({}, '', '/admin/login-logs');
                  fetchLogs();
                }}
                className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200'
              >
                清除筛选
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-700'>
            {error}
          </div>
        )}

        {/* 日志列表 */}
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  时间
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  邮箱
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  状态
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  IP地址
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  失败原因
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {logs.map(log => (
                <tr key={log.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {new Date(log.createdAt).toLocaleString('zh-CN')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {log.email}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.loginStatus === 'SUCCESS'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {log.loginStatus === 'SUCCESS' ? '成功' : '失败'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {log.ipAddress || '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-red-600'>
                    {log.failureReason || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 分页 */}
          <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200'>
            <div className='text-sm text-gray-700'>
              共 {total} 条日志，第 {page + 1} 页
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                上一页
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * pageSize >= total}
                className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
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

export default AdminLoginLogs;
