// src/app/api/auth/doctor/login/route.ts
// POST — Doctor login via Email + Password
// Phone + OTP login is handled via /api/auth/otp/send + /api/auth/otp/verify

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth/jwt'
import { doctorLoginEmailSchema } from '@/lib/auth/validation'
import { logAuthEvent } from '@/lib/otp/sms'

export async function POST(req: NextRequest) {
  const ip        = req.headers.get('x-forwarded-for') ?? 'unknown'
  const userAgent = req.headers.get('user-agent') ?? ''

  try {
    const body   = await req.json()
    const parsed = doctorLoginEmailSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { email, password, clinicSlug } = parsed.data

    // ── Find doctor by email ─────────────────────────────────────────────────
    const whereClause = clinicSlug
      ? { email, clinic: { slug: clinicSlug } }
      : { email }

    const doctor = await prisma.doctor.findFirst({
      where: { ...whereClause, isActive: true },
      include: { clinic: true },
    })

    if (!doctor) {
      await logAuthEvent({ clinicId: 'unknown', action: 'LOGIN', userType: 'DOCTOR', email, ip, userAgent, success: false, reason: 'Doctor not found' })
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 })
    }

    if (!doctor.passwordHash) {
      return NextResponse.json({ success: false, error: 'This account uses Google Sign-In. Please use that method.' }, { status: 400 })
    }

    // ── Verify password ──────────────────────────────────────────────────────
    const passwordMatch = await bcrypt.compare(password, doctor.passwordHash)
    if (!passwordMatch) {
      await logAuthEvent({ clinicId: doctor.clinicId, doctorId: doctor.id, action: 'LOGIN', userType: 'DOCTOR', email, ip, userAgent, success: false, reason: 'Wrong password' })
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 })
    }

    // ── Issue tokens ─────────────────────────────────────────────────────────
    const accessToken  = await signAccessToken({
      userId:   doctor.id,
      clinicId: doctor.clinicId,
      role:     doctor.role,
      userType: 'DOCTOR',
    } as any)
    const refreshToken = await signRefreshToken({ userId: doctor.id, clinicId: doctor.clinicId } as any)

    const refreshHash = await bcrypt.hash(refreshToken, 10)
    await prisma.doctor.update({ where: { id: doctor.id }, data: { refreshToken: refreshHash } })

    await setAuthCookies(accessToken, refreshToken)

    await logAuthEvent({ clinicId: doctor.clinicId, doctorId: doctor.id, action: 'LOGIN', userType: 'DOCTOR', email, ip, userAgent, success: true })

    return NextResponse.json({
      success: true,
      data: {
        doctor:  { id: doctor.id, name: doctor.name, email: doctor.email, role: doctor.role },
        clinic:  { id: doctor.clinic.id, name: doctor.clinic.name, slug: doctor.clinic.slug },
        subscription: {
          status:      doctor.clinic.subscriptionStatus,
          trialEndsAt: doctor.clinic.trialEndsAt,
        },
        accessToken,
      },
    })

  } catch (error) {
    console.error('[DOCTOR LOGIN]', error)
    return NextResponse.json({ success: false, error: 'Login failed. Please try again.' }, { status: 500 })
  }
}
