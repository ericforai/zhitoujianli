import { NextRequest, NextResponse } from 'next/server'
import { verifyCode } from '@/lib/sms'
import { generateToken, setAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    // Validate input
    if (!phone || !code) {
      return NextResponse.json(
        { success: false, message: '手机号和验证码不能为空' },
        { status: 400 }
      )
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: '请输入有效的手机号' },
        { status: 400 }
      )
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, message: '请输入6位数字验证码' },
        { status: 400 }
      )
    }

    // Verify code
    if (!verifyCode(phone, code)) {
      return NextResponse.json(
        { success: false, message: '验证码错误或已过期' },
        { status: 400 }
      )
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone }
    })

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: { phone }
      })
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      phone: user.phone
    })

    // Set HTTP-only cookie
    setAuthCookie(token)

    return NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        phone: user.phone,
        isNewUser: !user.createdAt || (Date.now() - user.createdAt.getTime()) < 10000 // New user if created within 10 seconds
      }
    })

  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}


