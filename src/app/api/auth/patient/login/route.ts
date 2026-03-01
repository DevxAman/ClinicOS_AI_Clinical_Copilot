export const dynamic = 'force-dynamic';
// src/app/api/auth/patient/login/route.ts
// POST — Initiate patient login
// Patient is NOT self-registering — doctor creates their record
// Steps: validate phone + accessToken + clinicId → send OTP → redirect to verify
//
// Patient must then call /api/auth/otp/verify with userType: 'PATIENT' to complete login

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { patientLoginSchema } from '@/lib/auth/validation'
import { createOTP, checkOTPRateLimit } from '@/lib/otp/otp'
import { sendOTPSMS } from '@/lib/otp/sms'
import { logAuthEvent } from '@/lib/otp/sms'

export async function POST(req: NextRequest) {
  const ip        = req.headers.get('x-forwarded-for') ?? 'unknown'
  const userAgent = req.headers.get('user-agent') ?? ''

  try {
    const body   = await req.json()
    const parsed = patientLoginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { phone, accessToken, clinicId } = parsed.data

    // ── Look up patient by phone + accessToken + clinicId ────────────────────
    // All three must match — strict clinic isolation
    const patient = await prisma.patient.findFirst({
      where: {
        phone,
        accessToken,
        clinicId,   // ← CRITICAL: scope to clinic
      },
      include: { clinic: true },
    })

    if (!patient) {
      await logAuthEvent({ clinicId, action: 'LOGIN', userType: 'PATIENT', phone, ip, userAgent, success: false, reason: 'Patient not found or token mismatch' })
      // Deliberately vague error — no info leakage
      return NextResponse.json({ success: false, error: 'Invalid credentials. Please contact your clinic.' }, { status: 401 })
    }

    // ── Rate limit OTP sends ─────────────────────────────────────────────────
    const allowed = await checkOTPRateLimit(phone, clinicId)
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Too many OTP requests. Please wait 10 minutes.' }, { status: 429 })
    }

    // ── Generate and send OTP ────────────────────────────────────────────────
    const otp = await createOTP({ clinicId, phone, patientId: patient.id })
    await sendOTPSMS(phone, otp)

    await logAuthEvent({ clinicId, action: 'OTP_SENT', userType: 'PATIENT', phone, ip, userAgent, success: true })

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your registered mobile number.',
      phone,  // Return so client can pass to verify step
    })

  } catch (error) {
    console.error('[PATIENT LOGIN]', error)
    return NextResponse.json({ success: false, error: 'Login failed. Please try again.' }, { status: 500 })
  }
}
