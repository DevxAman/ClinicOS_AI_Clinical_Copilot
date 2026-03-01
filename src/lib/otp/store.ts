// src/lib/otp/store.ts
// Shared in-memory OTP store for registration (pre-clinic, no DB)
// In production, replace with Redis

const pendingOTPs = new Map<string, { hash: string; expiresAt: number }>()

export function setOTP(phone: string, hash: string, expiresAt: number) {
    pendingOTPs.set(phone, { hash, expiresAt })
}

export function getOTP(phone: string) {
    return pendingOTPs.get(phone)
}

export function deleteOTP(phone: string) {
    pendingOTPs.delete(phone)
}
