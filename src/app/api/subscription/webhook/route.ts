export const dynamic = 'force-dynamic';
// src/app/api/subscription/webhook/route.ts
// POST — Stripe + Razorpay webhook handler
// CRITICAL: Subscription ONLY activates via verified webhook — never manually
// Verifies webhook signature before processing

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' as any })

// ── Stripe webhook ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get('provider') ?? 'stripe'

  if (provider === 'stripe') {
    return handleStripeWebhook(req)
  }
  if (provider === 'razorpay') {
    return handleRazorpayWebhook(req)
  }

  return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
}

// ── Stripe ────────────────────────────────────────────────────────────────────
async function handleStripeWebhook(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[STRIPE WEBHOOK] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle relevant events
  switch (event.type) {

    case 'checkout.session.completed': {
      const session  = event.data.object as Stripe.Checkout.Session
      const clinicId = session.metadata?.clinicId
      const planType = session.metadata?.planType

      if (!clinicId || !planType) {
        console.error('[STRIPE] Missing metadata in session')
        break
      }

      await activateSubscription({
        clinicId,
        planType:              planType as any,
        provider:              'stripe',
        providerSubscriptionId: session.subscription as string,
        providerCustomerId:    session.customer as string,
        currentPeriodStart:    new Date(),
        currentPeriodEnd:      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentMetadata:       session as unknown as Record<string, unknown>,
      })
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice       = event.data.object as Stripe.Invoice
      const subscriptionId = (invoice as any).subscription as string
      const subscription  = await stripe.subscriptions.retrieve(subscriptionId)
      const clinicId      = subscription.metadata?.clinicId
      const planType      = subscription.metadata?.planType

      if (!clinicId) break

      await activateSubscription({
        clinicId,
        planType:              planType as any ?? 'STARTER',
        provider:              'stripe',
        providerSubscriptionId: subscriptionId,
        providerCustomerId:    invoice.customer as string,
        currentPeriodStart:    new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd:      new Date((subscription as any).current_period_end * 1000),
        paymentMetadata:       invoice as unknown as Record<string, unknown>,
      })
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const clinicId     = subscription.metadata?.clinicId
      if (!clinicId) break

      await prisma.clinic.update({
        where: { id: clinicId },
        data:  { subscriptionStatus: 'EXPIRED', subscriptionEndsAt: new Date() },
      })
      console.log(`[STRIPE] Subscription expired for clinic ${clinicId}`)
      break
    }
  }

  return NextResponse.json({ received: true })
}

// ── Razorpay ──────────────────────────────────────────────────────────────────
async function handleRazorpayWebhook(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('x-razorpay-signature')!
  const secret    = process.env.RAZORPAY_WEBHOOK_SECRET!

  // Verify HMAC-SHA256 signature
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  if (expectedSig !== signature) {
    console.error('[RAZORPAY WEBHOOK] Signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const payload = JSON.parse(body)
  const event   = payload.event

  switch (event) {

    case 'subscription.activated':
    case 'subscription.charged': {
      const sub       = payload.payload.subscription.entity
      const clinicId  = sub.notes?.clinicId
      const planType  = sub.notes?.planType

      if (!clinicId) break

      await activateSubscription({
        clinicId,
        planType:              planType ?? 'STARTER',
        provider:              'razorpay',
        providerSubscriptionId: sub.id,
        providerCustomerId:    sub.customer_id,
        currentPeriodStart:    new Date(sub.current_start * 1000),
        currentPeriodEnd:      new Date(sub.current_end * 1000),
        paymentMetadata:       payload as Record<string, unknown>,
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

// ── Core activation function — called only from verified webhooks ─────────────
async function activateSubscription(params: {
  clinicId:               string
  planType:               'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  provider:               string
  providerSubscriptionId: string
  providerCustomerId?:    string
  currentPeriodStart:     Date
  currentPeriodEnd:       Date
  paymentMetadata:        any
}) {
  const { clinicId, planType, provider, providerSubscriptionId,
          providerCustomerId, currentPeriodStart, currentPeriodEnd, paymentMetadata } = params

  await prisma.$transaction([
    // Update clinic subscription status
    prisma.clinic.update({
      where: { id: clinicId },
      data:  {
        subscriptionStatus: 'ACTIVE',
        planType,
        subscriptionEndsAt: currentPeriodEnd,
      },
    }),
    // Upsert subscription record
    prisma.subscription.upsert({
      where:  { providerSubscriptionId },
      create: {
        clinicId, status: 'ACTIVE', planType, provider,
        providerSubscriptionId, providerCustomerId,
        currentPeriodStart, currentPeriodEnd, paymentMetadata,
      },
      update: {
        status: 'ACTIVE', planType,
        providerCustomerId, currentPeriodStart, currentPeriodEnd, paymentMetadata,
      },
    }),
  ])

  console.log(`[WEBHOOK] Subscription ACTIVATED for clinic ${clinicId} — Plan: ${planType}`)
}
