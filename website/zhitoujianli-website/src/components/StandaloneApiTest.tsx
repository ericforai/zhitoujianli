/**
 * 完全独立的API测试页面
 * 不依赖任何现有服务，直接测试API连接
 */

import React, { useState } from 'react';
import apiClient from '../services/apiService';

const StandaloneApiTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('点击按钮开始测试');
  const [isLoading, setIsLoading] = useState(false);

  const testApi = async () => {
    setIsLoading(true);
    setTestResult('正在测试API连接...');

    try {
      // 使用apiService，自动包含JWT认证
      const response = await apiClient.get('/candidate-resume/check');

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      setTestResult(`✅ API测试成功！
状态码: ${response.status}
响应数据: ${JSON.stringify(response.data, null, 2)}
URL: ${response.config.url}`);
    } catch (error: any) {
      console.error('API测试错误:', error);

      // 检查是否是认证错误
      if (error.response?.status === 401) {
        setTestResult(`🔐 认证失败！
状态码: ${error.response.status}
错误信息: ${error.response.data?.message || '需要登录认证'}
请先登录后再测试API`);
      } else {
        setTestResult(`❌ API测试错误！
状态码: ${error.response?.status || 'N/A'}
错误类型: ${error.name}
错误信息: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#333',
          }}
        >
          🔧 独立API测试工具
        </h1>

        <div
          style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '15px',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#495057' }}>API连接测试</h3>

          <button
            onClick={testApi}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              marginBottom: '15px',
            }}
          >
            {isLoading ? '测试中...' : '开始测试API'}
          </button>

          <pre
            style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '15px',
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
              fontFamily: 'monospace',
              overflow: 'auto',
              maxHeight: '300px',
            }}
          >
            {testResult}
          </pre>
        </div>

        <div
          style={{
            backgroundColor: '#e9ecef',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            padding: '15px',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#495057' }}>系统信息</h3>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <div>
              <strong>前端服务:</strong> {window.location.origin}
            </div>
            <div>
              <strong>后端服务:</strong> {window.location.origin}
            </div>
            <div>
              <strong>测试API:</strong> {window.location.origin}
              /api/candidate-resume/check
            </div>
            <div>
              <strong>测试时间:</strong> {new Date().toLocaleString()}
            </div>
            <div>
              <strong>浏览器:</strong> {navigator.userAgent}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#495057' }}>下一步操作</h3>
          <p style={{ margin: '10px 0', color: '#6c757d' }}>
            如果API测试成功，请：
          </p>
          <div style={{ margin: '10px 0' }}>
            <a
              href='/resume'
              style={{
                display: 'inline-block',
                backgroundColor: '#28a745',
                color: 'white',
                padding: '10px 20px',
                textDecoration: 'none',
                borderRadius: '4px',
                margin: '0 10px',
              }}
            >
              访问简历管理页面
            </a>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                margin: '0 10px',
              }}
            >
              刷新页面
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandaloneApiTest;
