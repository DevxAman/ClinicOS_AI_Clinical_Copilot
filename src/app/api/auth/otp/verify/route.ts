// src/app/api/auth/otp/verify/route.ts
// POST — Verify OTP and issue JWT for Doctor OR Patient
// Handles both userType flows with strict clinic isolation

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { verifyOTPSchema } from '@/lib/auth/validation'
import { verifyOTP } from '@/lib/otp/otp'
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth/jwt'
import { logAuthEvent } from '@/lib/otp/sms'

export async function POST(req: NextRequest) {
  const ip        = req.headers.get('x-forwarded-for') ?? 'unknown'
  const userAgent = req.headers.get('user-agent') ?? ''

  try {
    const body   = await req.json()
    const parsed = verifyOTPSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { phone, code, clinicId, userType } = parsed.data

    // ── Verify OTP (checks expiry, attempts, bcrypt hash) ────────────────────
    const result = await verifyOTP({ clinicId, phone, code })

    if (!result.success) {
      await logAuthEvent({ clinicId, action: 'OTP_FAILED', userType, phone, ip, userAgent, success: false, reason: result.reason })
      return NextResponse.json({ success: false, error: result.reason }, { status: 400 })
    }

    // ── DOCTOR flow ──────────────────────────────────────────────────────────
    if (userType === 'DOCTOR') {
      const doctor = await prisma.doctor.findFirst({
        where: { phone, clinicId, isActive: true },
        include: { clinic: true },
      })

      if (!doctor) {
        return NextResponse.json({ success: false, error: 'Doctor account not found.' }, { status: 404 })
      }

      const accessToken  = await signAccessToken({
        userId:   doctor.id,
        clinicId: doctor.clinicId,
        role:     doctor.role,
        userType: 'DOCTOR',
      } as any)
      const refreshToken = await signRefreshToken({ userId: doctor.id, clinicId: doctor.clinicId } as any)
      const refreshHash  = await bcrypt.hash(refreshToken, 10)

      await prisma.doctor.update({ where: { id: doctor.id }, data: { refreshToken: refreshHash } })
      await setAuthCookies(accessToken, refreshToken)

      await logAuthEvent({ clinicId, doctorId: doctor.id, action: 'OTP_SUCCESS', userType, phone, ip, userAgent, success: true })

      return NextResponse.json({
        success: true,
        data: {
          doctor:  { id: doctor.id, name: doctor.name, phone: doctor.phone, role: doctor.role },
          clinic:  { id: doctor.clinic.id, name: doctor.clinic.name, slug: doctor.clinic.slug },
          subscription: {
            status:      doctor.clinic.subscriptionStatus,
            trialEndsAt: doctor.clinic.trialEndsAt,
          },
          accessToken,
        },
      })
    }

    // ── PATIENT flow ─────────────────────────────────────────────────────────
    if (userType === 'PATIENT') {
      const patient = await prisma.patient.findFirst({
        where: { phone, clinicId },
        include: { clinic: true },
      })

      if (!patient) {
        return NextResponse.json({ success: false, error: 'Patient account not found.' }, { status: 404 })
      }

      const accessToken = await signAccessToken({
        patientId: patient.id,
        clinicId:  patient.clinicId,
        role:      'PATIENT',
        userType:  'PATIENT',
      } as any)
      // Patients get shorter-lived tokens, no refresh token
      await setAuthCookies(accessToken, '')

      await logAuthEvent({ clinicId, action: 'OTP_SUCCESS', userType, phone, ip, userAgent, success: true })

      return NextResponse.json({
        success: true,
        data: {
          patient: { id: patient.id, name: patient.name, phone: patient.phone },
          clinic:  { id: patient.clinic.id, name: patient.clinic.name },
          accessToken,
        },
      })
    }

    return NextResponse.json({ success: false, error: 'Invalid userType.' }, { status: 400 })

  } catch (error) {
    console.error('[OTP VERIFY]', error)
    return NextResponse.json({ success: false, error: 'Verification failed. Please try again.' }, { status: 500 })
  }
}
