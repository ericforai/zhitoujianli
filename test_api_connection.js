/**
 * API连接测试脚本
 * 测试前端到后端的API连接
 */

const axios = require('axios');

async function testApiConnection() {
  console.log('🔍 开始测试API连接...\n');

  // 测试1: 直接访问后端API
  console.log('1. 测试直接后端API访问');
  try {
    const response = await axios.post('http://115.190.182.95:8080/api/auth/login/email', {
      email: 'test@example.com',
      password: 'test123'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://115.190.182.95'
      }
    });
    console.log('✅ 后端API响应:', response.data);
  } catch (error) {
    console.log('❌ 后端API错误:', error.response?.data || error.message);
  }

  // 测试2: 测试CORS预检请求
  console.log('\n2. 测试CORS预检请求');
  try {
    const response = await axios.options('http://115.190.182.95:8080/api/auth/login/email', {
      headers: {
        'Origin': 'http://115.190.182.95',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('✅ CORS预检成功');
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
    });
  } catch (error) {
    console.log('❌ CORS预检失败:', error.message);
  }

  // 测试3: 测试前端配置的API URL
  console.log('\n3. 测试前端配置的API URL');
  const apiBaseUrl = 'http://115.190.182.95:8080/api';
  try {
    const response = await axios.post(`${apiBaseUrl}/auth/login/email`, {
      email: 'test@example.com',
      password: 'test123'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://115.190.182.95'
      }
    });
    console.log('✅ 前端配置API响应:', response.data);
  } catch (error) {
    console.log('❌ 前端配置API错误:', error.response?.data || error.message);
  }

  // 测试4: 测试前端服务连接
  console.log('\n4. 测试前端服务连接');
  try {
    const response = await axios.get('http://localhost:3000');
    console.log('✅ 前端服务正常运行');
  } catch (error) {
    console.log('❌ 前端服务连接失败:', error.message);
  }

  console.log('\n🎯 测试完成');
}

testApiConnection().catch(console.error);

