// src/lib/otp/sms.ts
// SMS delivery via Fast2SMS (India) — Quick Transactional route
// Falls back to console-logging in dev mode if Fast2SMS is not yet activated
//
// Fast2SMS Quick route: No DLT registration required
// API: GET https://www.fast2sms.com/dev/bulkV2?authorization=KEY&route=q&message=MSG&numbers=PHONE

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || ''
const IS_DEV = process.env.NODE_ENV === 'development'

// ── Send OTP via Fast2SMS or dev console ──────────────────────────────────────
export async function sendOTPSMS(phone: string, otp: string): Promise<void> {
  // Strip +91 or + prefix — Fast2SMS expects 10-digit Indian number
  const cleanNumber = phone.replace(/^\+91/, '').replace(/^\+/, '').replace(/\D/g, '')
  const message = `Your ClinicOS verification code is ${otp}. Valid for 2 minutes. Do not share this code.`

  // If Fast2SMS is configured, try to send
  if (FAST2SMS_API_KEY) {
    try {
      const url = new URL('https://www.fast2sms.com/dev/bulkV2')
      url.searchParams.set('authorization', FAST2SMS_API_KEY)
      url.searchParams.set('route', 'q')
      url.searchParams.set('message', message)
      url.searchParams.set('flash', '0')
      url.searchParams.set('numbers', cleanNumber)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'cache-control': 'no-cache' },
      })

      const data = await response.json()

      if (data.return) {
        console.log('[FAST2SMS] OTP sent successfully to', cleanNumber)
        return
      }

      // If Fast2SMS fails, log the error and fall through to dev mode
      console.warn('[FAST2SMS] Failed:', data.message || JSON.stringify(data))
    } catch (err) {
      console.warn('[FAST2SMS] Network error:', err)
    }
  }

  // ── Dev mode fallback: log OTP to server console ──────────────────────────
  if (IS_DEV) {
    console.log('\n' + '═'.repeat(50))
    console.log('📱 DEV MODE — OTP for', phone)
    console.log('🔑 Code:', otp)
    console.log('═'.repeat(50) + '\n')
    return // Simulate successful send in dev
  }

  throw new Error('SMS service not available. Please configure Fast2SMS with a ₹100+ balance.')
}

// ── Send OTP via WhatsApp (placeholder) ───────────────────────────────────────
export async function sendOTPWhatsApp(phone: string, otp: string): Promise<void> {
  await sendOTPSMS(phone, otp) // Fallback to SMS
}

// ── Log auth event ────────────────────────────────────────────────────────────
export async function logAuthEvent(params: {
  clinicId: string
  action: string
  userType: string
  doctorId?: string
  phone?: string
  email?: string
  ip?: string
  userAgent?: string
  success: boolean
  reason?: string
}) {
  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.authLog.create({ data: params })
  } catch (err) {
    console.error('[AUTH LOG] Failed to log event:', err)
  }
}
