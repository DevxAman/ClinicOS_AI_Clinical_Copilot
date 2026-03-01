// src/lib/otp/otp.ts
// OTP generation, hashing, storage, and verification
// Strict 1-minute expiry, max 3 attempts, bcrypt hashed codes

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// ── Generate 6-digit OTP ─────────────────────────────────────────────────────
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ── Create and store OTP ─────────────────────────────────────────────────────
export async function createOTP(params: {
  clinicId:  string
  phone:     string
  doctorId?: string
  patientId?: string
}): Promise<string> {
  const code = generateOTP()

  // Invalidate any existing unused OTPs for this phone+clinic
  await prisma.oTPCode.updateMany({
    where: { phone: params.phone, clinicId: params.clinicId, used: false },
    data:  { used: true },
  })

  // Hash the OTP before storing (never store plain text)
  const hashedCode = await bcrypt.hash(code, 10)

  await prisma.oTPCode.create({
    data: {
      clinicId:  params.clinicId,
      phone:     params.phone,
      code:      hashedCode,
      doctorId:  params.doctorId,
      patientId: params.patientId,
      expiresAt: new Date(Date.now() + 60 * 1000), // STRICT 1 minute
      used:      false,
      attempts:  0,
    },
  })

  return code // Return plain code to send via SMS
}

// ── Verify OTP ───────────────────────────────────────────────────────────────
export async function verifyOTP(params: {
  clinicId: string
  phone:    string
  code:     string
}): Promise<{ success: boolean; reason?: string }> {

  // Find most recent unused OTP for this phone+clinic
  const otpRecord = await prisma.oTPCode.findFirst({
    where: {
      phone:    params.phone,
      clinicId: params.clinicId,
      used:     false,
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!otpRecord) {
    return { success: false, reason: 'No active OTP found. Please request a new one.' }
  }

  // Check expiry (1 minute strict)
  if (otpRecord.expiresAt < new Date()) {
    await prisma.oTPCode.update({ where: { id: otpRecord.id }, data: { used: true } })
    return { success: false, reason: 'OTP expired. Please request a new one.' }
  }

  // Check max attempts (3)
  if (otpRecord.attempts >= 3) {
    await prisma.oTPCode.update({ where: { id: otpRecord.id }, data: { used: true } })
    return { success: false, reason: 'Too many failed attempts. Please request a new OTP.' }
  }

  // Verify hashed code
  const isValid = await bcrypt.compare(params.code, otpRecord.code)

  if (!isValid) {
    // Increment attempts
    await prisma.oTPCode.update({
      where: { id: otpRecord.id },
      data:  { attempts: { increment: 1 } },
    })
    const remaining = 2 - otpRecord.attempts
    return { success: false, reason: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` }
  }

  // Mark as used
  await prisma.oTPCode.update({ where: { id: otpRecord.id }, data: { used: true } })
  return { success: true }
}

// ── Rate limit check: max 3 OTP sends per phone per 10 minutes ───────────────
export async function checkOTPRateLimit(phone: string, clinicId: string): Promise<boolean> {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
  const count = await prisma.oTPCode.count({
    where: {
      phone,
      clinicId,
      createdAt: { gte: tenMinutesAgo },
    },
  })
  return count < 3 // true = allowed, false = rate limited
}
