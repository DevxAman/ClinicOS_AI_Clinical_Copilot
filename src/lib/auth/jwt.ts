// src/lib/auth/jwt.ts
// JWT utility — sign, verify, cookie helpers
// Install: npm install jose

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import type { DoctorJWTPayload, PatientJWTPayload, JWTPayload } from '@/types'

const ACCESS_SECRET  = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!)

const ACCESS_EXPIRY  = '15m'   // Short-lived
const REFRESH_EXPIRY = '30d'   // Long-lived

// ── Sign access token ────────────────────────────────────────────────────────
export async function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRY)
    .sign(ACCESS_SECRET)
}

// ── Sign refresh token ───────────────────────────────────────────────────────
export async function signRefreshToken(payload: { userId: string; clinicId: string }): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRY)
    .sign(REFRESH_SECRET)
}

// ── Verify access token ──────────────────────────────────────────────────────
export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// ── Verify refresh token ─────────────────────────────────────────────────────
export async function verifyRefreshToken(token: string): Promise<{ userId: string; clinicId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET)
    return payload as { userId: string; clinicId: string }
  } catch {
    return null
  }
}

// ── Extract JWT from Request (header or cookie) ──────────────────────────────
export function extractTokenFromRequest(req: NextRequest): string | null {
  // 1. Authorization: Bearer <token>
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  // 2. HTTP-only cookie
  return req.cookies.get('clinicos_access')?.value ?? null
}

// ── Set auth cookies (HTTP-only) ─────────────────────────────────────────────
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies()
  const isProd = process.env.NODE_ENV === 'production'

  cookieStore.set('clinicos_access', accessToken, {
    httpOnly: true,
    secure:   isProd,
    sameSite: 'lax',
    maxAge:   60 * 15,           // 15 minutes
    path:     '/',
  })

  cookieStore.set('clinicos_refresh', refreshToken, {
    httpOnly: true,
    secure:   isProd,
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 30, // 30 days
    path:     '/',
  })
}

// ── Clear auth cookies ────────────────────────────────────────────────────────
export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete('clinicos_access')
  cookieStore.delete('clinicos_refresh')
}

// ── Get auth context from cookie (for server components) ─────────────────────
export async function getAuthContext(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('clinicos_access')?.value
  if (!token) return null
  return verifyAccessToken(token)
}
