// src/app/api/subscription/create-checkout/route.ts
// POST — Create Stripe or Razorpay checkout session
// Only accessible to OWNER role with active/trial subscription
// Install: npm install stripe razorpay

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import Razorpay from 'razorpay'
import { verifyAccessToken, extractTokenFromRequest } from '@/lib/auth/jwt'
import { createCheckoutSchema } from '@/lib/auth/validation'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' as any })

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Plan → price mapping
const STRIPE_PRICES: Record<string, string> = {
  STARTER:      process.env.STRIPE_PRICE_STARTER!,
  PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL!,
  ENTERPRISE:   process.env.STRIPE_PRICE_ENTERPRISE!,
}

const RAZORPAY_PLANS: Record<string, string> = {
  STARTER:      process.env.RAZORPAY_PLAN_STARTER!,
  PROFESSIONAL: process.env.RAZORPAY_PLAN_PROFESSIONAL!,
  ENTERPRISE:   process.env.RAZORPAY_PLAN_ENTERPRISE!,
}

export async function POST(req: NextRequest) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const token   = extractTokenFromRequest(req)
  const payload = token ? await verifyAccessToken(token) : null

  if (!payload || payload.userType !== 'DOCTOR' || payload.role !== 'OWNER') {
    return NextResponse.json({ success: false, error: 'Only clinic owners can manage subscriptions.' }, { status: 403 })
  }

  try {
    const body   = await req.json()
    const parsed = createCheckoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { planType, provider } = parsed.data
    const { clinicId } = payload

    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } })
    if (!clinic) {
      return NextResponse.json({ success: false, error: 'Clinic not found.' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    // ── Stripe checkout ───────────────────────────────────────────────────────
    if (provider === 'stripe') {
      const session = await stripe.checkout.sessions.create({
        mode:               'subscription',
        line_items:         [{ price: STRIPE_PRICES[planType], quantity: 1 }],
        success_url:        `${appUrl}/dashboard?subscribed=true`,
        cancel_url:         `${appUrl}/settings/subscription?cancelled=true`,
        metadata:           { clinicId, planType }, // ← Used in webhook
        customer_email:     clinic.email ?? undefined,
        subscription_data:  { metadata: { clinicId, planType } },
      })

      return NextResponse.json({ success: true, data: { url: session.url, sessionId: session.id } })
    }

    // ── Razorpay subscription ─────────────────────────────────────────────────
    if (provider === 'razorpay') {
      const subscription = await razorpay.subscriptions.create({
        plan_id:           RAZORPAY_PLANS[planType],
        total_count:       12, // 12 months
        notes:             { clinicId, planType }, // ← Used in webhook
      })

      return NextResponse.json({
        success: true,
        data: {
          subscriptionId: subscription.id,
          razorpayKeyId:  process.env.RAZORPAY_KEY_ID,
          clinicName:     clinic.name,
          clinicEmail:    clinic.email,
        },
      })
    }

  } catch (error) {
    console.error('[CREATE CHECKOUT]', error)
    return NextResponse.json({ success: false, error: 'Failed to create checkout session.' }, { status: 500 })
  }
}
