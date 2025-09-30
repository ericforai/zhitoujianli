import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationCode } from '@/lib/sms'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    // Validate phone number
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: '请输入有效的手机号' },
        { status: 400 }
      )
    }

    // Send verification code
    const result = await sendVerificationCode(phone)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 429 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message
    })

  } catch (error) {
    console.error('Send code error:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}


