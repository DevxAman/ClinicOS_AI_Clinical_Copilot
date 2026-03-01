// src/app/api/auth/register/send-otp/route.ts
// POST — Send OTP for phone verification during registration (pre-clinic)
// Dev mode: returns OTP in response + logs to console

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sendOTPSMS } from '@/lib/otp/sms'
import { setOTP } from '@/lib/otp/store'

const IS_DEV = process.env.NODE_ENV === 'development'

// Rate limiter
const rateLimitMap = new Map<string, { count: number; lastSent: number }>()

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const phone = body?.phone

        if (!phone || !/^\+[1-9]\d{6,14}$/.test(phone)) {
            return NextResponse.json(
                { success: false, error: 'Valid phone in international format required (e.g. +919876543210)' },
                { status: 400 }
            )
        }

        // Rate limit
        const now = Date.now()
        const rateData = rateLimitMap.get(phone)
        if (rateData) {
            if (now - rateData.lastSent < 30000) {
                return NextResponse.json({ success: false, error: 'Please wait 30 seconds before requesting another OTP.' }, { status: 429 })
            }
            if (rateData.count >= 5 && now - rateData.lastSent < 300000) {
                return NextResponse.json({ success: false, error: 'Too many OTP requests. Try again in 5 minutes.' }, { status: 429 })
            }
        }

        // Generate & hash OTP
        const otp = generateOTP()
        const otpHash = await bcrypt.hash(otp, 10)

        // Store in shared module store (2-min expiry)
        setOTP(phone, otpHash, now + 120000)

        // Update rate limit
        rateLimitMap.set(phone, { count: (rateData?.count ?? 0) + 1, lastSent: now })

        // Send SMS (falls back to console in dev mode)
        await sendOTPSMS(phone, otp)

        // Response
        const response: Record<string, unknown> = { success: true, message: 'OTP sent successfully.' }
        if (IS_DEV) {
            response.devOTP = otp
            response.devNote = 'DEV MODE: OTP shown here for testing. Also logged on server console.'
        }

        return NextResponse.json(response)
    } catch (error: unknown) {
        console.error('[REGISTER OTP SEND]', error)
        const msg = error instanceof Error ? error.message : 'Failed to send OTP'
        return NextResponse.json({ success: false, error: msg }, { status: 500 })
    }
}
