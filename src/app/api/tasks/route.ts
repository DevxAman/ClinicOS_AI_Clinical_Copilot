export const dynamic = 'force-dynamic';
// src/app/api/tasks/route.ts
// GET /api/tasks — Filtered task list
// POST /api/tasks — Create a task manually

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/utils'

import { requireRole, checkSubscription } from '@/lib/auth/middleware-helpers'

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireRole(request, ['OWNER', 'DOCTOR', 'STAFF'])
    if (auth.error) return auth.error
    const { clinicId } = auth.context!

    const subError = await checkSubscription(clinicId)
    if (subError) return subError

    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status') ?? undefined
    const type = searchParams.get('type') ?? undefined
    const priority = searchParams.get('priority') ?? undefined
    const patientId = searchParams.get('patientId') ?? undefined
    const assignedTo = searchParams.get('assignedTo') ?? undefined
    const overdue = searchParams.get('overdue') === 'true'
    const aiGenerated = searchParams.get('aiGenerated')

    const now = new Date()

    const where: any = { clinicId }
    if (status) where.status = status
    if (type) where.type = type
    if (priority) where.priority = priority
    if (patientId) where.patientId = patientId
    if (assignedTo) where.assignedTo = assignedTo
    if (aiGenerated !== null) where.aiGenerated = aiGenerated === 'true'
    if (overdue) {
      where.dueDate = { lt: now }
      where.status = { in: ['PENDING', 'IN_PROGRESS'] }
    }

    // Also auto-update overdue task statuses
    await prisma.task.updateMany({
      where: {
        clinicId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { lt: now },
      },
      data: { status: 'OVERDUE' },
    })

    const tasks = await prisma.task.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, riskScore: true } },
        doctor: { select: { id: true, name: true, role: true } },
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
      ],
    })

    // Group stats
    const stats = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'PENDING').length,
      overdue: tasks.filter((t) => t.status === 'OVERDUE').length,
      completed: tasks.filter((t) => t.status === 'COMPLETED').length,
      byPriority: {
        URGENT: tasks.filter((t) => t.priority === 'URGENT').length,
        HIGH: tasks.filter((t) => t.priority === 'HIGH').length,
        MEDIUM: tasks.filter((t) => t.priority === 'MEDIUM').length,
        LOW: tasks.filter((t) => t.priority === 'LOW').length,
      },
    }

    return apiSuccess({ tasks, stats })
  } catch (error) {
    console.error('[GET /api/tasks]', error)
    return apiError('Failed to fetch tasks')
  }
}

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireRole(request, ['OWNER', 'DOCTOR', 'STAFF'])
    if (auth.error) return auth.error
    const { clinicId } = auth.context!

    const body = await request.json()
    const { title, description, type, priority, dueDate, patientId, assignedTo } = body

    if (!title || !type || !dueDate || !patientId) {
      return apiError('title, type, dueDate, and patientId are required', 400)
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({ where: { id: patientId } })
    if (!patient) return apiError('Patient not found', 404)

    const task = await prisma.task.create({
      data: {
        clinicId,
        title,
        description,
        type,
        priority: priority ?? 'MEDIUM',
        dueDate: new Date(dueDate),
        patientId,
        assignedTo,
        aiGenerated: false,
      },
      include: {
        patient: { select: { name: true } },
        doctor: { select: { name: true } },
      },
    })

    return apiSuccess(task, 201)
  } catch (error) {
    console.error('[POST /api/tasks]', error)
    return apiError('Failed to create task')
  }
}
