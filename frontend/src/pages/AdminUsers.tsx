/**
 * 管理员用户管理页面
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-31
 */

import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import config from '../config/environment';

interface User {
  id: number | string; // 支持后端返回的 userId (Long)
  userId?: number | string; // 后端返回的实际字段
  email: string;
  nickname?: string;
  createdAt: string;
  active: boolean; // 后端返回的字段名是 active
  status: string; // 后端返回的 status 字段
  planType?: string;
}

type PlanType = 'FREE' | 'BASIC' | 'PROFESSIONAL';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set()); // 🔧 新增：选中的用户ID集合
  const [batchDeleting, setBatchDeleting] = useState(false); // 🔧 新增：批量删除中状态
  const [canScrollLeft, setCanScrollLeft] = useState(false); // 🔧 新增：是否可以向左滚动
  const [canScrollRight, setCanScrollRight] = useState(false); // 🔧 新增：是否可以向右滚动
  const tableContainerRef = useRef<HTMLDivElement>(null); // 🔧 新增：表格容器引用
  const pageSize = 20;

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // 🔧 新增：检查滚动状态
  const checkScrollStatus = () => {
    const container = tableContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // 🔧 新增：滚动到左侧
  const scrollLeft = () => {
    const container = tableContainerRef.current;
    if (!container) return;

    container.scrollBy({ left: -300, behavior: 'smooth' });
    // 延迟检查，等待滚动动画完成
    setTimeout(checkScrollStatus, 300);
  };

  // 🔧 新增：滚动到右侧
  const scrollRight = () => {
    const container = tableContainerRef.current;
    if (!container) return;

    container.scrollBy({ left: 300, behavior: 'smooth' });
    // 延迟检查，等待滚动动画完成
    setTimeout(checkScrollStatus, 300);
  };

  // 🔧 新增：监听滚动事件
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    // 初始检查
    checkScrollStatus();

    // 监听滚动事件
    container.addEventListener('scroll', checkScrollStatus);
    // 监听窗口大小变化
    window.addEventListener('resize', checkScrollStatus);

    return () => {
      container.removeEventListener('scroll', checkScrollStatus);
      window.removeEventListener('resize', checkScrollStatus);
    };
  }, [users]); // 当用户列表变化时重新检查

  // 切换用户状态（启用/禁用）
  const handleToggleUserStatus = async (user: User, currentActive: boolean) => {
    const userId = user.userId || user.id;

    if (
      !confirm(
        `确定要${currentActive ? '禁用' : '启用'}用户 ${user.email} 吗？`
      )
    ) {
      return;
    }

    try {
      setUpdatingUserId(String(userId));
      const token = localStorage.getItem('authToken');

      console.log('🔄 更新用户状态:', {
        userId,
        currentActive,
        newActive: !currentActive,
      });

      const response = await fetch(
        `${config.apiBaseUrl}/admin/users/${userId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            active: !currentActive,
          }),
        }
      );

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

  // 升级用户套餐
  const handleUpgradePlan = async (user: User) => {
    const userId = user.userId || user.id;
    const currentPlan = user.planType || 'FREE';

    // 选择目标套餐
    const planOptions = ['FREE', 'BASIC', 'PROFESSIONAL'];
    const planNames = {
      FREE: '求职入门版（免费）',
      BASIC: '高效求职版（¥49/月）',
      PROFESSIONAL: '极速上岸版（¥99/月）',
    };

    let optionsText = '请选择目标套餐：\n\n';
    planOptions.forEach((plan, index) => {
      const current = plan === currentPlan ? ' ← 当前套餐' : '';
      optionsText += `${index + 1}. ${planNames[plan as PlanType]}${current}\n`;
    });
    optionsText += '\n请输入数字（1-3）：';

    const choice = prompt(optionsText);
    if (!choice) return;

    const choiceNum = parseInt(choice);
    if (choiceNum < 1 || choiceNum > 3) {
      alert('无效的选择');
      return;
    }

    const targetPlan = planOptions[choiceNum - 1];

    if (targetPlan === currentPlan) {
      alert('用户已经是该套餐');
      return;
    }

    if (
      !confirm(
        `确定要将用户 ${user.email} 的套餐从 ${planNames[currentPlan as PlanType]} 改为 ${planNames[targetPlan as PlanType]} 吗？`
      )
    ) {
      return;
    }

    try {
      setUpdatingUserId(String(userId));
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        `${config.apiBaseUrl}/admin/users/${userId}/plan`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            planType: targetPlan,
            // 不发送 endDate 字段，后端会将其设置为 null（永不过期）
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert(
          `套餐升级成功！\n用户：${user.email}\n新套餐：${planNames[targetPlan as PlanType]}`
        );
        await fetchUsers(); // 重新加载用户列表
      } else {
        alert('升级失败: ' + result.message);
      }
    } catch (err: any) {
      console.error('升级用户套餐失败:', err);
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

      console.log('🗑️ 删除用户:', {
        userId,
        email: user.email,
        reason,
        apiUrl: `${config.apiBaseUrl}/admin/users/${userId}`,
        hasToken: !!token,
      });

      const response = await fetch(
        `${config.apiBaseUrl}/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reason,
          }),
        }
      );

      console.log('📡 删除响应状态:', response.status, response.statusText);

      const result = await response.json();
      console.log('📥 删除响应:', result);

      if (!response.ok) {
        // 🔧 修复：根据HTTP状态码和错误消息，提供更友好的错误提示
        const errorMessage = result.message || '未知错误';

        if (response.status === 409 && errorMessage.includes('已被删除')) {
          // 用户已被删除，提示用户刷新列表
          alert('该用户已被删除，请刷新页面查看最新状态');
          await fetchUsers(); // 刷新用户列表
        } else if (response.status === 404 && errorMessage.includes('不存在')) {
          // 用户不存在，提示用户刷新列表
          alert('该用户不存在，请刷新页面查看最新状态');
          await fetchUsers(); // 刷新用户列表
        } else {
          // 其他错误
          alert(`删除失败: ${errorMessage}`);
        }
        setUpdatingUserId(null);
        return;
      }

      if (result.success) {
        alert('用户已删除');
        await fetchUsers(); // 重新加载用户列表
        // 🔧 修复：触发仪表盘数据刷新事件
        window.dispatchEvent(new CustomEvent('adminUsersChanged'));
      } else {
        alert('删除失败: ' + (result.message || '未知错误'));
      }
    } catch (err: any) {
      console.error('❌ 删除用户异常:', err);
      alert('删除失败: ' + (err.message || '网络错误'));
    } finally {
      setUpdatingUserId(null);
    }
  };

  // 🔧 新增：批量删除用户
  const handleBatchDelete = async () => {
    if (selectedUsers.size === 0) {
      alert('请先选择要删除的用户');
      return;
    }

    const selectedUserList = Array.from(selectedUsers);
    const selectedUserEmails = users
      .filter(u => selectedUserList.includes(String(u.userId || u.id)))
      .map(u => u.email)
      .join(', ');

    const confirmMessage = `确定要删除以下 ${selectedUsers.size} 个用户吗？\n\n${selectedUserEmails}\n\n此操作不可恢复！`;
    if (!confirm(confirmMessage)) {
      return;
    }

    const reason = prompt('请输入删除原因（可选）：') || '管理员批量删除';

    try {
      setBatchDeleting(true);
      const token = localStorage.getItem('authToken');

      console.log('🗑️ 批量删除用户:', {
        count: selectedUsers.size,
        userIds: selectedUserList,
        reason,
      });

      const response = await fetch(
        `${config.apiBaseUrl}/admin/users/batch-delete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userIds: selectedUserList,
            reason,
          }),
        }
      );

      const result = await response.json();
      console.log('📥 批量删除响应:', result);

      if (result.success) {
        alert(
          `批量删除成功！\n成功: ${result.successCount} 个\n失败: ${result.failCount} 个`
        );
        setSelectedUsers(new Set()); // 清空选择
        await fetchUsers(); // 重新加载用户列表
        // 🔧 修复：触发仪表盘数据刷新事件
        window.dispatchEvent(new CustomEvent('adminUsersChanged'));
      } else {
        let errorMsg = result.message || '批量删除失败';
        if (result.failedUsers && result.failedUsers.length > 0) {
          errorMsg +=
            '\n\n失败详情：\n' +
            result.failedUsers
              .map((f: any) => `用户ID ${f.userId}: ${f.error}`)
              .join('\n');
        }
        alert(errorMsg);
      }
    } catch (err: any) {
      console.error('❌ 批量删除用户异常:', err);
      alert('批量删除失败: ' + (err.message || '网络错误'));
    } finally {
      setBatchDeleting(false);
    }
  };

  // 🔧 新增：切换用户选择状态
  const handleToggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  // 🔧 新增：全选/取消全选
  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      const allUserIds = users.map(u => String(u.userId || u.id));
      setSelectedUsers(new Set(allUserIds));
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
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
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

        {/* 批量操作工具栏 */}
        {selectedUsers.size > 0 && (
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between'>
            <div className='text-sm text-blue-700'>
              已选择 <strong>{selectedUsers.size}</strong> 个用户
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => setSelectedUsers(new Set())}
                className='px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50'
              >
                取消选择
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={batchDeleting}
                className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {batchDeleting
                  ? '删除中...'
                  : `批量删除 (${selectedUsers.size})`}
              </button>
            </div>
          </div>
        )}

        {/* 用户列表 */}
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          {/* 🔧 新增：可滚动的表格容器 */}
          <div
            ref={tableContainerRef}
            className='overflow-x-auto'
            style={{ scrollbarWidth: 'thin' }}
          >
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12'>
                    <input
                      type='checkbox'
                      checked={
                        selectedUsers.size === users.length && users.length > 0
                      }
                      onChange={handleSelectAll}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                  </th>
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
                {users.map(user => {
                  const userId = String(user.userId || user.id);
                  const isSelected = selectedUsers.has(userId);
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => handleToggleUserSelection(userId)}
                          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                      </td>
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
                          {user.active || user.status === 'enabled'
                            ? '启用'
                            : '禁用'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleUpgradePlan(user)}
                            disabled={
                              updatingUserId === String(user.userId || user.id)
                            }
                            className='px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                            title='升级/更改用户套餐'
                          >
                            升级套餐
                          </button>
                          <button
                            onClick={() =>
                              handleToggleUserStatus(
                                user,
                                user.active || user.status === 'enabled'
                              )
                            }
                            disabled={
                              updatingUserId === String(user.userId || user.id)
                            }
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                              user.active || user.status === 'enabled'
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {updatingUserId === String(user.userId || user.id)
                              ? '处理中...'
                              : user.active || user.status === 'enabled'
                                ? '禁用'
                                : '启用'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={
                              updatingUserId === String(user.userId || user.id)
                            }
                            className='px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200'>
            <div className='text-sm text-gray-700'>
              共 {total} 个用户，第 {page + 1} 页
            </div>
            <div className='flex items-center gap-2'>
              {/* 🔧 新增：左右滑动按钮 */}
              <div className='flex items-center gap-1 border-r border-gray-300 pr-2 mr-2'>
                <button
                  onClick={scrollLeft}
                  disabled={!canScrollLeft}
                  className='p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  title='向左滚动'
                  aria-label='向左滚动表格'
                >
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 19l-7-7 7-7'
                    />
                  </svg>
                </button>
                <button
                  onClick={scrollRight}
                  disabled={!canScrollRight}
                  className='p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  title='向右滚动'
                  aria-label='向右滚动表格'
                >
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </button>
              </div>
              {/* 分页按钮 */}
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
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
