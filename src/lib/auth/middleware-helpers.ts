// src/lib/auth/middleware-helpers.ts
// Reusable middleware helpers for protected API routes
// Use these inside route handlers for fine-grained access control

import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, extractTokenFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'
import type { JWTPayload, DoctorJWTPayload, AuthContext } from '@/types'

type DoctorRole = 'OWNER' | 'DOCTOR' | 'STAFF'

// ── Extract and validate auth context from request ───────────────────────────
export async function requireAuth(req: NextRequest): Promise<{
  context: AuthContext
  error?: never
} | {
  context?: never
  error: NextResponse
}> {
  const token   = extractTokenFromRequest(req)
  const payload = token ? await verifyAccessToken(token) : null

  if (!payload) {
    return { error: NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 }) }
  }

  let userId: string
  if (payload.userType === 'DOCTOR') {
    userId = (payload as DoctorJWTPayload).userId
  } else {
    userId = (payload as any).patientId
  }

  return {
    context: {
      userId,
      clinicId:  payload.clinicId,
      role:      payload.role,
      userType:  payload.userType,
    },
  }
}

// ── Require specific roles ────────────────────────────────────────────────────
export async function requireRole(req: NextRequest, roles: DoctorRole[]): Promise<{
  context: AuthContext
  error?: never
} | {
  context?: never
  error: NextResponse
}> {
  const authResult = await requireAuth(req)
  if (authResult.error) return authResult

  const { context } = authResult

  if (context.userType !== 'DOCTOR') {
    return { error: NextResponse.json({ success: false, error: 'Doctor access required.' }, { status: 403 }) }
  }

  if (!roles.includes(context.role as DoctorRole)) {
    return { error: NextResponse.json({ success: false, error: `Access denied. Required role: ${roles.join(' or ')}.` }, { status: 403 }) }
  }

  return { context }
}

// ── Require patient auth ──────────────────────────────────────────────────────
export async function requirePatient(req: NextRequest): Promise<{
  context: AuthContext
  error?: never
} | {
  context?: never
  error: NextResponse
}> {
  const authResult = await requireAuth(req)
  if (authResult.error) return authResult

  if (authResult.context!.userType !== 'PATIENT') {
    return { error: NextResponse.json({ success: false, error: 'Patient access required.' }, { status: 403 }) }
  }

  return { context: authResult.context! }
}

// ── Check subscription status ─────────────────────────────────────────────────
// Returns error if EXPIRED, allows TRIAL and ACTIVE
export async function checkSubscription(clinicId: string): Promise<NextResponse | null> {
  const clinic = await prisma.clinic.findUnique({
    where:  { id: clinicId },
    select: { subscriptionStatus: true, trialEndsAt: true },
  })

  if (!clinic) {
    return NextResponse.json({ success: false, error: 'Clinic not found.' }, { status: 404 })
  }

  if (clinic.subscriptionStatus === 'TRIAL') {
    if (clinic.trialEndsAt < new Date()) {
      // Trial expired — auto-update to EXPIRED
      await prisma.clinic.update({ where: { id: clinicId }, data: { subscriptionStatus: 'EXPIRED' } })
      return NextResponse.json({
        success: false,
        error:   'Your 14-day trial has expired. Please subscribe to continue.',
        code:    'SUBSCRIPTION_EXPIRED',
      }, { status: 402 })
    }
    return null // Trial still active ✓
  }

  if (clinic.subscriptionStatus === 'EXPIRED') {
    return NextResponse.json({
      success: false,
      error:   'Your subscription has expired. Please renew to continue.',
      code:    'SUBSCRIPTION_EXPIRED',
    }, { status: 402 })
  }

  return null // ACTIVE ✓
}

// ── Enforce clinic isolation — prevent cross-tenant access ───────────────────
// Use this whenever a route receives a resource ID
export async function enforceClinicIsolation(
  requestedClinicId: string,
  authClinicId:      string
): Promise<NextResponse | null> {
  if (requestedClinicId !== authClinicId) {
    return NextResponse.json({ success: false, error: 'Access denied.' }, { status: 403 })
  }
  return null
}
