export const dynamic = 'force-dynamic';
// src/app/api/auth/register/verify-otp/route.ts
// POST — Verify OTP for phone verification during registration

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getOTP, deleteOTP } from '@/lib/otp/store'

export async function POST(req: NextRequest) {
    try {
        const { phone, code } = await req.json()

        if (!phone || !code) {
            return NextResponse.json({ success: false, error: 'Phone and code are required.' }, { status: 400 })
        }
        if (code.length !== 6 || !/^\d{6}$/.test(code)) {
            return NextResponse.json({ success: false, error: 'OTP must be exactly 6 digits.' }, { status: 400 })
        }

        const pending = getOTP(phone)

        if (!pending) {
            return NextResponse.json(
                { success: false, error: 'No OTP found for this number. Please request a new one.' },
                { status: 404 }
            )
        }

        // Check expiry
        if (Date.now() > pending.expiresAt) {
            deleteOTP(phone)
            return NextResponse.json(
                { success: false, error: 'OTP has expired. Please request a new one.' },
                { status: 410 }
            )
        }

        // Verify
        const valid = await bcrypt.compare(code, pending.hash)
        if (!valid) {
            return NextResponse.json(
                { success: false, error: 'Invalid OTP. Please try again.' },
                { status: 401 }
            )
        }

        // Success
        deleteOTP(phone)
        return NextResponse.json({ success: true, verified: true })
    } catch (error) {
        console.error('[REGISTER OTP VERIFY]', error)
        return NextResponse.json(
            { success: false, error: 'Verification failed. Please try again.' },
            { status: 500 }
        )
    }
}
