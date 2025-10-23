'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)

    try {
      // 调用后端logout API
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 包含cookies
      })

      if (response.ok) {
        // 清除本地存储
        localStorage.removeItem('auth-token')
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        // 跳转到登录页
        router.push('/login')
      } else {
        console.error('Logout failed:', response.statusText)
        // 即使API失败，也要清除本地状态并跳转
        localStorage.removeItem('auth-token')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
      // 即使出错，也要清除本地状态并跳转
      localStorage.removeItem('auth-token')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
    >
      {loading ? '退出中...' : '退出登录'}
    </button>
  )
}


