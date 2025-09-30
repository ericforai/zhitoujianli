'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()

  const handleSendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setMessage('请输入有效的手机号')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()

      if (data.success) {
        setStep('code')
        setMessage('验证码已发送')
        startCountdown()
      } else {
        setMessage(data.message)
      }
    } catch (error) {
      setMessage('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!code || !/^\d{6}$/.test(code)) {
      setMessage('请输入6位数字验证码')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.user.isNewUser ? '注册成功！' : '登录成功！')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        setMessage(data.message)
      }
    } catch (error) {
      setMessage('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleResendCode = () => {
    if (countdown > 0) return
    handleSendCode()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">智投简历</h1>
          <p className="text-gray-600 mt-2">智能投递 · 精准匹配</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {step === 'phone' ? (
            <>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  手机号
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  maxLength={11}
                />
              </div>
              <button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? '发送中...' : '获取验证码'}
              </button>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  验证码
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="请输入6位验证码"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  maxLength={6}
                />
                <p className="text-sm text-gray-500 mt-2">
                  验证码已发送至 {phone}
                  {countdown > 0 ? (
                    <span className="text-indigo-600 ml-2">{countdown}s后可重发</span>
                  ) : (
                    <button
                      onClick={handleResendCode}
                      className="text-indigo-600 hover:underline ml-2"
                    >
                      重新发送
                    </button>
                  )}
                </p>
              </div>
              <button
                onClick={handleVerifyCode}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? '验证中...' : '登录'}
              </button>
              <button
                onClick={() => setStep('phone')}
                className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                返回修改手机号
              </button>
            </>
          )}

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('成功') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>登录即表示同意</p>
          <p>
            <a href="#" className="text-indigo-600 hover:underline">用户协议</a>
            {' '}和{' '}
            <a href="#" className="text-indigo-600 hover:underline">隐私政策</a>
          </p>
        </div>
      </div>
    </div>
  )
}


