/**
 * Boss登录组件 - 手动Cookie上传方案
 *
 * 用户在本地浏览器登录Boss后，手动提取Cookie并上传
 * 这是唯一可靠的方案，因为服务器无图形界面无法生成二维码
 *
 * @author ZhiTouJianLi Team
 * @since 2025-12-12
 */

import React, { useState } from 'react';
import bossLoginService from '../services/bossLoginService';

interface BossCookieUploadManualProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BossCookieUploadManual: React.FC<BossCookieUploadManualProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cookieInput, setCookieInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cookie提取脚本
  const extractScript = `JSON.stringify(document.cookie.split('; ').map(c => { const [name, ...rest] = c.split('='); return { name, value: rest.join('='), domain: '.zhipin.com', path: '/' }; }))`;

  // Bookmarklet版本 - 用于地址栏执行，自动复制结果到剪贴板
  // 注意：直接显示结果让用户手动复制，避免剪贴板权限问题
  const bookmarkletCode = `javascript:void(function(){var c=JSON.stringify(document.cookie.split('; ').map(function(c){var p=c.split('=');return{name:p[0],value:p.slice(1).join('='),domain:'.zhipin.com',path:'/'}}));prompt('请全选下方内容并复制(Ctrl+A, Ctrl+C)：',c)})();`;

  // 复制Boss网址
  const copyBossUrl = async () => {
    const url = 'https://www.zhipin.com';
    try {
      await navigator.clipboard.writeText(url);
      alert('网址已复制！请打开新标签页粘贴访问');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('网址已复制！请打开新标签页粘贴访问');
    }
  };

  // 打开Boss登录页（保留备用）
  const openBossLogin = () => {
    window.open(
      'https://www.zhipin.com/web/user/?ka=header-login',
      '_blank',
      'width=1200,height=800'
    );
    setStep(2);
  };

  // 复制bookmarklet代码
  const copyBookmarklet = async () => {
    try {
      await navigator.clipboard.writeText(bookmarkletCode);
      alert('代码已复制！请粘贴到Boss直聘页面的地址栏中，然后按回车');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = bookmarkletCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('代码已复制！请粘贴到Boss直聘页面的地址栏中，然后按回车');
    }
  };

  // 复制脚本到剪贴板（保留旧方法作为备用）
  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(extractScript);
      alert('脚本已复制到剪贴板！');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = extractScript;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('脚本已复制到剪贴板！');
    }
  };

  // 上传Cookie
  const handleUpload = async () => {
    if (!cookieInput.trim()) {
      setError('请粘贴Cookie内容');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 解析Cookie
      const cookies = bossLoginService.parseCookieString(cookieInput.trim());

      // 验证Cookie
      const validation = bossLoginService.validateCookies(cookies);
      if (!validation.valid) {
        setError(validation.message);
        setIsUploading(false);
        return;
      }

      // 上传Cookie
      const result = await bossLoginService.uploadCookie(cookies);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 1500);
      } else {
        setError(result.message || '上传失败，请重试');
      }
    } catch (err: any) {
      setError(err.message || '上传失败，请检查Cookie格式');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        {/* 标题栏 */}
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl'>
          <h2 className='text-xl font-bold text-gray-900'>
            Boss直聘登录
          </h2>
          <button
            onClick={onCancel}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* 成功状态 */}
        {success ? (
          <div className='p-8 text-center'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-green-700 mb-2'>登录成功！</h3>
            <p className='text-gray-600'>Cookie已保存，您现在可以使用投递功能了</p>
          </div>
        ) : (
          <div className='p-6'>
            {/* 步骤指示器 */}
            <div className='flex items-center justify-center mb-8'>
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* 步骤1：打开Boss登录页 */}
            {step === 1 && (
              <div className='space-y-6'>
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <h3 className='font-semibold text-blue-900 mb-2'>第一步：登录Boss直聘</h3>
                  <p className='text-blue-700 text-sm mb-4'>
                    请<strong>手动打开新标签页</strong>，复制下方网址访问Boss直聘并登录。
                  </p>

                  {/* 网址显示和复制 */}
                  <div className='bg-white border border-blue-300 rounded-lg p-3 flex items-center justify-between mb-4'>
                    <code className='text-sm text-gray-700 truncate flex-1'>
                      https://www.zhipin.com
                    </code>
                    <button
                      onClick={copyBossUrl}
                      className='ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700'
                    >
                      复制网址
                    </button>
                  </div>

                  <div className='bg-blue-100 rounded p-3 text-sm text-blue-800'>
                    <strong>操作步骤：</strong>
                    <ol className='list-decimal list-inside mt-2 space-y-1'>
                      <li>按 <kbd className='px-1 bg-blue-200 rounded'>Ctrl+T</kbd> 打开新标签页</li>
                      <li>在地址栏粘贴网址，按回车</li>
                      <li>用手机Boss直聘App扫码登录</li>
                    </ol>
                  </div>
                </div>

                <p className='text-gray-500 text-sm text-center'>
                  登录成功后，请点击下方按钮继续
                </p>
                <button
                  onClick={() => setStep(2)}
                  className='w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700'
                >
                  我已登录，继续下一步
                </button>
              </div>
            )}

            {/* 步骤2：提取Cookie - 最简方案 */}
            {step === 2 && (
              <div className='space-y-6'>
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                  <h3 className='font-semibold text-yellow-900 mb-3'>第二步：提取Cookie</h3>

                  <div className='space-y-4'>
                    <div className='bg-white border border-yellow-300 rounded-lg p-4'>
                      <p className='font-medium text-yellow-900 mb-3'>请按以下步骤操作：</p>
                      <ol className='text-yellow-800 text-sm space-y-3 list-decimal list-inside'>
                        <li>
                          在Boss直聘页面按 <kbd className='px-2 py-1 bg-yellow-100 rounded font-bold'>F12</kbd> 打开开发者工具
                        </li>
                        <li>
                          点击顶部的 <strong>Console</strong>（控制台）标签
                        </li>
                        <li>
                          如果看到警告，先在底部输入 <code className='bg-yellow-100 px-1'>allow pasting</code> 并按回车
                        </li>
                        <li>
                          点击下方<strong>&ldquo;复制代码&rdquo;</strong>按钮
                        </li>
                        <li>
                          在Console底部的输入框中<strong>粘贴</strong>（⌘+V），按<strong>回车</strong>
                        </li>
                        <li>
                          <strong>双击</strong>输出的结果（黄色文字），然后<strong>复制</strong>（⌘+C）
                        </li>
                      </ol>
                    </div>

                    {/* Console示意图 */}
                    <div className='bg-gray-800 rounded-lg p-3 font-mono text-xs'>
                      <div className='text-gray-400 mb-2'>Console</div>
                      <div className='text-yellow-400 mb-2'>&gt; {`[{"name":"wt2","value":"xxx"...}]`}</div>
                      <div className='text-gray-500 mb-1'>↑ 双击这行黄色文字选中，然后复制</div>
                      <div className='border-t border-gray-600 pt-2 flex items-center'>
                        <span className='text-blue-400 mr-2'>&gt;</span>
                        <span className='text-gray-500'>在这里粘贴代码并回车</span>
                      </div>
                    </div>

                    {/* 复制代码按钮 */}
                    <div className='text-center'>
                      <button
                        onClick={copyScript}
                        className='px-8 py-4 bg-blue-600 text-white font-bold rounded-lg text-lg shadow-lg hover:bg-blue-700'
                      >
                        📋 复制代码
                      </button>
                    </div>
                  </div>
                </div>

                <div className='flex space-x-3'>
                  <button
                    onClick={() => setStep(1)}
                    className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
                  >
                    上一步
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className='flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                  >
                    我已复制Cookie，继续
                  </button>
                </div>
              </div>
            )}

            {/* 步骤3：粘贴上传 */}
            {step === 3 && (
              <div className='space-y-6'>
                <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                  <h3 className='font-semibold text-green-900 mb-2'>第三步：粘贴Cookie并上传</h3>
                  <p className='text-green-700 text-sm'>
                    将从Console复制的内容粘贴到下方输入框中
                  </p>
                </div>

                <textarea
                  value={cookieInput}
                  onChange={(e) => setCookieInput(e.target.value)}
                  placeholder='在此粘贴从Console复制的Cookie内容...'
                  className='w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm'
                />

                {error && (
                  <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                    <p className='text-red-700 text-sm'>{error}</p>
                  </div>
                )}

                <div className='flex space-x-3'>
                  <button
                    onClick={() => setStep(2)}
                    className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
                  >
                    上一步
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading || !cookieInput.trim()}
                    className='flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
                  >
                    {isUploading ? '上传中...' : '确认上传'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BossCookieUploadManual;
