/**
 * 管理员用户行为追踪页面
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */

import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import {
  ActiveUsersChart,
  FunnelChart,
  TrendChart,
} from '../components/admin/BehaviorCharts';
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

interface TrendData {
  trend: { [key: string]: number };
  total: number;
  startDate: string;
  endDate: string;
  groupBy: string;
}

interface FunnelData {
  funnel: Array<{
    name: string;
    count: number;
    conversionRate: number;
  }>;
  overallConversionRate: number;
}

interface ActiveUsersData {
  dailyActiveUsers: { [key: string]: number };
  totalActiveUsers: number;
  avgDailyActiveUsers: number;
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
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [activeUsersData, setActiveUsersData] =
    useState<ActiveUsersData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [groupBy, setGroupBy] = useState<string>('day');
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'analytics'>(
    'overview'
  );
  const pageSize = 20;

  useEffect(() => {
    fetchGlobalStats();
    fetchLogs();
    fetchTrendData();
    fetchFunnelData();
    fetchActiveUsersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, dateRange, groupBy]);

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
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ 修复：检查响应状态和Content-Type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // 返回了HTML（可能是404页面或登录页面）
        const text = await response.text();
        console.error('API返回了非JSON响应:', text.substring(0, 200));
        setError(`获取行为日志失败: 服务器返回了错误响应 (${response.status})`);
        return;
      }

      if (!response.ok) {
        // 尝试解析错误响应
        try {
          const errorResult = await response.json();
          setError(
            errorResult.message || `获取行为日志失败 (${response.status})`
          );
        } catch {
          setError(`获取行为日志失败 (${response.status})`);
        }
        return;
      }

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
      const response = await fetch(
        `${config.apiBaseUrl}/admin/behavior/stats/global`,
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

      // ✅ 修复：检查响应状态和Content-Type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API返回了非JSON响应');
        return;
      }

      if (!response.ok) {
        console.error(`获取全局统计失败: ${response.status}`);
        return;
      }

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
      const response = await fetch(
        `${config.apiBaseUrl}/admin/behavior/stats/user/${userId}`,
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

      // ✅ 修复：检查响应状态和Content-Type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API返回了非JSON响应');
        return;
      }

      if (!response.ok) {
        console.error(`获取用户统计失败: ${response.status}`);
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        setUserStats(result.data);
      }
    } catch (err: any) {
      console.error('获取用户统计失败:', err);
    }
  };

  const fetchTrendData = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError('');
      const token = localStorage.getItem('authToken');
      const url = `${config.apiBaseUrl}/admin/behavior/stats/trend?startDate=${dateRange.start}&endDate=${dateRange.end}&groupBy=${groupBy}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ 修复：检查响应状态和Content-Type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('API返回了非JSON响应:', text.substring(0, 200));
        setAnalyticsError(
          `获取趋势数据失败: 服务器返回了错误响应 (${response.status})`
        );
        return;
      }

      if (!response.ok) {
        try {
          const errorResult = await response.json();
          setAnalyticsError(
            errorResult.message || `获取趋势数据失败 (${response.status})`
          );
        } catch {
          setAnalyticsError(`获取趋势数据失败 (${response.status})`);
        }
        return;
      }

      const result = await response.json();
      if (result.success && result.data) {
        setTrendData(result.data);
      } else {
        setAnalyticsError(result.message || '获取趋势数据失败');
      }
    } catch (err: any) {
      console.error('获取趋势数据失败:', err);
      setAnalyticsError(err.message || '获取趋势数据失败');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchFunnelData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const url = `${config.apiBaseUrl}/admin/behavior/stats/funnel?startDate=${dateRange.start}&endDate=${dateRange.end}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ 修复：检查响应状态和Content-Type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API返回了非JSON响应');
        return;
      }

      if (!response.ok) {
        console.error(`获取漏斗数据失败: ${response.status}`);
        return;
      }

      const result = await response.json();
      if (result.success && result.data) {
        setFunnelData(result.data);
      } else {
        console.error('获取漏斗数据失败:', result.message);
      }
    } catch (err: any) {
      console.error('获取漏斗数据失败:', err);
    }
  };

  const fetchActiveUsersData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const url = `${config.apiBaseUrl}/admin/behavior/stats/active-users?startDate=${dateRange.start}&endDate=${dateRange.end}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ 修复：检查响应状态和Content-Type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API返回了非JSON响应');
        return;
      }

      if (!response.ok) {
        console.error(`获取活跃用户数据失败: ${response.status}`);
        return;
      }

      const result = await response.json();
      if (result.success && result.data) {
        setActiveUsersData(result.data);
      } else {
        console.error('获取活跃用户数据失败:', result.message);
      }
    } catch (err: any) {
      console.error('获取活跃用户数据失败:', err);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const url = `${config.apiBaseUrl}/admin/behavior/export?startDate=${dateRange.start}&endDate=${dateRange.end}${selectedUserId ? `&userId=${selectedUserId}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'text/csv',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `behavior_logs_${dateRange.start}_${dateRange.end}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err: any) {
      console.error('导出数据失败:', err);
      alert('导出数据失败: ' + err.message);
    }
  };

  const getBehaviorTypeName = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      // 登录相关
      QRCODE_SCAN_SUCCESS: '二维码扫码成功',
      QRCODE_SCAN_FAILED: '二维码扫码失败',
      USER_LOGIN: '用户登录',
      USER_LOGOUT: '用户登出',
      // 投递相关
      JOB_DELIVERY_START: '启动投递',
      JOB_DELIVERY_SUCCESS: '投递成功',
      JOB_DELIVERY_FAILED: '投递失败',
      JOB_SEARCH: '搜索职位',
      JOB_VIEW: '查看职位详情',
      JOB_FAVORITE: '收藏职位',
      JOB_UNFAVORITE: '取消收藏职位',
      // 简历相关
      RESUME_UPLOAD: '上传简历',
      RESUME_PARSE: '解析简历',
      RESUME_EDIT: '编辑简历',
      RESUME_DELETE: '删除简历',
      RESUME_DOWNLOAD: '下载简历',
      RESUME_PREVIEW: '预览简历',
      // 打招呼语相关
      GREETING_GENERATE: '生成打招呼语',
      GREETING_USE: '使用打招呼语',
      GREETING_EDIT: '编辑打招呼语',
      GREETING_DELETE: '删除打招呼语',
      // 系统功能相关
      SETTINGS_UPDATE: '更新设置',
      PLAN_UPGRADE: '升级套餐',
      PLAN_DOWNGRADE: '降级套餐',
      QUOTA_CHECK: '查看配额',
      DASHBOARD_VIEW: '查看仪表板',
      STATS_VIEW: '查看统计数据',
      // 其他
      PAGE_VIEW: '页面访问',
      BUTTON_CLICK: '按钮点击',
      FORM_SUBMIT: '表单提交',
      ERROR_OCCURRED: '发生错误',
    };
    return typeMap[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string; text: string } } = {
      SUCCESS: { color: 'bg-green-100 text-green-800', text: '成功' },
      FAILED: { color: 'bg-red-100 text-red-800', text: '失败' },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: '进行中' },
    };
    const statusInfo = statusMap[status] || {
      color: 'bg-gray-100 text-gray-800',
      text: status,
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
      >
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
        {/* 头部工具栏 */}
        <div className='flex items-center justify-between flex-wrap gap-4'>
          <h1 className='text-2xl font-bold text-gray-900'>用户行为追踪</h1>
          <div className='flex items-center gap-4 flex-wrap'>
            {/* 时间范围选择 */}
            <div className='flex items-center gap-2'>
              <label className='text-sm text-gray-600'>时间范围:</label>
              <input
                type='date'
                value={dateRange.start}
                onChange={e =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <span className='text-gray-500'>至</span>
              <input
                type='date'
                value={dateRange.end}
                onChange={e =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            {/* 分组方式 */}
            <select
              value={groupBy}
              onChange={e => setGroupBy(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='day'>按天</option>
              <option value='week'>按周</option>
              <option value='month'>按月</option>
            </select>
            {/* 用户筛选 */}
            <input
              type='text'
              placeholder='输入用户ID筛选'
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            {/* 导出按钮 */}
            <button
              onClick={handleExport}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            >
              导出数据
            </button>
            {/* 清除筛选 */}
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

        {/* 标签页 */}
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              概览
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              数据分析
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              行为日志
            </button>
          </nav>
        </div>

        {/* 概览标签页 */}
        {activeTab === 'overview' && (
          <div className='space-y-6'>
            {/* 全局统计卡片 */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {Object.entries(globalStats)
                .filter(([, stats]) => stats.total > 0)
                .map(([type, stats]) => (
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
                        <span className='font-semibold text-green-600'>
                          {stats.success}
                        </span>
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
                  {Object.entries(userStats)
                    .filter(([, stats]) => stats.total > 0)
                    .map(([type, stats]) => (
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
                            <span className='font-semibold text-green-600'>
                              {stats.success}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-red-600'>失败:</span>
                            <span className='font-semibold text-red-600'>
                              {stats.failed}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 数据分析标签页 */}
        {activeTab === 'analytics' && (
          <div className='space-y-6'>
            {/* 加载状态 */}
            {analyticsLoading && (
              <div className='flex items-center justify-center h-64'>
                <div className='text-center'>
                  <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
                  <p className='mt-4 text-gray-600'>加载数据分析中...</p>
                </div>
              </div>
            )}

            {/* 错误提示 */}
            {analyticsError && !analyticsLoading && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-700'>
                {analyticsError}
              </div>
            )}

            {/* 空数据提示 */}
            {!analyticsLoading &&
              !analyticsError &&
              !trendData &&
              !funnelData &&
              !activeUsersData && (
                <div className='bg-white rounded-lg shadow p-12 text-center'>
                  <div className='text-gray-400 text-6xl mb-4'>📊</div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    暂无数据
                  </h3>
                  <p className='text-gray-600 mb-4'>
                    当前时间范围内没有行为数据，请尝试调整时间范围或等待数据生成。
                  </p>
                  <p className='text-sm text-gray-500'>
                    时间范围: {dateRange.start} 至 {dateRange.end}
                  </p>
                </div>
              )}

            {/* 趋势图 */}
            {!analyticsLoading &&
              trendData &&
              trendData.trend &&
              Object.keys(trendData.trend).length > 0 && (
                <div className='bg-white rounded-lg shadow p-6'>
                  <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                    行为趋势分析
                  </h2>
                  <TrendChart data={trendData.trend} />
                  <div className='mt-4 text-sm text-gray-600'>
                    总计: {trendData.total} 条记录 | 时间范围:{' '}
                    {trendData.startDate} 至 {trendData.endDate} | 分组方式:{' '}
                    {groupBy === 'day'
                      ? '按天'
                      : groupBy === 'week'
                        ? '按周'
                        : '按月'}
                  </div>
                </div>
              )}

            {/* 转化漏斗 */}
            {!analyticsLoading &&
              funnelData &&
              funnelData.funnel &&
              funnelData.funnel.length > 0 && (
                <div className='bg-white rounded-lg shadow p-6'>
                  <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                    转化漏斗分析
                  </h2>
                  <FunnelChart data={funnelData.funnel} />
                  <div className='mt-4 text-sm text-gray-600'>
                    整体转化率: {funnelData.overallConversionRate.toFixed(2)}%
                  </div>
                </div>
              )}

            {/* 活跃用户 */}
            {!analyticsLoading &&
              activeUsersData &&
              activeUsersData.dailyActiveUsers &&
              Object.keys(activeUsersData.dailyActiveUsers).length > 0 && (
                <div className='bg-white rounded-lg shadow p-6'>
                  <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                    活跃用户分析
                  </h2>
                  <ActiveUsersChart data={activeUsersData.dailyActiveUsers} />
                  <div className='mt-4 grid grid-cols-3 gap-4 text-sm'>
                    <div>
                      <span className='text-gray-600'>总活跃用户:</span>
                      <span className='ml-2 font-semibold'>
                        {activeUsersData.totalActiveUsers}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-600'>平均每日活跃:</span>
                      <span className='ml-2 font-semibold'>
                        {activeUsersData.avgDailyActiveUsers.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* 行为日志列表标签页 */}
        {activeTab === 'logs' && (
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
                  {logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className='px-6 py-4 text-center text-gray-500'
                      >
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    logs.map(log => {
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
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
              <div className='text-sm text-gray-700'>
                共 {total} 条记录，第 {page + 1} 页，共{' '}
                {Math.ceil(total / pageSize)} 页
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
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUserBehavior;
