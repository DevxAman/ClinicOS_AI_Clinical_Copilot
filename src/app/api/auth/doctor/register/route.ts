export const dynamic = 'force-dynamic';
// src/app/api/auth/doctor/register/route.ts
// POST — Register new doctor + create clinic workspace
// Assigns OWNER role, sets TRIAL subscription (14 days)
// Supports: Google OAuth OR Email + Password

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth/jwt'
import { doctorRegisterSchema } from '@/lib/auth/validation'
import { logAuthEvent } from '@/lib/otp/sms'

function generateSlug(clinicName: string): string {
  return clinicName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50)
}

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = base
  let attempt = 0
  while (await prisma.clinic.findUnique({ where: { slug } })) {
    attempt++
    slug = `${base}-${attempt}`
  }
  return slug
}

export async function POST(req: NextRequest) {
  const ip        = req.headers.get('x-forwarded-for') ?? 'unknown'
  const userAgent = req.headers.get('user-agent') ?? ''

  try {
    const body = await req.json()

    // ── Validate input ──────────────────────────────────────────────────────
    const parsed = doctorRegisterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { clinicName, name, email, phone, password, googleId, specialty } = parsed.data

    // ── Check email/phone uniqueness globally ────────────────────────────────
    if (email) {
      const existing = await prisma.doctor.findFirst({ where: { email } })
      if (existing) {
        return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 })
      }
    }

    // ── Generate unique clinic slug ──────────────────────────────────────────
    const baseSlug  = parsed.data.clinicSlug ?? generateSlug(clinicName)
    const slug      = await ensureUniqueSlug(baseSlug)

    // ── Hash password if provided ────────────────────────────────────────────
    const passwordHash = password ? await bcrypt.hash(password, 12) : null

    // ── Create Clinic + Doctor in transaction ────────────────────────────────
    const { clinic, doctor } = await prisma.$transaction(async (tx) => {
      // 1. Create clinic
      const clinic = await tx.clinic.create({
        data: {
          name,
          slug,
          email,
          phone,
          subscriptionStatus: 'TRIAL',
          planType:           'FREE',
          trialEndsAt:        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        },
      })

      // 2. Create doctor as OWNER
      const doctor = await tx.doctor.create({
        data: {
          clinicId:     clinic.id,
          name,
          email,
          phone,
          passwordHash,
          googleId,
          role:         'OWNER',
          specialty,
          isActive:     true,
        },
      })

      return { clinic, doctor }
    })

    // ── Issue JWT tokens ─────────────────────────────────────────────────────
    const accessToken  = await signAccessToken({
      userId:   doctor.id,
      clinicId: clinic.id,
      role:     'OWNER',
      userType: 'DOCTOR',
    } as any)
    const refreshToken = await signRefreshToken({ userId: doctor.id, clinicId: clinic.id } as any)

    // Store refresh token hash in DB
    const refreshHash = await bcrypt.hash(refreshToken, 10)
    await prisma.doctor.update({ where: { id: doctor.id }, data: { refreshToken: refreshHash } })

    // Set HTTP-only cookies
    await setAuthCookies(accessToken, refreshToken)

    // ── Log auth event ───────────────────────────────────────────────────────
    await logAuthEvent({
      clinicId: clinic.id, doctorId: doctor.id,
      action: 'REGISTER', userType: 'DOCTOR',
      email, phone, ip, userAgent, success: true,
    })

    return NextResponse.json({
      success: true,
      data: {
        doctor:   { id: doctor.id, name: doctor.name, email: doctor.email, role: doctor.role },
        clinic:   { id: clinic.id, name: clinic.name, slug: clinic.slug },
        subscription: {
          status:      clinic.subscriptionStatus,
          trialEndsAt: clinic.trialEndsAt,
        },
        accessToken, // Also return in body for mobile clients
      },
    })

  } catch (error) {
    console.error('[DOCTOR REGISTER]', error)
    return NextResponse.json({ success: false, error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}
