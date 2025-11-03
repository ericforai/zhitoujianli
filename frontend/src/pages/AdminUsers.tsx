/**
 * 管理员用户管理页面
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-31
 */

import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import config from '../config/environment';

interface User {
  id: number | string;  // 支持后端返回的 userId (Long)
  userId?: number | string;  // 后端返回的实际字段
  email: string;
  nickname?: string;
  createdAt: string;
  active: boolean;  // 后端返回的字段名是 active
  status: string;   // 后端返回的 status 字段
  planType?: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const pageSize = 20;

  useEffect(() => {
    fetchUsers();
  }, [page]);

  // 切换用户状态（启用/禁用）
  const handleToggleUserStatus = async (user: User, currentActive: boolean) => {
    const userId = user.userId || user.id;

    if (!confirm(`确定要${currentActive ? '禁用' : '启用'}用户 ${user.email} 吗？`)) {
      return;
    }

    try {
      setUpdatingUserId(String(userId));
      const token = localStorage.getItem('authToken');

      console.log('🔄 更新用户状态:', { userId, currentActive, newActive: !currentActive });

      const response = await fetch(`${config.apiBaseUrl}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          active: !currentActive,
        }),
      });

      const result = await response.json();
      console.log('✅ 更新状态响应:', result);

      if (result.success) {
        alert(`用户已${currentActive ? '禁用' : '启用'}`);
        await fetchUsers(); // 重新加载用户列表
      } else {
        alert('操作失败: ' + result.message);
      }
    } catch (err: any) {
      console.error('更新用户状态失败:', err);
      alert('操作失败: ' + err.message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  // 删除用户
  const handleDeleteUser = async (user: User) => {
    const userId = user.userId || user.id;

    if (!confirm(`确定要删除用户 ${user.email} 吗？此操作不可恢复！`)) {
      return;
    }

    const reason = prompt('请输入删除原因（可选）：') || '管理员删除';

    try {
      setUpdatingUserId(String(userId));
      const token = localStorage.getItem('authToken');

      console.log('🗑️ 删除用户:', { userId, email: user.email, reason });

      const response = await fetch(`${config.apiBaseUrl}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason,
        }),
      });

      const result = await response.json();
      console.log('✅ 删除响应:', result);

      if (result.success) {
        alert('用户已删除');
        await fetchUsers(); // 重新加载用户列表
      } else {
        alert('删除失败: ' + result.message);
      }
    } catch (err: any) {
      console.error('删除用户失败:', err);
      alert('删除失败: ' + err.message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${config.apiBaseUrl}/admin/users?page=${page}&size=${pageSize}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.success && result.data) {
        setUsers(result.data.users || []);
        setTotal(result.data.total || 0);
      } else {
        setError(result.message || '获取用户列表失败');
      }
    } catch (err: any) {
      console.error('获取用户列表失败:', err);
      setError(err.message || '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading && users.length === 0) {
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
        <h1 className='text-2xl font-bold text-gray-900'>用户管理</h1>

        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-700'>
            {error}
          </div>
        )}

        {/* 用户列表 */}
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  ID
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  邮箱
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  昵称
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  套餐
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  状态
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  注册时间
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  操作
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {users.map((user) => (
                <tr key={user.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {user.id}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {user.email}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {user.nickname || '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {user.planType || 'FREE'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.active || user.status === 'enabled'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.active || user.status === 'enabled' ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => handleToggleUserStatus(user, user.active || user.status === 'enabled')}
                        disabled={updatingUserId === String(user.userId || user.id)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          user.active || user.status === 'enabled'
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {updatingUserId === String(user.userId || user.id)
                          ? '处理中...'
                          : (user.active || user.status === 'enabled' ? '禁用' : '启用')
                        }
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={updatingUserId === String(user.userId || user.id)}
                        className='px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 分页 */}
          <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200'>
            <div className='text-sm text-gray-700'>
              共 {total} 个用户，第 {page + 1} 页
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

export default AdminUsers;

