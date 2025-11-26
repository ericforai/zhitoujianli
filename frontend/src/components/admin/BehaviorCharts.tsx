/**
 * 用户行为图表组件
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-XX
 */

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrendData {
  [key: string]: number;
}

interface FunnelStep {
  name: string;
  count: number;
  conversionRate: number;
}

interface BehaviorChartsProps {
  trendData?: TrendData;
  funnelData?: FunnelStep[];
  activeUsersData?: { [key: string]: number };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

/**
 * 行为趋势折线图
 */
export const TrendChart: React.FC<{ data: TrendData }> = ({ data }) => {
  const chartData = Object.entries(data).map(([date, value]) => ({
    date,
    count: value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * 转化漏斗图
 */
export const FunnelChart: React.FC<{ data: FunnelStep[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={120} />
        <Tooltip
          formatter={(value: number, name: string, props: any) => {
            if (name === 'count') {
              return [`${value} 人`, '数量'];
            }
            return [`${props.payload.conversionRate}%`, '转化率'];
          }}
        />
        <Legend />
        <Bar dataKey="count" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * 活跃用户折线图
 */
export const ActiveUsersChart: React.FC<{ data: { [key: string]: number } }> = ({ data }) => {
  const chartData = Object.entries(data).map(([date, count]) => ({
    date,
    activeUsers: count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="activeUsers"
          stroke="#10b981"
          strokeWidth={2}
          name="活跃用户数"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * 行为分布饼图
 */
export const BehaviorDistributionChart: React.FC<{ data: { [key: string]: number } }> = ({
  data,
}) => {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // 只显示前10个

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * 行为图表容器组件
 */
const BehaviorCharts: React.FC<BehaviorChartsProps> = ({
  trendData,
  funnelData,
  activeUsersData,
}) => {
  return (
    <div className="space-y-6">
      {trendData && Object.keys(trendData).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">行为趋势</h3>
          <TrendChart data={trendData} />
        </div>
      )}

      {funnelData && funnelData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">转化漏斗</h3>
          <FunnelChart data={funnelData} />
        </div>
      )}

      {activeUsersData && Object.keys(activeUsersData).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">活跃用户趋势</h3>
          <ActiveUsersChart data={activeUsersData} />
        </div>
      )}
    </div>
  );
};

export default BehaviorCharts;




