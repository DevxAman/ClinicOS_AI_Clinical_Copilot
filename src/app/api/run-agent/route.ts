export const dynamic = 'force-dynamic';
// src/app/api/run-agent/route.ts
// POST /api/run-agent — Execute the AI Operations Agent
// This is the core of ClinicOS: queries DB → calls AI → creates tasks → logs everything

import { NextRequest, NextResponse } from 'next/server'
import { runAgent } from '@/lib/agent'
import { apiSuccess, apiError } from '@/lib/utils'
import { requireRole, checkSubscription } from '@/lib/auth/middleware-helpers'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireRole(request, ['OWNER', 'DOCTOR'])
    if (auth.error) return auth.error
    const { clinicId } = auth.context!

    const subError = await checkSubscription(clinicId)
    if (subError) return subError

    const body = await request.json().catch(() => ({}))
    const triggerType = body.triggerType ?? 'MANUAL'

    console.log(`[Agent] Starting agent run — trigger: ${triggerType}`)
    const startTime = Date.now()

    const result = await runAgent(clinicId, triggerType)

    console.log(`[Agent] Completed in ${Date.now() - startTime}ms`)
    console.log(`[Agent] Tasks created: ${result.tasksCreated}`)
    console.log(`[Agent] Risk updates: ${result.riskUpdates}`)

    return apiSuccess(result)
  } catch (error) {
    console.error('[POST /api/run-agent]', error)
    const message = error instanceof Error ? error.message : 'Agent execution failed'
    return apiError(message)
  }
}

// GET for fetching recent agent logs
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireRole(request, ['OWNER', 'DOCTOR'])
    if (auth.error) return auth.error
    const { clinicId } = auth.context!

    const { prisma } = await import('@/lib/prisma')
    const { searchParams } = new URL(request.url)
    const limit = Math.min(20, parseInt(searchParams.get('limit') ?? '10'))

    const logs = await prisma.agentLog.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return apiSuccess({ logs })
  } catch (error) {
    console.error('[GET /api/run-agent]', error)
    return apiError('Failed to fetch agent logs')
  }
}
