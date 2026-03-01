// src/app/api/subscription/create-checkout/route.ts
// FIXED: Stripe and Razorpay clients are initialized INSIDE the handler
// not at module level — so missing env vars don't crash the build

import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, extractTokenFromRequest } from '@/lib/auth/jwt'
import { createCheckoutSchema } from '@/lib/auth/validation'
import { prisma } from '@/lib/prisma'

const STRIPE_PRICES: Record<string, string> = {
  STARTER:      process.env.STRIPE_PRICE_STARTER      ?? '',
  PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL ?? '',
  ENTERPRISE:   process.env.STRIPE_PRICE_ENTERPRISE   ?? '',
}

const RAZORPAY_PLANS: Record<string, string> = {
  STARTER:      process.env.RAZORPAY_PLAN_STARTER      ?? '',
  PROFESSIONAL: process.env.RAZORPAY_PLAN_PROFESSIONAL ?? '',
  ENTERPRISE:   process.env.RAZORPAY_PLAN_ENTERPRISE   ?? '',
}

export async function POST(req: NextRequest) {
  // ── Auth: OWNER only ─────────────────────────────────────────────────────
  const token   = extractTokenFromRequest(req)
  const payload = token ? await verifyAccessToken(token) : null

  if (!payload || payload.userType !== 'DOCTOR' || payload.role !== 'OWNER') {
    return NextResponse.json(
      { success: false, error: 'Only clinic owners can manage subscriptions.' },
      { status: 403 }
    )
  }

  try {
    const body   = await req.json()
    const parsed = createCheckoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { planType, provider } = parsed.data
    const { clinicId } = payload

    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } })
    if (!clinic) {
      return NextResponse.json({ success: false, error: 'Clinic not found.' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://clinicos-graph.vercel.app'

    // ── Stripe ──────────────────────────────────────────────────────────────
    if (provider === 'stripe') {
      const stripeKey = process.env.STRIPE_SECRET_KEY
      if (!stripeKey) {
        return NextResponse.json(
          { success: false, error: 'Stripe is not configured yet. Please contact support.' },
          { status: 503 }
        )
      }

      // Lazy import — only loaded when actually called at runtime
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' })

      const session = await stripe.checkout.sessions.create({
        mode:       'subscription',
        line_items: [{ price: STRIPE_PRICES[planType], quantity: 1 }],
        success_url: `${appUrl}/dashboard?subscribed=true`,
        cancel_url:  `${appUrl}/settings/subscription?cancelled=true`,
        metadata:    { clinicId, planType },
        customer_email: clinic.email ?? undefined,
        subscription_data: { metadata: { clinicId, planType } },
      })

      return NextResponse.json({
        success: true,
        data: { url: session.url, sessionId: session.id },
      })
    }

    // ── Razorpay ─────────────────────────────────────────────────────────
    if (provider === 'razorpay') {
      const rzpKeyId  = process.env.RAZORPAY_KEY_ID
      const rzpSecret = process.env.RAZORPAY_KEY_SECRET

      if (!rzpKeyId || !rzpSecret) {
        return NextResponse.json(
          { success: false, error: 'Razorpay is not configured yet. Please contact support.' },
          { status: 503 }
        )
      }

      // Lazy import — only loaded when actually called at runtime
      const Razorpay = (await import('razorpay')).default
      const razorpay = new Razorpay({ key_id: rzpKeyId, key_secret: rzpSecret })

      const subscription = await razorpay.subscriptions.create({
        plan_id:     RAZORPAY_PLANS[planType],
        total_count: 12,
        notes:       { clinicId, planType },
      })

      return NextResponse.json({
        success: true,
        data: {
          subscriptionId: subscription.id,
          razorpayKeyId:  rzpKeyId,
          clinicName:     clinic.name,
          clinicEmail:    clinic.email,
        },
      })
    }

    return NextResponse.json({ success: false, error: 'Invalid provider.' }, { status: 400 })

  } catch (error) {
    console.error('[CREATE CHECKOUT]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session.' },
      { status: 500 }
    )
  }
}
