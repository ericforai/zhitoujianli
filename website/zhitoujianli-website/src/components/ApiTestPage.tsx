/**
 * 简单的API测试页面
 * 用于验证前端是否能正确调用后端API
 */

import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiService';

const ApiTestPage: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('测试中...');
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('🧪 开始测试API调用...');
        console.log('API Base URL:', apiClient.defaults.baseURL);

        const response = await apiClient.get('/api/candidate-resume/check');
        console.log('✅ API调用成功:', response.data);

        setTestResult(
          `✅ API调用成功！\n状态码: ${response.status}\n响应数据: ${JSON.stringify(response.data, null, 2)}`
        );
        setApiStatus('success');
      } catch (error: any) {
        console.error('❌ API调用失败:', error);

        let errorMessage = '❌ API调用失败！\n';
        if (error.response) {
          errorMessage += `状态码: ${error.response.status}\n`;
          errorMessage += `错误信息: ${error.response.data?.message || error.response.statusText}\n`;
          errorMessage += `请求URL: ${error.config?.url}\n`;
        } else if (error.request) {
          errorMessage += `网络错误: ${error.message}\n`;
          errorMessage += `请求URL: ${error.config?.url}\n`;
        } else {
          errorMessage += `其他错误: ${error.message}\n`;
        }

        setTestResult(errorMessage);
        setApiStatus('error');
      }
    };

    testApi();
  }, []);

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-900 mb-8'>API测试页面</h1>

        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>API连接测试</h2>

          <div
            className={`p-4 rounded-lg ${
              apiStatus === 'loading'
                ? 'bg-yellow-50 border border-yellow-200'
                : apiStatus === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
            }`}
          >
            <pre className='whitespace-pre-wrap text-sm font-mono'>
              {testResult}
            </pre>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-xl font-semibold mb-4'>系统信息</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div>
              <strong>前端服务:</strong> {window.location.origin}
            </div>
            <div>
              <strong>后端服务:</strong> {window.location.origin}
            </div>
            <div>
              <strong>API基础URL:</strong> {apiClient.defaults.baseURL}
            </div>
            <div>
              <strong>测试时间:</strong> {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        <div className='mt-6 text-center'>
          <a
            href='/resume'
            className='inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors'
          >
            返回简历管理页面
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;
