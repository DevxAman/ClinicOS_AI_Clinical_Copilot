// src/app/api/subscription/webhook/route.ts
// FIXED: Stripe client initialized inside handler, not at module level

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get('provider') ?? 'stripe'

  if (provider === 'stripe') return handleStripeWebhook(req)
  if (provider === 'razorpay') return handleRazorpayWebhook(req)

  return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
}

// ── Stripe ────────────────────────────────────────────────────────────────────
async function handleStripeWebhook(req: NextRequest) {
  const stripeKey     = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeKey || !webhookSecret) {
    console.error('[STRIPE WEBHOOK] Missing Stripe env vars')
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  // Lazy import
  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' })

  const body      = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let event: any
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[STRIPE WEBHOOK] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session  = event.data.object
      const clinicId = session.metadata?.clinicId
      const planType = session.metadata?.planType
      if (!clinicId || !planType) break

      await activateSubscription({
        clinicId, planType, provider: 'stripe',
        providerSubscriptionId: session.subscription,
        providerCustomerId:     session.customer,
        currentPeriodStart: new Date(),
        currentPeriodEnd:   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentMetadata:    session,
      })
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice        = event.data.object
      const subscriptionId = invoice.subscription
      if (!subscriptionId) break

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const clinicId     = subscription.metadata?.clinicId
      const planType     = subscription.metadata?.planType
      if (!clinicId) break

      await activateSubscription({
        clinicId, planType: planType ?? 'STARTER', provider: 'stripe',
        providerSubscriptionId: subscriptionId,
        providerCustomerId:     invoice.customer,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd:   new Date(subscription.current_period_end   * 1000),
        paymentMetadata:    invoice,
      })
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const clinicId     = subscription.metadata?.clinicId
      if (!clinicId) break
      await prisma.clinic.update({
        where: { id: clinicId },
        data:  { subscriptionStatus: 'EXPIRED', subscriptionEndsAt: new Date() },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}

// ── Razorpay ──────────────────────────────────────────────────────────────────
async function handleRazorpayWebhook(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 503 })
  }

  const body      = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''
  const expected  = crypto.createHmac('sha256', secret).update(body).digest('hex')

  if (expected !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const payload = JSON.parse(body)

  switch (payload.event) {
    case 'subscription.activated':
    case 'subscription.charged': {
      const sub      = payload.payload.subscription.entity
      const clinicId = sub.notes?.clinicId
      const planType = sub.notes?.planType
      if (!clinicId) break

      await activateSubscription({
        clinicId, planType: planType ?? 'STARTER', provider: 'razorpay',
        providerSubscriptionId: sub.id,
        providerCustomerId:     sub.customer_id,
        currentPeriodStart: new Date(sub.current_start * 1000),
        currentPeriodEnd:   new Date(sub.current_end   * 1000),
        paymentMetadata:    payload,
      })
      break
    }

    case 'subscription.cancelled':
    case 'subscription.expired': {
      const sub      = payload.payload.subscription.entity
      const clinicId = sub.notes?.clinicId
      if (!clinicId) break
      await prisma.clinic.update({
        where: { id: clinicId },
        data:  { subscriptionStatus: 'EXPIRED', subscriptionEndsAt: new Date() },
      })
      break
    }
  }

  return NextResponse.json({ status: 'ok' })
}

// ── Activate subscription (only called from verified webhooks) ────────────────
async function activateSubscription(params: {
  clinicId:               string
  planType:               string
  provider:               string
  providerSubscriptionId: string
  providerCustomerId?:    string
  currentPeriodStart:     Date
  currentPeriodEnd:       Date
  paymentMetadata:        unknown
}) {
  const {
    clinicId, planType, provider, providerSubscriptionId,
    providerCustomerId, currentPeriodStart, currentPeriodEnd, paymentMetadata,
  } = params

  await prisma.$transaction([
    prisma.clinic.update({
      where: { id: clinicId },
      data:  {
        subscriptionStatus: 'ACTIVE',
        planType:           planType as any,
        subscriptionEndsAt: currentPeriodEnd,
      },
    }),
    prisma.subscription.upsert({
      where:  { providerSubscriptionId },
      create: {
        clinicId, status: 'ACTIVE', planType: planType as any,
        provider, providerSubscriptionId, providerCustomerId,
        currentPeriodStart, currentPeriodEnd,
        paymentMetadata: paymentMetadata as any,
      },
      update: {
        status: 'ACTIVE', planType: planType as any,
        providerCustomerId, currentPeriodStart, currentPeriodEnd,
        paymentMetadata: paymentMetadata as any,
      },
    }),
  ])

  console.log(`[WEBHOOK] Activated subscription for clinic ${clinicId} — ${planType}`)
}
