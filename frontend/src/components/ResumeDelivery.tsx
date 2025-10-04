/**
 * 投递简历页面组件
 *
 * 用户登录后的主要功能页面，包含：
 * 1. 简历管理
 * 2. 职位搜索和投递
 * 3. 投递记录
 * 4. 智能匹配
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-03
 */

import React, { useEffect, useState, useRef } from 'react';
import { authService } from '../services/authService';
import BossDelivery from './BossDelivery';
import resumeService, { CandidateInfo } from '../services/resumeService';

const ResumeDelivery: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 检查登录状态
    if (!authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    const userData = authService.getCachedUser();
    setUser(userData);
    
    // 加载已有简历
    loadExistingResume();
  }, []);

  // 加载已有简历
  const loadExistingResume = async () => {
    try {
      const result = await resumeService.loadResume();
      if (result.success && result.data) {
        setCandidateInfo(result.data);
      }
    } catch (error) {
      console.error('加载简历失败:', error);
    }
  };

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      setUploadMessage('文件过大，请上传小于10MB的文件');
      return;
    }

    // 检查文件类型
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.txt') && !fileName.endsWith('.pdf') && 
        !fileName.endsWith('.doc') && !fileName.endsWith('.docx')) {
      setUploadMessage('不支持的文件格式，请上传TXT、PDF、DOC、DOCX文件');
      return;
    }

    setUploading(true);
    setUploadMessage('正在上传文件并解析简历...');

    try {
      const result = await resumeService.uploadResume(file);
      if (result.success && result.data) {
        setCandidateInfo(result.data);
        setUploadMessage('简历上传并解析成功！');
      } else {
        setUploadMessage(result.message || '简历解析失败');
      }
    } catch (error: any) {
      setUploadMessage(error.message || '简历上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  智投简历
                </h1>
              </div>
            </div>

            {/* 用户信息 */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">欢迎，{user.username || user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">投递简历</h2>
          <p className="mt-2 text-gray-600">使用AI智能匹配，找到最适合的职位</p>
        </div>

        {/* 功能标签页 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: '工作台', icon: '📊' },
              { id: 'boss', name: 'Boss投递', icon: '🚀' },
              { id: 'resume', name: '简历管理', icon: '📄' },
              { id: 'jobs', name: '职位搜索', icon: '🔍' },
              { id: 'delivery', name: '投递记录', icon: '📤' },
              { id: 'matching', name: '智能匹配', icon: '🎯' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 标签页内容 */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'dashboard' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">工作台概览</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-gray-600">今日投递</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-gray-600">待回复</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-gray-600">面试邀请</div>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-gray-600">开始使用智投简历，让AI帮你找到心仪的工作！</p>
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={() => setActiveTab('resume')}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    上传简历
                  </button>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    搜索职位
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Boss直聘投递 Tab */}
          {activeTab === 'boss' && (
            <BossDelivery />
          )}

          {activeTab === 'resume' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">简历管理</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 上传简历 */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        拖拽文件到此处，或
                        <span className="text-indigo-600 hover:text-indigo-500">点击选择文件</span>
                      </span>
                      <input 
                        ref={fileInputRef}
                        id="resume-upload" 
                        name="resume-upload" 
                        type="file" 
                        className="sr-only" 
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">支持 PDF, DOC, DOCX, TXT 格式，最大 10MB</p>
                    
                    {/* 上传状态显示 */}
                    {uploading && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-sm text-blue-600">正在上传和解析...</span>
                        </div>
                      </div>
                    )}
                    
                    {uploadMessage && !uploading && (
                      <div className={`mt-4 p-3 rounded-lg ${
                        uploadMessage.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        <p className="text-sm">{uploadMessage}</p>
                      </div>
                    )}
                    
                    {/* 简历信息显示 */}
                    {candidateInfo && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">已上传简历信息：</h5>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>姓名：</strong>{candidateInfo.name}</p>
                          <p><strong>联系方式：</strong>{candidateInfo.phone || candidateInfo.email}</p>
                          <p><strong>学历：</strong>{candidateInfo.education}</p>
                          <p><strong>工作经验：</strong>{candidateInfo.workExperience}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Boss直聘投递配置 */}
                <div className="space-y-4">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-blue-900 mb-3">🚀 Boss直聘自动投递</h4>
                    <p className="text-blue-700 text-sm mb-4">
                      配置投递参数，让AI帮你自动投递简历到Boss直聘
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => window.open('http://115.190.182.95:8080', '_blank')}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        📋 配置投递参数
                      </button>
                      <button
                        onClick={() => window.open('http://115.190.182.95:8080/resume-manager', '_blank')}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        📄 管理简历内容
                      </button>
                      <button
                        onClick={() => window.open('http://115.190.182.95:8080?start=true', '_blank')}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        ▶️ 启动自动投递
                      </button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-yellow-800 mb-2">💡 使用提示</h5>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      <li>• 首次使用需要上传简历并配置投递参数</li>
                      <li>• 系统会自动搜索匹配的职位并投递</li>
                      <li>• 支持智能打招呼语生成</li>
                      <li>• 投递过程完全自动化</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">职位搜索与投递</h3>
              <div className="space-y-6">
                {/* 快速操作 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                    <h4 className="font-semibold mb-2">🔍 智能搜索</h4>
                    <p className="text-sm opacity-90 mb-3">基于关键词自动搜索匹配职位</p>
                    <button
                      onClick={() => window.open('http://115.190.182.95:8080', '_blank')}
                      className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                    >
                      配置搜索条件
                    </button>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                    <h4 className="font-semibold mb-2">🎯 精准匹配</h4>
                    <p className="text-sm opacity-90 mb-3">AI分析简历与职位匹配度</p>
                    <button
                      onClick={() => window.open('http://115.190.182.95:8080/resume-manager', '_blank')}
                      className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                    >
                      优化简历内容
                    </button>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                    <h4 className="font-semibold mb-2">⚡ 自动投递</h4>
                    <p className="text-sm opacity-90 mb-3">一键启动全自动投递流程</p>
                    <button
                      onClick={() => window.open('http://115.190.182.95:8080?start=true', '_blank')}
                      className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
                    >
                      开始自动投递
                    </button>
                  </div>
                </div>

                {/* 投递状态监控 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">📊 投递状态监控</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-sm text-gray-600">今日投递</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-600">成功投递</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">0</div>
                      <div className="text-sm text-gray-600">待回复</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">0</div>
                      <div className="text-sm text-gray-600">面试邀请</div>
                    </div>
                  </div>
                </div>

                {/* 使用说明 */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h4 className="font-semibold text-yellow-800 mb-3">📖 使用说明</h4>
                  <div className="space-y-2 text-yellow-700 text-sm">
                    <p><strong>第一步：</strong>点击"配置搜索条件"设置关键词、城市等投递参数</p>
                    <p><strong>第二步：</strong>点击"优化简历内容"上传并解析您的简历</p>
                    <p><strong>第三步：</strong>点击"开始自动投递"启动AI自动投递流程</p>
                    <p><strong>第四步：</strong>在后台管理页面监控投递进度和结果</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">投递记录</h3>
              <div className="space-y-6">
                {/* 实时投递状态 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">📈 投递统计</h4>
                    <button
                      onClick={() => window.open('http://115.190.182.95:8080', '_blank')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      查看详细记录 →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-sm text-gray-600">总投递数</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-600">成功投递</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">0</div>
                      <div className="text-sm text-gray-600">HR回复</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">0%</div>
                      <div className="text-sm text-gray-600">回复率</div>
                    </div>
                  </div>
                </div>

                {/* 投递记录列表 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">📋 最近投递记录</h4>
                  <div className="text-center py-12 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-lg">暂无投递记录</p>
                    <p className="text-sm mt-2">开始使用自动投递功能后，记录将显示在这里</p>
                    <button
                      onClick={() => setActiveTab('jobs')}
                      className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      开始投递
                    </button>
                  </div>
                </div>

                {/* 快速操作 */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
                  <h4 className="font-semibold text-indigo-900 mb-3">🚀 快速操作</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => window.open('http://115.190.182.95:8080', '_blank')}
                      className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-center"
                    >
                      📊 查看投递统计
                    </button>
                    <button
                      onClick={() => window.open('http://115.190.182.95:8080/resume-manager', '_blank')}
                      className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
                    >
                      📄 管理简历
                    </button>
                    <button
                      onClick={() => window.open('http://115.190.182.95:8080?start=true', '_blank')}
                      className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors text-center"
                    >
                      ▶️ 启动投递
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matching' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">智能匹配分析</h3>
              <div className="space-y-6">
                {/* AI匹配功能展示 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 mb-3">🎯 智能匹配原理</h4>
                    <ul className="space-y-2 text-blue-800 text-sm">
                      <li>• <strong>简历解析：</strong>AI自动提取技能、经验、项目等关键信息</li>
                      <li>• <strong>职位分析：</strong>深度分析JD要求，识别核心技能和偏好</li>
                      <li>• <strong>匹配算法：</strong>多维度计算匹配度，智能排序推荐</li>
                      <li>• <strong>个性化投递：</strong>生成定制化打招呼语，提升回复率</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-lg p-6">
                    <h4 className="font-semibold text-green-900 mb-3">📊 匹配效果</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-green-800 text-sm">投递成功率</span>
                        <span className="text-2xl font-bold text-green-600">95%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-800 text-sm">HR回复率</span>
                        <span className="text-2xl font-bold text-green-600">78%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-800 text-sm">面试邀请率</span>
                        <span className="text-2xl font-bold text-green-600">45%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 功能特色 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">✨ 核心功能特色</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🤖</span>
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-2">AI简历解析</h5>
                      <p className="text-gray-600 text-sm">智能提取关键信息，精准匹配岗位要求</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">💬</span>
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-2">智能打招呼</h5>
                      <p className="text-gray-600 text-sm">基于简历和JD生成个性化投递内容</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-2">自动投递</h5>
                      <p className="text-gray-600 text-sm">全流程自动化，24小时不间断投递</p>
                    </div>
                  </div>
                </div>

                {/* 使用指南 */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                  <h4 className="font-semibold text-yellow-900 mb-3">📖 智能匹配使用指南</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-yellow-800 mb-2">第一步：上传简历</h5>
                      <p className="text-yellow-700 text-sm mb-3">在简历管理页面上传您的简历，AI会自动解析关键信息</p>
                      <button
                        onClick={() => setActiveTab('resume')}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors"
                      >
                        去上传简历
                      </button>
                    </div>
                    <div>
                      <h5 className="font-medium text-yellow-800 mb-2">第二步：启动匹配</h5>
                      <p className="text-yellow-700 text-sm mb-3">配置搜索条件后，AI会自动匹配最适合的职位</p>
                      <button
                        onClick={() => window.open('http://115.190.182.95:8080', '_blank')}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors"
                      >
                        配置匹配参数
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeDelivery;
