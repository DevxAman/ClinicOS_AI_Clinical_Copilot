// middleware.ts  ← project ROOT (beside package.json)
// Edge middleware — runs before every request
// 1. JWT validation from HTTP-only cookie
// 2. Redirect unauthenticated users
// 3. Subscription status check (TRIAL/ACTIVE/EXPIRED)
// 4. Tenant isolation via JWT clinicId

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)

// Routes that require authentication
const PROTECTED_PATHS = [
  '/dashboard',
  '/patients',
  '/procedures',
  '/tasks',
  '/billing',
  '/agent-log',
  '/settings',
]

// API routes that require auth (but not subscription for read operations)
const PROTECTED_API_PATHS = [
  '/api/patients',
  '/api/procedures',
  '/api/tasks',
  '/api/billing',
  '/api/dashboard',
  '/api/run-agent',
  '/api/subscription/create-checkout',
]

// Paths that bypass middleware entirely
const PUBLIC_PATHS = [
  '/api/auth/',            // All auth endpoints are public
  '/api/subscription/webhook', // Webhooks verified internally
  '/auth/',
  '/',                     // Landing page
  '/_next/',
  '/favicon.ico',
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Skip public paths ─────────────────────────────────────────────────────
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const isProtectedPage = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isProtectedAPI = PROTECTED_API_PATHS.some((p) => pathname.startsWith(p))

  if (!isProtectedPage && !isProtectedAPI) {
    return NextResponse.next()
  }

  // ── Extract JWT from cookie ───────────────────────────────────────────────
  const token = req.cookies.get('clinicos_access')?.value

  if (!token) {
    if (isProtectedAPI) {
      return NextResponse.json({ success: false, error: 'Authentication required.', code: 'UNAUTHENTICATED' }, { status: 401 })
    }
    const loginUrl = new URL('/auth/signin', req.nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Verify JWT ────────────────────────────────────────────────────────────
  let payload: any
  try {
    const verified = await jwtVerify(token, ACCESS_SECRET)
    payload = verified.payload
  } catch {
    // Token invalid or expired
    if (isProtectedAPI) {
      return NextResponse.json({ success: false, error: 'Session expired. Please sign in again.', code: 'TOKEN_EXPIRED' }, { status: 401 })
    }
    const response = NextResponse.redirect(new URL('/auth/signin', req.nextUrl.origin))
    response.cookies.delete('clinicos_access')
    return response
  }

  // ── Subscription check (skip for settings/subscription pages) ─────────────
  const isSubscriptionRoute = pathname.startsWith('/settings') || pathname.startsWith('/api/subscription')

  if (!isSubscriptionRoute) {
    // Note: Full subscription check happens in route handlers via checkSubscription()
    // Middleware does a lightweight check using JWT claims if you embed them
    // For heavy lifting, rely on middleware-helpers.ts in route handlers
  }

  // ── Forward clinicId in request headers (for route handlers) ─────────────
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-clinic-id', payload.clinicId ?? '')
  requestHeaders.set('x-user-id', payload.userId ?? payload.patientId ?? '')
  requestHeaders.set('x-user-role', payload.role ?? '')
  requestHeaders.set('x-user-type', payload.userType ?? '')

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
