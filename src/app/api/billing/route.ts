// src/app/api/billing/route.ts
// GET /api/billing — Billing events with filters and summary

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'
import { requireRole, checkSubscription } from '@/lib/auth/middleware-helpers'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireRole(request, ['OWNER', 'DOCTOR', 'STAFF'])
    if (auth.error) return auth.error
    const { clinicId } = auth.context!

    const subError = await checkSubscription(clinicId)
    if (subError) return subError

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') ?? undefined
    const patientId = searchParams.get('patientId') ?? undefined
    const now = new Date()

    // Auto-mark overdue events
    await prisma.billingEvent.updateMany({
      where: {
        clinicId,
        status: 'PENDING',
        dueDate: { lt: now },
      },
      data: { status: 'OVERDUE' },
    })

    const where: any = { clinicId }
    if (status) where.status = status
    if (patientId) where.patientId = patientId

    const [events, summary] = await Promise.all([
      prisma.billingEvent.findMany({
        where,
        include: {
          patient: { select: { id: true, name: true } },
        },
        orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
      }),
      prisma.billingEvent.groupBy({
        by: ['status'],
        where: { clinicId },
        _sum: { amount: true },
        _count: true,
      }),
    ])

    const summaryMap = summary.reduce<Record<string, { total: number; count: number }>>(
      (acc, s) => {
        acc[s.status] = { total: s._sum.amount ?? 0, count: s._count }
        return acc
      },
      {}
    )

    return apiSuccess({ events, summary: summaryMap })
  } catch (error) {
    console.error('[GET /api/billing]', error)
    return apiError('Failed to fetch billing data')
  }
}
