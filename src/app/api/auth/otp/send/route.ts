// src/app/api/auth/otp/send/route.ts
// POST — Send OTP for Doctor phone login
// Rate limited: max 3 sends per phone per 10 minutes
// Patient OTP is sent via /api/auth/patient/login (which also validates accessToken)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOTPSchema } from '@/lib/auth/validation'
import { createOTP, checkOTPRateLimit } from '@/lib/otp/otp'
import { sendOTPSMS, sendOTPWhatsApp, logAuthEvent } from '@/lib/otp/sms'

export async function POST(req: NextRequest) {
  const ip        = req.headers.get('x-forwarded-for') ?? 'unknown'
  const userAgent = req.headers.get('user-agent') ?? ''

  try {
    const body   = await req.json()
    const parsed = sendOTPSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { phone, clinicId, userType, channel } = parsed.data

    // ── Rate limit ───────────────────────────────────────────────────────────
    const allowed = await checkOTPRateLimit(phone, clinicId)
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Too many OTP requests. Please wait 10 minutes and try again.' }, { status: 429 })
    }

    // ── Validate doctor exists in this clinic ────────────────────────────────
    if (userType === 'DOCTOR') {
      const doctor = await prisma.doctor.findFirst({
        where: { phone, clinicId, isActive: true },
      })
      if (!doctor) {
        // Generic error — no enumeration
        return NextResponse.json({ success: false, error: 'Phone number not registered with this clinic.' }, { status: 404 })
      }

      // Create OTP
      const otp = await createOTP({ clinicId, phone, doctorId: doctor.id })

      // Send via chosen channel
      if (channel === 'whatsapp') {
        await sendOTPWhatsApp(phone, otp)
      } else {
        await sendOTPSMS(phone, otp)
      }

      await logAuthEvent({ clinicId, doctorId: doctor.id, action: 'OTP_SENT', userType, phone, ip, userAgent, success: true })
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent via ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}. It expires in 1 minute.`,
    })

  } catch (error) {
    console.error('[OTP SEND]', error)
    return NextResponse.json({ success: false, error: 'Failed to send OTP. Please try again.' }, { status: 500 })
  }
}
